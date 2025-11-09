import apiClient from './client';

export interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface ProcessedImages {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
}

/**
 * Upload a single image
 */
export const uploadImage = async (
  file: File,
  category: 'items' | 'avatars' | 'bids' = 'items'
): Promise<UploadedImage | ProcessedImages> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('category', category);

  const response = await apiClient.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  files: File[],
  category: 'items' | 'avatars' | 'bids' = 'items'
): Promise<(UploadedImage | ProcessedImages)[]> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('images', file);
  });
  formData.append('category', category);

  const response = await apiClient.post('/images/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Delete an image
 */
export const deleteImage = async (filename: string): Promise<void> => {
  await apiClient.delete(`/images/${filename}`);
};

/**
 * Get image by filename
 */
export const getImageUrl = (filename: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'https://xchange-egypt-production.up.railway.app';
  return `${baseUrl}/uploads/${filename}`;
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 5MB.',
    };
  }

  return { valid: true };
};
