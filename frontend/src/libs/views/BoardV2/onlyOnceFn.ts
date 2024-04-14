export default function onlyOnceFn(fn: () => void) {
    let called = false;
    return () => {
        if (!called) fn();
        called = true;
    };
}
