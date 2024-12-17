const MIN_TEXT_LENGTH = 4;

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

// Search for all subnodes of Text type to be redacted.
function patrol(node) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
    if (is_violation(walker.currentNode)) {
      redact(walker.currentNode);
    }
  }
}

// Patrol helper functions
const naughtylist = ["trip", "travel", "flight", "plane", "jetlag", "timezone"];

// Returns true if given string contains a word in the naughtylist.
function is_naughty(str) {
  const normalized = str.trim().toLowerCase();
  return naughtylist.some((naughty_word) => normalized.match(naughty_word));
}

function is_violation(node) {
  function long_enough(str) {
    return str.trim().split(" ").length > MIN_TEXT_LENGTH;
  }
  return (
    node.parentElement.tagName.toLowerCase() != "script" &&
    long_enough(node.nodeValue) &&
    is_naughty(node.nodeValue)
  );
}

// Redact violating node.
function redact(node) {
  console.log(`Redacting: "${node.nodeValue}"`);
  // TODO(jwhang): Make more visually smart.
  node.nodeValue = "redacted";
}
