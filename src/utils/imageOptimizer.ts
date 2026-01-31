/**
 * Image Optimization Utilities
 * Compress and resize images before uploading to reduce storage and improve performance
 */

export interface OptimizeImageOptions {
  /**
   * Maximum width in pixels
   * @default 800
   */
  maxWidth?: number;

  /**
   * Maximum height in pixels
   * @default 800
   */
  maxHeight?: number;

  /**
   * Image quality (0-1)
   * @default 0.8
   */
  quality?: number;

  /**
   * Output format
   * @default 'image/jpeg'
   */
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Optimize an image file by resizing and compressing
 *
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Promise resolving to base64 data URL
 *
 * @example
 * const handleLogoUpload = async (file: File) => {
 *   const optimizedLogo = await optimizeImage(file, {
 *     maxWidth: 200,
 *     maxHeight: 200,
 *     quality: 0.8,
 *   });
 *   setFormData({ ...formData, logo: optimizedLogo });
 * };
 */
export const optimizeImage = async (
  file: File,
  options: OptimizeImageOptions = {}
): Promise<string> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    // Read file as data URL
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onerror = () => reject(new Error('Failed to load image'));

      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL with compression
        const optimizedDataUrl = canvas.toDataURL(format, quality);

        resolve(optimizedDataUrl);
      };
    };
  });
};

/**
 * Get file size in KB from base64 data URL
 *
 * @param dataUrl - Base64 data URL
 * @returns File size in KB
 */
export const getDataUrlSize = (dataUrl: string): number => {
  // Remove data URL prefix to get actual base64 string
  const base64 = dataUrl.split(',')[1];
  // Base64 encoding adds ~33% overhead, so multiply by 0.75 to get actual size
  const sizeInBytes = (base64.length * 3) / 4;
  return Math.round(sizeInBytes / 1024);
};

/**
 * Validate image file type
 *
 * @param file - File to validate
 * @returns True if file is a valid image
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Validate image file size
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns True if file size is within limit
 */
export const isValidImageSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Comprehensive image validation
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result with error message if invalid
 */
export const validateImage = (
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } => {
  if (!isValidImageFile(file)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.',
    };
  }

  if (!isValidImageSize(file, maxSizeMB)) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB. Please upload a smaller image.`,
    };
  }

  return { valid: true };
};
