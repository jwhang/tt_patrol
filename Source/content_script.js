const NAUGHTYLIST = [
  "airline",
  "business class",
  "first class",
  "fly",
  "flight",
  "jetlag",
  "plane",
  "timezone",
  "travel",
  "trip",
];
const MIN_NUM_WORDS = 4; // Text must be at least MIN_NUM_WORDS to be analyzed for naughtiness.

// Set up MutationObserver to monitor added nodes.
const config = {
  attributes: false,
  childList: true,
  subtree: true,
};
const callback = (mutationList, observer) => {
  mutationList.forEach((record) => {
    record.addedNodes.forEach((node) => {
      // Defer patrol() because TreeWalking and Regex matching are expensive.
      requestIdleCallback(() => patrol(node));
    });
  });
};
const observer = new MutationObserver(callback);
observer.observe(document.body, config);

// Search for all subnodes of Text type which may need to be redacted.
function patrol(node) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
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
  node.parentNode.style.color = "black";
  node.parentNode.style.backgroundColor = "black";
}
