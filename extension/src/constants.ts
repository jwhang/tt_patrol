export const NAUGHTYLIST = [
  "airline[s]?",
  "business class",
  "first class",
  "flew",
  "flight[s]?",
  "fly?",
  "hotel[s]?",
  "jetlag",
  "layover",
  "plane[s]?",
  "timezone[s]?",
  "travel[s]?",
  "trip[s]?",
  "TZ",
].map((word) => "\\b" + word + "\\b");
export const MIN_NUM_WORDS = 4; // Text must be at least MIN_NUM_WORDS to be analyzed for naughtiness.
export const REDACTED_MSG = "Redacted: ";
export const CHAT_ID = 1621389464744799;
export const MIN_HEIGHT = 100;
export const MIN_WIDTH = 100;
export const SCOOBY =
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/39cc0698-a3f5-4dd3-9348-a768db8365e8/dgh3iad-c1c63437-27e4-473c-b589-8a81d3257712.gif/v1/fill/w_500,h_375,q_85,strp/scooby_doo_no_by_johnwood2001_dgh3iad-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9Mzc1IiwicGF0aCI6IlwvZlwvMzljYzA2OTgtYTNmNS00ZGQzLTkzNDgtYTc2OGRiODM2NWU4XC9kZ2gzaWFkLWMxYzYzNDM3LTI3ZTQtNDczYy1iNTg5LThhODFkMzI1NzcxMi5naWYiLCJ3aWR0aCI6Ijw9NTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.7DRqkoiovalRCgkJwL-Y9B4bLgsEWhRCkm80k23t_1Q";
//export const BACKEND_URL = "http://172.232.7.65:4000";
export const BACKEND_URL = "http://localhost:4000";

