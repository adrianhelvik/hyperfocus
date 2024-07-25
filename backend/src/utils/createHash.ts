import requireString from "./requireString";
import crypto from "crypto";

export default async (password: string) => {
  requireString({ password });

  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, saltBuffer) => {
      if (err) return reject(err);
      const salt = saltBuffer.toString("hex");
      crypto.scrypt(password, salt, 64, (err, key) => {
        if (err) return reject(err);
        else resolve(salt + ":" + key.toString("hex"));
      });
    });
  });
};
