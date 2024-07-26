/**
 * From https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform
 *
 * navigator.platform should almost always be avoided in favor of feature detection.
 * But there is one case where, among the options you could use, navigator.platform
 * may be the least-bad option: When you need to show users advice about whether the
 * modifier key for keyboard shortcuts is the ⌘ command key (found on Apple systems)
 * rather than the ⌃ control key (on non-Apple systems):
 *
 * This is that case.
 */
export default (navigator as any).platform === "MacIntel";
