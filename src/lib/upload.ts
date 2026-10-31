import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

/** Saves an uploaded image under /public/uploads and returns its public URL. */
export async function saveUpload(file: File): Promise<string> {
  if (!ALLOWED.has(file.type)) throw new Error("Only PNG, JPG, WebP, SVG or GIF images are allowed.");
  if (file.size > MAX_BYTES) throw new Error("Image must be 5 MB or smaller.");
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(process.cwd(), "public", "uploads", name), bytes);
  return `/uploads/${name}`;
}
