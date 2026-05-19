import path from "node:path";

export const DEFAULT_UPLOAD_ROOT = process.env.UPLOAD_DIR || "public/uploads";

export function getUploadPath(folder: "meals" | "certificates", fileName: string) {
  return path.join(DEFAULT_UPLOAD_ROOT, folder, fileName);
}
