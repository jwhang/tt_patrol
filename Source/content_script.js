const naughtylist = ["trip", "travel", "flight", "plane", "jetlag", "timezone"];

// this is kind of slow and will only scale
function is_naughty(str) {
  const normalized = str.trim().toLowerCase();
  return naughtylist.some((naughty_word) => str.match(naughty_word));
}

// This mutation observer revists the same document 20x times. Find out
// a way if this can be reduced.
const callback = (mutationList, observer) => {
  mutationList.forEach((record) => {
    record.addedNodes.forEach((node) => {
      requestIdleCallback(() => search_and_redact(node));
    });
  });
};

const config = {
  attributes: false,
  childList: true,
  subtree: true,
};
const observer = new MutationObserver(callback);
observer.observe(document.body, config);

function search_and_redact(el) {
  function countWords(str) {
    return str.trim().split(" ").length;
  }
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
    if (walker.currentNode.parentElement.tagName.toLowerCase() != "script") {
      node = walker.currentNode;
      if (countWords(node.nodeValue) > 4 && is_naughty(node.nodeValue)) {
        console.log("blocked: " + node.nodeValue);
        node.nodeValue = "redacted";
      }
    }
  }
}
