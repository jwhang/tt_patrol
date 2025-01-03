import { CHAT_ID, SCOOBY, MIN_HEIGHT, MIN_WIDTH } from './constants'
import { isViolation, redactText, isRedactedText } from './redact_text';

// Set up MutationObserver to monitor added nodes.
const config = {
  attributes: false,
  childList: true,
  subtree: true,
};
const callback = (mutationList: MutationRecord[], observer: MutationObserver) => {
  mutationList.forEach((record) => {
    // Only patrol if correct chat.
    if (isLasChicas()) {
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
function patrol(node: Node): void {
  patrolImages(node);
  patrolText(node);
}

// Patrol helper functions

function patrolImages(node: Node): void {
  if (!(node instanceof Element)) return

  var imgs = node.getElementsByTagName("img");
  Array.from(imgs).forEach((img) => {
    if (img.getAttribute("visited") === "true") {
      console.log("Skipping visited image: " + img.src);
      return;
    }

    // Discard small images.
    if (img.height < MIN_HEIGHT || img.width < MIN_WIDTH) {
      return;
    }

    evaluateAndRedactImage(img);
    img.setAttribute("visted", "true");
  });
}

function patrolText(node: Node): void {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
    if (isRedactedText(walker.currentNode)) {
      console.log("Skipping redacted material");
      continue;
    }
    if (isViolation(walker.currentNode)) {
      redactText(walker.currentNode);
    }
  }
}

function isLasChicas(): boolean {
  return window.location.pathname.startsWith(`/t/${CHAT_ID}`);
}

async function evaluateAndRedactImage(image_element: HTMLImageElement): Promise<void> {
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