/* ============================================================
   STATE — progress saved in localStorage.
   ------------------------------------------------------------
   Progress is just the list of found codes. Everything else
   (which rooms are done, the clues, the coordinates) is derived
   from that list, so the stored data stays tiny and robust.
   ============================================================ */

const STORAGE_KEY = "happyduck.progress.v1";

const State = {
  /** Read the found-codes array from localStorage. */
  getFound() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /** Save the found-codes array. */
  _save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  },

  /** Look up a postcard by its code. Returns the code object or null. */
  findCode(input) {
    const value = String(input).trim().toLowerCase();
    return CONFIG.codes.find((c) => c.code.toLowerCase() === value) || null;
  },

  /**
   * Try a code.
   * → { ok:true, clue, locationId, already:false } on first success
   * → { ok:true, ..., already:true } if it was already found
   * → { ok:false } if the code is invalid
   */
  verify(input) {
    const match = this.findCode(input);
    if (!match) return { ok: false };

    const found = this.getFound();
    if (found.includes(match.code)) {
      return { ok: true, clue: match.clue, locationId: match.locationId, already: true };
    }
    found.push(match.code);
    this._save(found);
    return { ok: true, clue: match.clue, locationId: match.locationId, already: false };
  },

  /** Wipe all progress. */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  },

  /** How many postcards found. */
  count() {
    return this.getFound().length;
  },

  /** Whole thing solved? */
  isComplete() {
    return this.count() >= CONFIG.total;
  },

  /** Percentage 0–100. */
  completion() {
    return Math.round((this.count() / CONFIG.total) * 100);
  },

  /** Set of location ids that have at least one found postcard. */
  investigatedIds() {
    const found = this.getFound();
    const ids = found.map((c) => this.findCode(c)?.locationId).filter(Boolean);
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

  /** String-indices of `destStr` that hold a digit, left to right (skips the dot). */
  _digitPositions(destStr) {
    const positions = [];
    for (let i = 0; i < destStr.length; i++) {
      if (destStr[i] !== ".") positions.push(i);
    }
    return positions;
  },

  /**
   * Reveal only the digits earned so far on one axis. Every digit
   * starts as "_"; each found fragment (other than a plain
   * "confirm" clue) fills in its slice, addressed by `at` (a
   * 0-based digit index — NOT a string index, so it isn't thrown
   * off by the "." ) and `value` (the digits themselves).
   */
  _revealAxis(destStr, frags, axis) {
    const chars = Array.from(destStr, (c) => (c === "." ? "." : "_"));
    const digitPositions = this._digitPositions(destStr);
    frags
      .filter((f) => f.axis === axis && f.value !== "confirm")
      .forEach((f) => {
        for (let i = 0; i < f.value.length; i++) {
          const strIdx = digitPositions[f.at + i];
          if (strIdx !== undefined) chars[strIdx] = f.value[i];
        }
      });
    return chars.join("");
  },

  /**
   * Build the currently-known coordinates. Every digit starts
   * hidden ("_") and is revealed one fragment at a time as
   * postcards are found, so the dashboard fills in gradually.
   */
  coordinates() {
    if (this.isComplete()) {
      return { lat: CONFIG.destination.lat, lng: CONFIG.destination.lng };
    }
    const frags = this.getFound().map((c) => this.findCode(c)?.fragment).filter(Boolean);

    return {
      lat: this._revealAxis(CONFIG.destination.lat, frags, "lat"),
      lng: this._revealAxis(CONFIG.destination.lng, frags, "lng"),
    };
  },
};
