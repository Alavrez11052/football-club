const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Validates an uploaded image and returns it as a data URL stored in the database.
 * The hosted runtime (Netlify serverless) has a read-only filesystem, so images
 * cannot be written to /public/uploads — storing them with the club record works
 * everywhere and needs no external file storage.
 */
export async function saveUpload(file: File): Promise<string> {
  if (!ALLOWED.has(file.type)) throw new Error("Only PNG, JPG, WebP, SVG or GIF images are allowed.");
  if (file.size > MAX_BYTES) throw new Error("Image must be 5 MB or smaller.");
  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${bytes.toString("base64")}`;
}
