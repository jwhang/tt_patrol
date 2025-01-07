import { MIN_NUM_WORDS, NAUGHTYLIST } from './constants'

// Returns true if given string should be redacted.
export function isViolation(node: Node): boolean {
  function isValidElement(node: Node) {
    return (
      node.parentElement !== null &&
      node.parentElement.tagName.toLowerCase() != "script"
    );
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
  if (node.parentElement !== null) {
    node.parentElement.style.color = "black"
    node.parentElement.style.backgroundColor = "black"
  }
}

