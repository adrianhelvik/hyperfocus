class AssertionError extends Error {}

function assert(condition, message) {
  if (!condition) {
    throw new AssertionError(message || "Assertion failed");
  }
}

assert.equal = function assertEqual(a, b, message) {
  assert(a === b, message || `${a} is not equal to ${b}`);
};

export default assert;
