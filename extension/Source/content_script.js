const NAUGHTYLIST = [
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
  "TZ",
].map((word) => "\\b" + word + "\\b");
const MIN_NUM_WORDS = 4; // Text must be at least MIN_NUM_WORDS to be analyzed for naughtiness.
const REDACTED_MSG = "Redacted: ";
const CHAT_ID = 1621389464744799;
const SCOOBY =
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/39cc0698-a3f5-4dd3-9348-a768db8365e8/dgh3iad-c1c63437-27e4-473c-b589-8a81d3257712.gif/v1/fill/w_500,h_375,q_85,strp/scooby_doo_no_by_johnwood2001_dgh3iad-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9Mzc1IiwicGF0aCI6IlwvZlwvMzljYzA2OTgtYTNmNS00ZGQzLTkzNDgtYTc2OGRiODM2NWU4XC9kZ2gzaWFkLWMxYzYzNDM3LTI3ZTQtNDczYy1iNTg5LThhODFkMzI1NzcxMi5naWYiLCJ3aWR0aCI6Ijw9NTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.7DRqkoiovalRCgkJwL-Y9B4bLgsEWhRCkm80k23t_1Q";

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
  MIN_HEIGHT = 100;
  MIN_WIDTH = 100;
  var imgs = node.getElementsByTagName("img");
  Array.from(imgs).forEach((img) => {
    if (img.visited === true) {
      return;
    }

    // Discard small images.
    if (img.height < MIN_HEIGHT || img.width < MIN_WIDTH) {
      return;
    }

    console.log("Getting image eval");
    getImageEval(img);
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
  return location.pathname.startsWith(`/t/${CHAT_ID}`);
}

async function getImageEval(image_element) {
  console.log("Evaluating image: " + image_element.src);
  chrome.runtime.sendMessage(
    {
      url: image_element.src,
    },
    (response) => {
      if (response.image.is_violation) {
        console.log("Redacting image: " + image_element.src);
        image_element.src = SCOOBY;
      }
    },
  );
}
