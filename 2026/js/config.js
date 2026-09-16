/* ============================================================
   CONFIG — the only file you edit each year.
   ------------------------------------------------------------
   No logic here. Change the case, the rooms, and the postcards
   (code + clue + the slice of a codeword each one reveals).

   2026 runs TWO parallel cases: two gifts, in two places. Each
   case is locked behind a codeword that fills in letter by
   letter as its postcards are found — and can be unlocked early
   by simply guessing it.

   NOTE: the login PASSWORD is NOT here — it lives on the server
   (Vercel environment variable), so nobody can read it in the
   browser. See /api/login.js and README.
   ============================================================ */

const CONFIG = {
  caseNumber: "Case #2026",
  year: 2026,

  /* ---- The two cases --------------------------------------
     `word`    the codeword, revealed a slice at a time.
     `accept`  guesses that count as correct. Compared after
               lowercasing, stripping accents and dropping a
               leading article, so "Perfume", "perfumería" and
               "el perfume" all land on the same entry.
     `reveal`  what the final screen shows once it's unlocked.

     `mapsQuery` is fed to Google Maps as a plain search string,
     so it works without coordinates. Wecandoo only sends the
     exact street address after booking — swap it in here once
     you have it, and this keeps working either way.

     `siteUrl` points at the artisan's own site on purpose. The
     booking page shows the price, which is not what you want
     the birthday girl reading at the reveal.
  --------------------------------------------------------- */
  cases: [
    {
      id: "a",
      label: "Case A",
      codename: "THE WORKBENCH",
      word: "LEATHER",
      accept: [
        "leather",
        "leather bag",
        "leatherwork",
        "cuero",
        "piel",
        "bolso",
        "bolso de cuero",
        "sac",
        "cuir",
        "maroquinerie",
      ],
      reveal: {
        title: "Leather workshop with Keren",
        kicker: "Three hours, one bag, made by you",
        body:
          "In Keren's atelier you pick your design — bucket bag, shoulder bag or fanny pack — choose the leather and its colour, cut the pattern, punch it, set the rivets and assemble the strap.",
        takeaway: "You leave wearing the bag you made.",
        where: "Keriko Studio — Uccle, Brussels",
        transport: "5 min from Churchill (M3), or the Brunard stop on bus 60",
        mapsQuery: "Keriko Studio, Uccle, Brussels",
        siteUrl: "https://keriko.studio/",
      },
    },
    {
      id: "b",
      label: "Case B",
      codename: "THE ORGAN",
      word: "PERFUME",
      accept: [
        "perfume",
        "perfumery",
        "natural perfumery",
        "perfumeria",
        "perfumeria natural",
        "parfum",
        "parfumerie",
        "fragrance",
        "fragancia",
      ],
      reveal: {
        title: "Natural perfumery with Lamia",
        kicker: "Three hours at the perfumer's organ",
        body:
          "Lamia opens with the history of perfume, the rare natural essences, the olfactory pyramid and the vocabulary of blind smelling. Then you choose your notes, test your blends, weigh the final formula and fill the bottle yourself.",
        takeaway: "You leave with your own 30 ml. Nobody else has it.",
        where: "Les Squares district, Brussels",
        transport: "Right by the Michel-Ange bus stop",
        mapsQuery: "Lamia Mathis parfumeur, Rue Franklin 95, 1000 Bruxelles",
        siteUrl: "https://lamiamathis.com/",
      },
    },
  ],

  // The rooms. `photo` is the real room photo shown on its card + modal.
  locations: [
    {
      id: "kitchen",
      name: "Kitchen",
      description:
        "Happy Duck may have visited this place. Look around and you might find something.",
      photo: "assets/kitchen.png",
    },
    {
      id: "living",
      name: "Living Room",
      description:
        "Cushions and shelves are perfect hiding spots for a small postcard.",
      photo: "assets/living.png",
    },
    {
      id: "bedroom",
      name: "Bedroom",
      description:
        "Drawers, shelves and under the pillow — plenty of places to tuck a postcard.",
      photo: "assets/bedroom.png",
    },
    {
      id: "laundry",
      name: "Laundry Room",
      description:
        "Behind the detergent or inside the basket — search carefully.",
      photo: "assets/laundry.png",
    },
    {
      id: "dining",
      name: "Dining Room",
      description:
        "A quiet room where a postcard could rest behind the plates.",
      photo: "assets/dining.png",
    },
    {
      id: "basement",
      name: "Basement",
      description: "Dark, quiet and full of forgotten boxes. Worth a look.",
      photo: "assets/basement.png",
    },
  ],

  /* ---- Six postcards, three per case -----------------------
     fragment.at:    0-based index into that case's `word`
     fragment.value: the letters revealed at that position

       LEATHER  →  LE (0) · AT (2) · HER (4)
       PERFUME  →  PE (0) · RF (2) · UME (4)

     The two cases interleave across the rooms on purpose, so
     both words fill in gradually instead of one finishing first.
  --------------------------------------------------------- */
  codes: [
    {
      code: "4182",
      locationId: "bedroom",
      caseId: "a",
      clue: "It begins as a flat sheet and ends up with a shape.",
      fragment: { at: 0, value: "LE" },
    },
    {
      code: "7365",
      locationId: "kitchen",
      caseId: "b",
      clue:
        "That one we brought back from Korea? This time you make it yourself.",
      fragment: { at: 0, value: "PE" },
    },
    {
      code: "2914",
      locationId: "laundry",
      caseId: "a",
      clue: "You choose the colour. And the shape. And you cut it yourself.",
      fragment: { at: 2, value: "AT" },
    },
    {
      code: "8507",
      locationId: "living",
      caseId: "b",
      clue: "Thirty millilitres that nobody else in the world will have.",
      fragment: { at: 2, value: "RF" },
    },
    {
      code: "6273",
      locationId: "basement",
      caseId: "a",
      clue: "Three hours, a hammer, and something you'll carry for years.",
      fragment: { at: 4, value: "HER" },
    },
    {
      code: "5048",
      locationId: "dining",
      caseId: "b",
      clue:
        "You'll be asked to describe a smell without naming what it comes from.",
      fragment: { at: 4, value: "UME" },
    },
  ],
};

/* ---- Derived (don't edit) --------------------------------- */
CONFIG.total = CONFIG.codes.length;
CONFIG.caseById = (id) => CONFIG.cases.find((c) => c.id === id) || null;
CONFIG.codesForCase = (id) => CONFIG.codes.filter((c) => c.caseId === id);
