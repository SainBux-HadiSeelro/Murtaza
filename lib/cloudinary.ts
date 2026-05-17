/**
 * Cloudinary upload helper — server-side only (API routes).
 * Photos stored as URLs, not base64 — saves database bandwidth.
 */
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dufbt2eff',
  api_key:    process.env.CLOUDINARY_API_KEY    || '864267225225937',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'qBxFMAGE6ARGXCs6Qepe3Mol_ss',
});

export async function uploadBase64Photo(
  base64DataUrl: string,
  publicId: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(base64DataUrl, {
    public_id:    `wedding/${publicId}`,
    folder:       'wedding',
    overwrite:    true,
    resource_type: 'image',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
  return result.secure_url;
}
