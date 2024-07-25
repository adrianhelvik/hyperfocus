import crypto from "crypto";

export default (password: string, saltAndHash: string) => {
  const [salt, hash] = saltAndHash.split(":");

  console.log("salt:", salt);
  console.log("hash:", hash);

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      console.log("decoded:", key.toString("hex"));
      resolve(key.toString("hex") === hash);
    });
  });
};
