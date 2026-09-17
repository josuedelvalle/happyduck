/* ============================================================
   STATE — progress saved in localStorage.
   ------------------------------------------------------------
   Two things are stored: the codes found, and the cases she has
   correctly named. Everything else (rooms done, clues, how much
   of each codeword is visible) is derived from those two lists,
   so the stored data stays tiny and robust.

   Naming a case is credit, not a shortcut: it does NOT open the
   file. Only finding all of that case's postcards does. That way
   guessing stays fun without letting her skip half the house.

   v2 changed the shape from a bare array to { found, solved },
   so the key is versioned — an old v1 progress simply doesn't
   load instead of crashing the page.
   ============================================================ */

const STORAGE_KEY = "happyduck.progress.v2";

const State = {
  /* ---- Raw storage ----------------------------------------- */

  /** Read { found, solved } from localStorage, always well-formed. */
  getProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return {
        found: Array.isArray(parsed?.found) ? parsed.found : [],
        solved: Array.isArray(parsed?.solved) ? parsed.solved : [],
      };
    } catch {
      return { found: [], solved: [] };
    }
  },

  _save(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  },

  /** Codes found so far. */
  getFound() {
    return this.getProgress().found;
  },

  /**
   * Cases she has correctly named, as { caseId, foundAt } where
   * foundAt is how many of that case's postcards she had at the
   * time — that's what earns the "called it with 2 of 3" credit.
   * Older entries were bare id strings; normalise them here so a
   * saved game from before this change still loads.
   */
  getSolved() {
    return this.getProgress().solved.map((entry) =>
      typeof entry === "string"
        ? { caseId: entry, foundAt: null }
        : entry,
    );
  },

  /** Wipe all progress. */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  },

  /* ---- Postcards ------------------------------------------- */

  /** Look up a postcard by its code. Returns the code object or null. */
  findCode(input) {
    const value = String(input).trim().toLowerCase();
    return CONFIG.codes.find((c) => c.code.toLowerCase() === value) || null;
  },

  /**
   * Try a code.
   * → { ok:true, clue, locationId, caseId, already:false } on first success
   * → { ok:true, ..., already:true } if it was already found
   * → { ok:false } if the code is invalid
   */
  verify(input) {
    const match = this.findCode(input);
    if (!match) return { ok: false };

    const progress = this.getProgress();
    const already = progress.found.includes(match.code);
    if (!already) {
      progress.found.push(match.code);
      this._save(progress);
    }
    return {
      ok: true,
      already,
      clue: match.clue,
      locationId: match.locationId,
      caseId: match.caseId,
    };
  },

  /* ---- Guessing a case ------------------------------------- */

  /**
   * Normalise a guess so near-misses still count: lowercase,
   * strip accents, collapse whitespace, drop a leading article.
   * "  El Perfume " and "perfumería" both reduce to something
   * the accept list can match.
   */
  _normalise(text) {
    return String(text)
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // combining accents
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^(the|a|an|el|la|los|las|un|una|le|les|du|de)\s+/, "")
      .trim();
  },

  /**
   * Try to unlock a case by naming it.
   * → { ok:true, already:boolean } when the guess is accepted
   * → { ok:false } otherwise
   */
  guess(caseId, input) {
    const theCase = CONFIG.caseById(caseId);
    if (!theCase) return { ok: false };

    const value = this._normalise(input);
    if (!value) return { ok: false };

    const accepted = [theCase.word, ...(theCase.accept || [])].map((a) =>
      this._normalise(a),
    );
    if (!accepted.includes(value)) return { ok: false };

    const progress = this.getProgress();
    const already = this.isCaseGuessed(caseId);
    if (!already) {
      progress.solved.push({
        caseId,
        foundAt: this.countForCase(caseId),
      });
      this._save(progress);
    }
    return { ok: true, already };
  },

  /* ---- Per-case progress ----------------------------------- */

  /** Codes found that belong to this case. */
  foundForCase(caseId) {
    return this.getFound()
      .map((c) => this.findCode(c))
      .filter((c) => c && c.caseId === caseId);
  },

  countForCase(caseId) {
    return this.foundForCase(caseId).length;
  },

  totalForCase(caseId) {
    return CONFIG.codesForCase(caseId).length;
  },

  /** All of this case's postcards found? */
  isCaseComplete(caseId) {
    return this.countForCase(caseId) >= this.totalForCase(caseId);
  },

  /** Has she named this case correctly? Credit only — see below. */
  isCaseGuessed(caseId) {
    return this.getSolved().some((s) => s.caseId === caseId);
  },

  /** How many postcards she had when she named it (null if never). */
  guessedAt(caseId) {
    const entry = this.getSolved().find((s) => s.caseId === caseId);
    return entry ? entry.foundAt : null;
  },

  /**
   * Is the file open? Postcards only. Naming the case does not
   * unlock it — otherwise a lucky guess on clue one would make
   * the other five postcards pointless to go and find.
   */
  isCaseRevealed(caseId) {
    return this.isCaseComplete(caseId);
  },

  /**
   * The codeword as it currently reads. Every letter starts as
   * "_" and each found postcard fills in its slice, addressed by
   * `at` (index into the word) and `value` (the letters). Once
   * the case is unlocked the whole word is returned.
   */
  wordFor(caseId) {
    const theCase = CONFIG.caseById(caseId);
    if (!theCase) return "";
    if (this.isCaseRevealed(caseId)) return theCase.word;

    const letters = Array.from(theCase.word, () => "_");
    this.foundForCase(caseId).forEach(({ fragment }) => {
      if (!fragment) return;
      for (let i = 0; i < fragment.value.length; i++) {
        const idx = fragment.at + i;
        if (idx < letters.length) letters[idx] = fragment.value[i];
      }
    });
    return letters.join("");
  },

  /* ---- Overall progress ------------------------------------ */

  /** How many postcards found, across both cases. */
  count() {
    return this.getFound().length;
  },

  /** Both cases unlocked? */
  isComplete() {
    return CONFIG.cases.every((c) => this.isCaseRevealed(c.id));
  },

  /** Percentage 0–100, by postcards found. */
  completion() {
    return Math.round((this.count() / CONFIG.total) * 100);
  },

  /* ---- Rooms and clues ------------------------------------- */

  /** Set of location ids that have at least one found postcard. */
  investigatedIds() {
    const ids = this.getFound()
      .map((c) => this.findCode(c)?.locationId)
      .filter(Boolean);
    return Array.from(new Set(ids));
  },

  isInvestigated(id) {
    return this.investigatedIds().includes(id);
  },

  /** All clues discovered so far, in order found. */
  clues() {
    return this.getFound()
      .map((c) => this.findCode(c)?.clue)
      .filter(Boolean);
  },
};
