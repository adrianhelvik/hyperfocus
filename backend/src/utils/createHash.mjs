import crypto from "crypto";
import assert from "assert";

export default async (password) => {
  assert(password);

  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, salt) => {
      if (err) return reject(err);
      salt = salt.toString("hex");
      crypto.scrypt(password, salt, 64, (err, key) => {
        if (err) return reject(err);
        else resolve(salt + ":" + key.toString("hex"));
      });
    });
  });
};
