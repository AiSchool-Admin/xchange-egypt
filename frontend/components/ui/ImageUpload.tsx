'use client';

import React, { useRef, useState, useCallback } from 'react';
import { uploadImage, uploadMultipleImages, validateImageFile } from '@/lib/api/images';

// Translations for the component
const translations = {
  ar: {
    uploadImage: 'رفع صورة',
    uploadImages: 'رفع صور',
    uploading: 'جاري الرفع...',
    uploadingImage: 'جاري رفع الصورة...',
    uploadingImages: 'جاري رفع الصور...',
    maxFilesError: 'الحد الأقصى {count} ملفات',
    dragDrop: 'اسحب وأفلت الصور هنا أو اضغط للاختيار',
    supportedFormats: 'الصيغ المدعومة: JPG, PNG, WebP (الحد الأقصى 5MB)',
  },
  en: {
    uploadImage: 'Upload Image',
    uploadImages: 'Upload Images',
    uploading: 'Uploading...',
    uploadingImage: 'Uploading image...',
    uploadingImages: 'Uploading images...',
    maxFilesError: 'Maximum {count} files allowed',
    dragDrop: 'Drag & drop images here or click to select',
    supportedFormats: 'Supported formats: JPG, PNG, WebP (Max 5MB)',
  },
};

type Language = 'ar' | 'en';

interface ImageUploadProps {
  multiple?: boolean;
  category?: 'items' | 'avatars' | 'bids';
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
  lang?: Language;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  multiple = false,
  category = 'items',
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  className = '',
  lang = 'ar',
}) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Check max files
    if (files.length > maxFiles) {
      onUploadError?.(t.maxFilesError.replace('{count}', String(maxFiles)));
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
  }, [category, maxFiles, multiple, onUploadComplete, onUploadError, t.maxFilesError]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    await handleFiles(files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploading) return;

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (droppedFiles.length === 0) {
      onUploadError?.('Please drop image files only');
      return;
    }

    await handleFiles(droppedFiles);
  }, [uploading, handleFiles, onUploadError]);

  return (
    <div className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-purple-500 bg-purple-100'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="text-4xl mb-2">{isDragging ? '📥' : '📷'}</div>
        <p className="text-gray-600 font-medium">
          {uploading ? t.uploading : (multiple ? t.uploadImages : t.uploadImage)}
        </p>
        <p className="text-xs text-gray-400 mt-1">{t.dragDrop}</p>
        <p className="text-xs text-gray-400">{t.supportedFormats}</p>
      </div>

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          {multiple ? t.uploadingImages : t.uploadingImage}
        </div>
      )}
    </div>
  );
};
