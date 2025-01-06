import { CHAT_ID, SCOOBY, MIN_HEIGHT, MIN_WIDTH } from './constants'
import { isViolation, redactText } from './redact_text';

// Set up MutationObserver to monitor added nodes.
const config = {
  attributes: false,
  childList: true,
  subtree: true,
};
const callback = (mutationList: MutationRecord[], observer: MutationObserver) => {
  let isLasChicas = () => {
    return window.location.pathname.startsWith(`/t/${CHAT_ID}`);
  };
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
  patrolText(node);
  patrolImages(node);
  patrolVideos(node);
}

// Patrol helper functions

function patrolText(node: Node): void {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
    if (isVisited(walker.currentNode.parentElement)) {
      console.log("Skipping evaluated text");
      continue;
    }
    if (isViolation(walker.currentNode)) {
      redactText(walker.currentNode);
    }
    markVisited(walker.currentNode.parentElement);
  }
}

function patrolImages(node: Node): void {
  if (!(node instanceof Element)) return

  var imgs = node.getElementsByTagName("img");
  Array.from(imgs).forEach((img) => {
    if (isVisited(img)) {
      console.log("Skipping visited image");
      return;
    }

    // Discard small images.
    if (img.height < MIN_HEIGHT || img.width < MIN_WIDTH) {
      return;
    }

    evaluateAndRedactContent(img);
    markVisited(img);
  });
}

function patrolVideos(node: Node): void {
  if (!(node instanceof Element)) return

  var videos = node.getElementsByTagName("video");
  Array.from(videos).forEach((video) => {
    if (isVisited(video)) {
      console.log("Skipping visited video");
      return;
    }

    evaluateAndRedactContent(video);
    markVisited(video);
  });
}

async function evaluateAndRedactContent(element: HTMLImageElement | HTMLVideoElement): Promise<void> {
  chrome.runtime.sendMessage(
    {
      url: element.src,
    },
    (response) => {
      if (response.is_violation) {
        console.log("Redacting media: " + element.src);
        //element.src = SCOOBY;
        element.src = chrome.runtime.getURL("images/scooby-no.jpg");
      }
    },
  );
}

// Redact violating node.
export function markVisited(element: Element | null): void {
  if (element !== null) {
    element.setAttribute("visted", "true");
  }
}

// Redact violating node.
export function isVisited(element: Element | null): boolean {
  return element !== null &&
    element.getAttribute("visted") === "true";
}
