export default function isDetached(element) {
    if (!element) return true;
    if (element === document.body) return false;
    return isDetached(element.parentNode);
}
