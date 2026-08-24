/* ============================================================
   CONFIG — the only file you edit each year.
   ------------------------------------------------------------
   No logic here. Change the case, the rooms, the postcard codes
   (with their clues + coordinate fragments) and the destination.

   NOTE: the login PASSWORD is NOT here — it lives on the server
   (Vercel environment variable), so nobody can read it in the
   browser. See /api/login.js and README.
   ============================================================ */

const CONFIG = {
  caseNumber: "Case #2026",
  year: 2026,

  // Final destination revealed at the end.
  destination: {
    name: "Disneyland Paris",
    lat: "48.8726",
    lng: "2.7767",
  },

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

  // Six postcards. Their fragments together build 48.8726 , 2.7767
  //   fragment.axis:  "lat" | "lng"
  //   fragment.at:    0-based DIGIT index (the "." doesn't count)
  //                   where `value` starts.
  //   fragment.value: the digits themselves — at most 2, and they
  //                   must sit flush against an edge of the number
  //                   OR leave a gap of 2+ hidden digits on both
  //                   sides (never a lone 1-digit gap).
  //   "confirm" is a postcard that carries only a clue, no digits.
  //
  //   lat "48.8726" (digits 4 8 8 7 2 6 — index 0..5):
  //     bedroom at 0 → "48"   dining at 2 → "87"   kitchen at 4 → "26"
  //     (every digit covered, none left out)
  //   lng "2.7767" (digits 2 7 7 6 7 — index 0..4):
  //     laundry at 0 → "2"   basement at 1 → "77"   living at 3 → "67"
  //     (every digit covered — but basement sits right after laundry's
  //      single digit, with no buffer between them)
  codes: [
    {
      code: "8802",
      locationId: "bedroom",
      clue: "A magical place",
      fragment: { axis: "lat", at: 0, value: "48" },
    },
    {
      code: "1093",
      locationId: "kitchen",
      clue: "Not in Spain",
      fragment: { axis: "lat", at: 4, value: "26" },
    },
    {
      code: "2264",
      locationId: "laundry",
      clue: "Best enjoyed together",
      fragment: { axis: "lng", at: 0, value: "2" },
    },
    {
      code: "4571",
      locationId: "living",
      clue: "Requires walking",
      fragment: { axis: "lng", at: 3, value: "67" },
    },
    {
      code: "6619",
      locationId: "dining",
      clue: "Famous characters",
      fragment: { axis: "lat", at: 2, value: "87" },
    },
    {
      code: "3390",
      locationId: "basement",
      clue: "A castle is involved",
      fragment: { axis: "lng", at: 1, value: "77" },
    },
  ],
};

// Total postcards to find (derived — don't edit).
CONFIG.total = CONFIG.codes.length;
