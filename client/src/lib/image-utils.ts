import { toast } from "sonner";

interface ImageValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

interface ProcessedImage {
  valid: boolean;
  base64: string | null;
  preview: string | null;
  file: File | null;
  error?: string;
}

export const validateImage = (
  file: File,
  options: ImageValidationOptions = {}
): { valid: boolean; error?: string } => {
  const {
    maxSizeMB = 5,
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File must be one of the following types: ${allowedTypes
        .map((type) => type.replace("image/", ""))
        .join(", ")}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Image size must be less than ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

export const compressImage = (
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Create an image element to load the file
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;

      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions if needed
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw resized image to canvas
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to Blob with quality adjustment for JPEG/JPG
        let quality = 0.9; // Start with high quality
        const mime = file.type;

        // For JPEG, adjust quality if needed
        if (mime === "image/jpeg" || mime === "image/jpg") {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              // If still too big, reduce quality iteratively
              if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.5) {
                quality -= 0.1;
                canvas.toBlob(
                  (finalBlob) => {
                    if (!finalBlob) {
                      reject(new Error("Failed to compress image"));
                      return;
                    }
                    const newFile = new File([finalBlob], file.name, {
                      type: mime,
                      lastModified: Date.now(),
                    });
                    resolve(newFile);
                  },
                  mime,
                  quality
                );
              } else {
                const newFile = new File([blob], file.name, {
                  type: mime,
                  lastModified: Date.now(),
                });
                resolve(newFile);
              }
            },
            mime,
            quality
          );
        } else {
          // For other formats like PNG, just resize without quality adjustment
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            const newFile = new File([blob], file.name, {
              type: mime,
              lastModified: Date.now(),
            });
            resolve(newFile);
          }, mime);
        }
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Processes an image file: validates, compresses, and provides base64/preview
 */
export const processImage = async (
  file: File,
  options: ImageValidationOptions = {}
): Promise<ProcessedImage> => {
  // Validate image
  const validation = validateImage(file, options);
  if (!validation.valid) {
    toast.error(validation.error);
    return {
      valid: false,
      base64: null,
      preview: null,
      file: null,
      error: validation.error,
    };
  }

  try {
    // Compress image
    const maxSizeMB = options.maxSizeMB || 5;
    const compressedFile = await compressImage(file, maxSizeMB);

    // Convert to base64
    const base64Promise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    });

    const base64String = await base64Promise;

    return {
      valid: true,
      base64: base64String,
      preview: base64String,
      file: compressedFile,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process image";
    toast.error(errorMessage);
    return {
      valid: false,
      base64: null,
      preview: null,
      file: null,
      error: errorMessage,
    };
  }
};
