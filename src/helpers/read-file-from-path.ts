import fs from "node:fs";
import path from "node:path";

function readFileFromPath(filePath: string, file?: string, buffer?: boolean): Buffer | string | null {
  if (!file) {
    return null;
  }

  const directory = path.join(filePath, file);

  if (!fs.existsSync(directory)) {
    return null;
  }

  if (buffer) {
    return fs.readFileSync(directory);
  }

  return fs.readFileSync(directory, "utf8");
}
export { readFileFromPath };
