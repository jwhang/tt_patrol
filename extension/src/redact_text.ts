import { MIN_NUM_WORDS, NAUGHTYLIST, REDACTED_MSG } from './constants'

// Returns true if given string should be redacted.
export function isViolation(node: Node): boolean {
  function isValidElement(node: Node) {
    return node.parentElement !== null && node.parentElement.tagName.toLowerCase() != "script";
  }
  function isLongEnough(content: string | null) {
    if (content == null) return false

    return content.trim().split(" ").length > MIN_NUM_WORDS;
  }
  function isNaughty(content: string | null) {
    if (content == null) return false

    const normalized = content.trim().toLowerCase();
    return NAUGHTYLIST.some((naughty_word) => normalized.match(naughty_word));
  }
  return (
    isValidElement(node) &&
    isLongEnough(node.nodeValue) &&
    isNaughty(node.nodeValue)
  );
}

// Redact violating node.
export function redactText(node: Node) {
  console.log(`Redacting: "${node.nodeValue}"`);
  // A trick to prevent the re-evaluation of this text content
  // by resetting it so it does not trigger isLongEnough().
  node.nodeValue = REDACTED_MSG + node.nodeValue;
  if (node.parentElement !== null) {
    node.parentElement.style.color = "black"
    node.parentElement.style.backgroundColor = "black"
  }
}

export function isRedactedText(node: Node): boolean {
  // TODO(jwhang): This is kind of broken and needs to be fixed.
  // It does not prevent re-redacting redacted messages.
  return (
    node.nodeValue !== null &&
    node.nodeValue.startsWith(REDACTED_MSG)
  );
}

