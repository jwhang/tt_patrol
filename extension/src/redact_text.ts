import { MIN_NUM_WORDS, NAUGHTYLIST } from './constants'

// Returns true if given string should be redacted.
export function isViolation(content: string): boolean {
  function isLongEnough(content: string) {
    return content.trim().split(" ").length > MIN_NUM_WORDS;
  }
  function isNaughty(content: string) {
    const normalized = content.trim().toLowerCase();
    return NAUGHTYLIST.some((naughty_word) => normalized.match(naughty_word));
  }

  return isLongEnough(content) && isNaughty(content);
}

// Redact violating node.
export function redactText(node: Node) {
  if (node.parentElement !== null) {
    node.parentElement.style.color = "black"
    node.parentElement.style.backgroundColor = "black"
  }
}

