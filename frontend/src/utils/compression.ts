/**
 * Compresses an image file using HTML5 Canvas.
 * Resizes the image to fit within maxW x maxH dimensions (maintaining aspect ratio),
 * and converts it to a JPEG blob at the specified quality setting.
 * 
 * @param file - The input image File object from a file input element
 * @param maxW - Maximum width in pixels (default: 800)
 * @param maxH - Maximum height in pixels (default: 800)
 * @param quality - Compression quality between 0.0 and 1.0 (default: 0.8)
 * @returns A Promise resolving to a compressed Blob (image/jpeg)
 */
export function compressImage(
  file: File,
  maxW: number = 800,
  maxH: number = 800,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Only compress image files
    if (!file.type.startsWith("image/")) {
      reject(new Error("File selected is not an image."));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio and dimensions
        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2D canvas context."));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to export canvas to Blob."));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
