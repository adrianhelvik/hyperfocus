import crypto from "crypto";

export default function sha256(input: string) {
  return crypto
    .createHash("sha256")
    .update(input)
    .digest("hex");
}
