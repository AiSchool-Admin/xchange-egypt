'use client';

import React, { useRef, useState } from 'react';
import { uploadImage, uploadMultipleImages, validateImageFile } from '@/lib/api/images';

interface ImageUploadProps {
  multiple?: boolean;
  category?: 'items' | 'avatars' | 'bids';
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  multiple = false,
  category = 'items',
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Check max files
    if (files.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate all files
    const validationErrors: string[] = [];
    files.forEach((file, index) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        validationErrors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      onUploadError?.(validationErrors.join('\n'));
      return;
    }

    // Create previews
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);

    // Upload files
    try {
      setUploading(true);

      let uploadedUrls: string[];

      if (multiple && files.length > 1) {
        const results = await uploadMultipleImages(files, category);
        uploadedUrls = results.map((result) =>
          'url' in result ? result.url : result.original
        );
      } else {
        const result = await uploadImage(files[0], category);
        const url = 'url' in result ? result.url : result.original;
        uploadedUrls = [url];
      }

      onUploadComplete?.(uploadedUrls);
    } catch (error: any) {
      console.error('Upload error:', error);
      onUploadError?.(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      // Clean up preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      <button
        onClick={handleClick}
        disabled={uploading}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading...' : multiple ? 'Upload Images' : 'Upload Image'}
      </button>

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="mt-2 text-sm text-gray-600">
          Uploading {multiple ? 'images' : 'image'}...
        </div>
      )}
    </div>
  );
};
