import { put, del } from "@vercel/blob";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export class ImageValidationError extends Error {}

/** Validates and uploads an image file to Vercel Blob, returning its public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageValidationError("Formato de imagen no soportado");
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new ImageValidationError("La imagen supera el tamaño máximo permitido (5MB)");
  }

  const blob = await put(`${folder}/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
  });

  return blob.url;
}

/** Deletes an image from Vercel Blob. Safe to call even if the blob no longer exists. */
export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
  } catch {
    // Already deleted or never existed — nothing to do.
  }
}
