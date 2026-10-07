import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireOwner } from "@/lib/auth";
import { uid } from "@/lib/security";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function extensionFor(file: File) {
  if (ALLOWED[file.type]) return ALLOWED[file.type];
  const ext = path.extname(file.name).toLowerCase();
  if (ALLOWED_EXT.has(ext)) return ext === ".jpeg" ? ".jpg" : ext;
  return null;
}

export async function POST(request: Request) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "hub-upload", 20, 60 * 1000);
    if (blocked) return blocked;

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return reject("Choose a photo");
    if (file.size > MAX_BYTES) return reject("Photo must be under 8 MB");

    const ext = extensionFor(file);
    if (!ext) return reject("Use a JPG, PNG, WEBP, or GIF");

    const folderRaw = String(form.get("folder") || "menu");
    const folder =
      folderRaw === "site" ? "site" : folderRaw === "shop" ? "shop" : folderRaw === "menu" ? "menu" : null;
    if (!folder) return reject("Invalid folder");

    const dir = path.join(process.cwd(), "public", "media", folder);
    await mkdir(dir, { recursive: true });
    const filename = `${uid()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    return json({ path: `/media/${folder}/${filename}` });
  } catch (error) {
    return asError(error);
  }
}
