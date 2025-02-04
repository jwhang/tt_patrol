import { SCOOBY, SCOOBY_VID, MIN_HEIGHT, MIN_WIDTH, EVALUTE_MEDIA_CONTENT_MESSAGE, EVALUTE_TEXT_MESSAGE } from './constants'
import { isViolation, redactText } from './redact_text';
import { getPatrolState } from './patrol_state'


// Listens for change to Patrol state.
chrome.storage.local.onChanged.addListener(
  (changes: { [key: string]: chrome.storage.StorageChange }) => {
    // Assumes that only 'patrolEnabled' boolean is stored in chrome storage.
    // If more data is added to chrome storage, then the changes must be 
    // more closely sifted through to make sure we don't reload needlessly.
    window.location.reload();
  });


async function setUpObserver(): Promise<void> {
  let patrolEnabled = await getPatrolState();
  console.log("TTPatrol enabled: " + patrolEnabled);
  if (!patrolEnabled) {
    return;
  }

  // Set up MutationObserver to monitor added nodes.
  const config = {
    attributes: false,
    childList: true,
    subtree: true,
  };
  const callback = (mutationList: MutationRecord[], observer: MutationObserver) => {
    mutationList.forEach((record) => {
      // Only patrol if correct chat.
      record.addedNodes.forEach((node) => {
        // Defer patrol() because TreeWalking and Regex matching are expensive.
        requestIdleCallback(() => patrol(node));
      });
    });
  };

  const observer = new MutationObserver(callback);
  observer.observe(document.body, config);
}

setUpObserver()

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
      continue;
    }
    if (
      node.parentElement !== null &&
      node.parentElement.tagName.toLowerCase() === "script") {
      continue;
    }

    // I have to assign the currentNode because walker.currentNode will refer
    // to another node in the callback.
    let curNode = walker.currentNode;
    chrome.runtime.sendMessage(
      {
        message: EVALUTE_TEXT_MESSAGE,
        text: curNode.nodeValue
      },
      (is_violation: boolean) => {
        if (is_violation) {
          redactText(curNode);
        }
      },
    );
    markVisited(curNode.parentElement);
  }
}

function patrolImages(node: Node): void {
  if (!(node instanceof Element)) return

  var imgs = node.getElementsByTagName("img");
  Array.from(imgs).forEach((img) => {
    if (isVisited(img)) {
      return;
    }

    // Discard small images.
    if (img.height < MIN_HEIGHT || img.width < MIN_WIDTH) {
      return;
    }

    evaluateAndRedact(img);
    markVisited(img);
  });
}

function patrolVideos(node: Node): void {
  if (!(node instanceof Element)) return

  var videos = node.getElementsByTagName("video");
  Array.from(videos).forEach((video) => {
    if (isVisited(video)) {
      return;
    }

    evaluateAndRedact(video);
    markVisited(video);
  });
}

async function evaluateAndRedact(element: HTMLImageElement | HTMLVideoElement):
  Promise<void> {
  chrome.runtime.sendMessage(
    {
      message: EVALUTE_MEDIA_CONTENT_MESSAGE,
      url: element.src,
    },
    (response) => {
      if (response.is_violation) {
        if (element instanceof HTMLImageElement) {
          element.src = chrome.runtime.getURL(SCOOBY_VID);
        } else if (element instanceof HTMLVideoElement) {
          // Replaces the VideoHTMLElement with an ImageHTMLElement.
          const placeholder = document.createElement("img");
          placeholder.src = chrome.runtime.getURL(SCOOBY_VID);
          placeholder.style.height = "100%"
          placeholder.style.width = "100%"
          element.replaceWith(placeholder);
        }
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
