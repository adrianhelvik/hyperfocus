// @ts-check
import crypto from "crypto";

/**
 * @param {string} input
 * @returns {string}
 */
export default function sha256(input) {
  return "s_" + crypto
    .createHash("sha256")
    .update(input)
    .digest("hex");
}
