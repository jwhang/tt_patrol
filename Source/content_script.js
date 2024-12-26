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

// Set up MutationObserver to monitor added nodes.
const config = {
  attributes: false,
  childList: true,
  subtree: true,
};
const callback = (mutationList, observer) => {
  mutationList.forEach((record) => {
    // Only patrol if
    if (is_las_chicas(window.location)) {
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
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
    if (is_redacted(walker.currentNode)) {
      continue;
    }
    if (is_violation(walker.currentNode)) {
      redact(walker.currentNode);
    }
  }
}

// Patrol helper functions

// Returns true if given string should be redacted.
function is_violation(node) {
  function valid_element(node) {
    return node.parentElement.tagName.toLowerCase() != "script";
  }
  function long_enough(str) {
    return str.trim().split(" ").length > MIN_NUM_WORDS;
  }
  function is_naughty(str) {
    const normalized = str.trim().toLowerCase();
    return NAUGHTYLIST.some((naughty_word) => normalized.match(naughty_word));
  }
  return (
    valid_element(node) &&
    long_enough(node.nodeValue) &&
    is_naughty(node.nodeValue)
  );
}

// Redact violating node.
function redact(node) {
  console.log(`Redacting: "${node.nodeValue}"`);
  // A trick to prevent the re-evaluation of this text content
  // by resetting it so it does not trigger long_enough().
  node.nodeValue = REDACTED_MSG + node.nodeValue;
  node.parentNode.style.color = "black";
  node.parentNode.style.backgroundColor = "black";
}

function is_redacted(node) {
  node.nodeValue.startsWith(REDACTED_MSG);
}

function is_las_chicas() {
  return location.pathname == "/t/" + CHAT_ID;
}
