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
export const CHAT_ID_PREFIX = 1621;
export const MIN_HEIGHT = 100;
export const MIN_WIDTH = 100;
export const SCOOBY = "media/scooby-no.jpg";
export const SCOOBY_VID = "media/scooby-ruh-roh.gif";
export const SCOOBY_SNIFFING = "media/scooby-sniffing.gif"
export const SCOOBY_SLEEPING = "media/scooby-sleeping.webp"
export const BACKEND_URL = "http://172.232.7.65:4000";

