import fs from "node:fs";
import path from "node:path";
import { deflate } from "node:zlib";
import { promisify } from "node:util";

const deflateAsync = promisify(deflate);

async function readFileFromPath(filePath: string, file?: string, compress?: boolean): Promise<Buffer | string | null> {
  if (!file) {
    return null;
  }

  const directory = path.join(filePath, file);

  if (!fs.existsSync(directory)) {
    return null;
  }

  if (compress) {
    // ? Compress the device data
    const data = await deflateAsync(fs.readFileSync(directory));
    return data;
  }

  return fs.readFileSync(directory, "utf8");
}
export { readFileFromPath };
