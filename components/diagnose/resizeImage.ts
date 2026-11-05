/** Longest side, in pixels, of photos sent for diagnosis. */
export const MAX_IMAGE_SIDE = 1024;

/**
 * Scale (w, h) down so the longest side is at most `max`, preserving aspect ratio.
 * Never upscales. Returns whole pixels, at least 1x1.
 */
export function fitWithin(w: number, h: number, max: number): { width: number; height: number } {
  if (!(w > 0) || !(h > 0) || !(max > 0)) return { width: 0, height: 0 };
  const longest = Math.max(w, h);
  if (longest <= max) return { width: Math.round(w), height: Math.round(h) };
  const scale = max / longest;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That file could not be read as an image. Try a JPEG or PNG photo."));
    img.src = src;
  });
}

/**
 * Read an image file, shrink it so the longest side is <= `max` px, and return a JPEG data URL.
 * Browser only (uses canvas).
 */
export async function resizeImageFile(file: File, max = MAX_IMAGE_SIDE, quality = 0.85): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file (JPEG, PNG or WebP).");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, max);
    if (!width || !height) throw new Error("That image has no size. Try another photo.");
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot resize images.");
    // JPEG has no alpha: paint white so transparent PNGs don't turn black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
