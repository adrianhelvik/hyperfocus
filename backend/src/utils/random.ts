import { randomBytes } from "crypto";

export default () => {
  return new Promise<string>((resolve, reject) => {
    randomBytes(127, (err, buf) => {
      if (err) reject(err);
      else resolve("r_" + buf.toString("hex"));
    });
  });
};
