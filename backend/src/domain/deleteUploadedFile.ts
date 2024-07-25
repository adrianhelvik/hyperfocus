import assert from "assert";
import fs from "fs";

const UPLOADS_BASE_URL = process.env.UPLOADS_BASE_URL;
assert(UPLOADS_BASE_URL, "UPLOADS_BASE_URL is required");

export async function deleteUploadedFile(url: string) {
  // TODO: Add support for non-local files
  const fileName = url.split("/").at(-1);
  console.log(`Deleting uploaded file: ${fileName}`);
  await fs.promises.unlink(`/tmp/${fileName}`);
}
