/**
 * Resize and compress an image file for product uploads (keeps JSON payloads under ingress limits).
 */
export async function compressImageFile(
  file,
  { maxWidth = 1200, maxHeight = 1200, quality = 0.82, maxBytes = 750_000 } = {}
) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Please upload image files only (JPEG, PNG, or WebP).');
  }

  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let q = quality;
  let dataUrl = canvas.toDataURL('image/jpeg', q);
  // data URL length ≈ 4/3 of raw bytes; shrink until under maxBytes
  while (dataUrl.length > maxBytes * 1.34 && q > 0.45) {
    q -= 0.08;
    dataUrl = canvas.toDataURL('image/jpeg', q);
  }
  return dataUrl;
}

export const MAX_PRODUCT_IMAGES = 5;
