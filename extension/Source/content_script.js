const NAUGHTYLIST = [
  "airline[s]?",
  "business class",
  "first class",
  "fly?",
  "flight[s]?",
  "hotel[s]?",
  "jetlag",
  "plane[s]?",
  "timezone[s]?",
  "travel[s]?",
  "TZ",
  "trip[s]?",
  "layover",
].map((word) => "\\b" + word + "\\b");
const MIN_NUM_WORDS = 4; // Text must be at least MIN_NUM_WORDS to be analyzed for naughtiness.
const REDACTED_MSG = "Redacted: ";
const CHAT_ID = 1621389464744799;

images = [];

// Set up MutationObserver to monitor added nodes.
const config = {
  attributes: false,
  childList: true,
  subtree: true,
};
const callback = (mutationList, observer) => {
  mutationList.forEach((record) => {
    // Only patrol if correct chat.
    if (isLasChicas(window.location)) {
      record.addedNodes.forEach((node) => {
        // Defer patrol() because TreeWalking and Regex matching are expensive.
        requestIdleCallback(() => patrol(node));
      });
    }
  });
};

const observer = new MutationObserver(callback);
observer.observe(document.body, config);

// Search for all subnodes of Text type which may need to be redacted.
function patrol(node) {
  patrolImages(node);
  patrolText(node);
}

// Patrol helper functions

function patrolImages(node) {
  MIN_HEIGHT = 250;
  MIN_WIDTH = 250;
  var imgs = node.getElementsByTagName("img");
  Array.from(imgs).forEach((img) => {
    if (img.visited === true) {
      return;
    }

    // Discard small images.
    if (img.height < MIN_HEIGHT || img.width < MIN_WIDTH) {
      return;
    }

    console.log(img.src);
    img.visited = true;
  });
}

function patrolText(node) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
    if (isRedacted(walker.currentNode)) {
      console.log("Skipping redacted material");
      continue;
    }
    if (isViolation(walker.currentNode)) {
      redact(walker.currentNode);
    }
  }
}

// Returns true if given string should be redacted.
function isViolation(node) {
  function isValidElement(node) {
    return node.parentElement.tagName.toLowerCase() != "script";
  }
  function isLongEnough(str) {
    return str.trim().split(" ").length > MIN_NUM_WORDS;
  }
  function isNaughty(str) {
    const normalized = str.trim().toLowerCase();
    return NAUGHTYLIST.some((naughty_word) => normalized.match(naughty_word));
  }
  return (
    isValidElement(node) &&
    isLongEnough(node.nodeValue) &&
    isNaughty(node.nodeValue)
  );
}

// Redact violating node.
function redact(node) {
  console.log(`Redacting: "${node.nodeValue}"`);
  // A trick to prevent the re-evaluation of this text content
  // by resetting it so it does not trigger isLongEnough().
  node.nodeValue = REDACTED_MSG + node.nodeValue;
  node.parentNode.style.color = "black";
  node.parentNode.style.backgroundColor = "black";
}

function isRedacted(node) {
  // TODO(jwhang): This is kind of broken and needs to be fixed.
  // It does not prevent re-redacting redacted messages.
  node.nodeValue.startsWith(REDACTED_MSG);
}

function isLasChicas() {
  return location.pathname == "/t/" + CHAT_ID + "/";
}
