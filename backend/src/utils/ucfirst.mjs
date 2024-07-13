// @ts-check

/**
 * @param {string} input
 * @returns {string}
 */
export default function ucfirst(input) {
  return input[0].toUpperCase() + input.slice(1);
}
