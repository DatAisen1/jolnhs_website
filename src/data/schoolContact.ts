// Centralized contact details for Julia Ortiz Luis National High School.
//
// WHY THIS FILE EXISTS: the Footer used to hardcode its own copy of the
// school's address, which had quietly drifted out of sync with the
// canonical address in `quickFacts.ts` (missing a comma, reading as two
// towns run together). Any component that needs contact info should
// import it from here — one edit updates the whole site instead of
// hunting through components for the second (or third) hardcoded copy.
export const schoolContact = {
  address: "Sagaba, Santo Domingo, Nueva Ecija, Philippines",
  email: "julia.ortiz1945@gmail.com",
  facebookHandle: "jolnhs300814official",
  facebookUrl: "https://www.facebook.com/jolnhs300814official",
  // "Search" URL (not a raw lat/lng link) so it resolves correctly even
  // if the school's exact map pin ever needs adjusting — no coordinates
  // to keep in sync here.
  mapsDirectionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Julia+Ortiz+Luis+National+High+School",
};