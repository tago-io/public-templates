import { createHash } from "node:crypto";

function generateID(name: string, type: "standard" | "blueprint"): string {
  const normalizedName = name
    .replaceAll(/[^\w\s+-]|_/g, "")
    .replaceAll("-", " ")
    .replaceAll(/\s+/g, "-")
    .toLowerCase();

  const combinedString = `${normalizedName}-${type}`;
  const hash = createHash('md5').update(combinedString).digest('hex');

  const id = hash.substring(0, 24);
  return id;
}

export { generateID };
