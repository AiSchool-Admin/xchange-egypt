# Image Upload API Documentation

## 📋 Overview

The Image Upload System handles all image operations for the Xchange platform:
- **Upload** images with automatic compression
- **Process** images into multiple sizes
- **Optimize** for web performance
- **Manage** storage efficiently
- **Delete** images when needed

### Key Features

1. **Automatic Processing**: Images automatically resized to multiple sizes
2. **Smart Compression**: Quality optimization without visual loss
3. **Multiple Formats**: Supports JPEG, PNG, WebP
4. **Category Organization**: Separate storage for items, avatars, bids
5. **Size Limits**: Configurable limits per category
6. **Batch Operations**: Upload/delete multiple images at once

---

## 🎯 Image Categories

### 1. Item Images
- **Purpose**: Product/item listings
- **Max files**: 20 per upload
- **Max size**: 10MB per file
- **Sizes generated**:
  - Original: 1920x1920 (90% quality)
  - Large: 1200x1200 (85% quality)
  - Medium: 800x800 (80% quality)
  - Thumbnail: 300x300 (75% quality)
- **Storage**: `/uploads/items/`

### 2. Avatar Images
- **Purpose**: User profile pictures
- **Max files**: 1 per upload
- **Max size**: 5MB per file
- **Sizes generated**:
  - Large: 400x400 (85% quality)
  - Medium: 200x200 (80% quality)
  - Small: 100x100 (75% quality)
- **Storage**: `/uploads/avatars/`

### 3. Bid Images
- **Purpose**: Reverse auction bid attachments
- **Max files**: 10 per upload
- **Max size**: 10MB per file
- **Sizes generated**:
  - Large: 1200x1200 (85% quality)
  - Medium: 800x800 (80% quality)
  - Thumbnail: 300x300 (75% quality)
- **Storage**: `/uploads/bids/`

---

## 🔗 API Endpoints

### Summary

**Total Endpoints:** 11

| Category | Count |
|----------|-------|
| Upload | 5 |
| Delete | 2 |
| Utility | 4 |

---

## 📤 Upload Endpoints

### 1. Upload Single Image

**Endpoint:** `POST /api/v1/images/upload`
**Auth:** Required
**Content-Type:** `multipart/form-data`

**Form Data:**
- `image`: File (required) - The image file
- `category`: string (optional, default: 'item') - 'item', 'avatar', or 'bid'
- `processMultipleSizes`: boolean (optional, default: true) - Generate multiple sizes

**Request Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/images/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "category=item" \
  -F "processMultipleSizes=true"
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "original": {
      "filename": "iphone-14-pro-1699371234567-abc123-original.jpg",
      "originalName": "iphone-14-pro.jpg",
      "path": "/absolute/path/to/file.jpg",
      "url": "/uploads/items/iphone-14-pro-1699371234567-abc123-original.jpg",
      "size": 245678,
      "mimeType": "image/jpeg",
      "dimensions": {
        "width": 1920,
        "height": 1920
      }
    },
    "large": {
      "filename": "iphone-14-pro-1699371234567-abc123-large.jpg",
      "url": "/uploads/items/iphone-14-pro-1699371234567-abc123-large.jpg",
      "size": 156789,
      "dimensions": {
        "width": 1200,
        "height": 1200
      }
    },
    "medium": {
      "filename": "iphone-14-pro-1699371234567-abc123-medium.jpg",
      "url": "/uploads/items/iphone-14-pro-1699371234567-abc123-medium.jpg",
      "size": 89234,
      "dimensions": {
        "width": 800,
        "height": 800
      }
    },
    "thumbnail": {
      "filename": "iphone-14-pro-1699371234567-abc123-thumbnail.jpg",
      "url": "/uploads/items/iphone-14-pro-1699371234567-abc123-thumbnail.jpg",
      "size": 23456,
      "dimensions": {
        "width": 300,
        "height": 300
      }
    }
  }
}
```

---

### 2. Upload Multiple Images

**Endpoint:** `POST /api/v1/images/upload-multiple`
**Auth:** Required
**Content-Type:** `multipart/form-data`

**Form Data:**
- `images`: File[] (required, max 10) - Array of image files
- `category`: string (optional, default: 'item')
- `maxCount`: number (optional, default: 10)

**Request Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/images/upload-multiple \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg" \
  -F "category=item"
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "data": {
    "count": 3,
    "images": [
      {
        "original": {...},
        "large": {...},
        "medium": {...},
        "thumbnail": {...}
      },
      {
        "original": {...},
        "large": {...},
        "medium": {...},
        "thumbnail": {...}
      },
      {
        "original": {...},
        "large": {...},
        "medium": {...},
        "thumbnail": {...}
      }
    ]
  }
}
```

---

### 3. Upload Avatar

**Endpoint:** `POST /api/v1/images/upload-avatar`
**Auth:** Required
**Content-Type:** `multipart/form-data`

**Form Data:**
- `avatar`: File (required, max 5MB) - Avatar image file

**Request Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/images/upload-avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/avatar.jpg"
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "large": {
      "filename": "user-avatar-1699371234567-xyz789-large.jpg",
      "url": "/uploads/avatars/user-avatar-1699371234567-xyz789-large.jpg",
      "size": 45678,
      "dimensions": {
        "width": 400,
        "height": 400
      }
    },
    "medium": {
      "filename": "user-avatar-1699371234567-xyz789-medium.jpg",
      "url": "/uploads/avatars/user-avatar-1699371234567-xyz789-medium.jpg",
      "size": 23456,
      "dimensions": {
        "width": 200,
        "height": 200
      }
    },
    "small": {
      "filename": "user-avatar-1699371234567-xyz789-small.jpg",
      "url": "/uploads/avatars/user-avatar-1699371234567-xyz789-small.jpg",
      "size": 8912,
      "dimensions": {
        "width": 100,
        "height": 100
      }
    }
  }
}
```

---

### 4. Upload Item Images

**Endpoint:** `POST /api/v1/images/upload-item-images`
**Auth:** Required
**Content-Type:** `multipart/form-data`

**Form Data:**
- `images`: File[] (required, max 20) - Item image files

**Purpose:** Specifically for item listings (optimized limits)

**Request Example (JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);

const response = await fetch('/api/v1/images/upload-item-images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "2 item images uploaded successfully",
  "data": {
    "count": 2,
    "images": [...]
  }
}
```

---

### 5. Upload Bid Images

**Endpoint:** `POST /api/v1/images/upload-bid-images`
**Auth:** Required
**Content-Type:** `multipart/form-data`

**Form Data:**
- `images`: File[] (required, max 10) - Bid image files

**Purpose:** For reverse auction bids

**Response (201 Created):**
```json
{
  "success": true,
  "message": "5 bid images uploaded successfully",
  "data": {
    "count": 5,
    "images": [...]
  }
}
```

---

## 🗑️ Delete Endpoints

### 1. Delete Single Image

**Endpoint:** `DELETE /api/v1/images/:filename`
**Auth:** Required

**Query Parameters:**
- `category`: string (optional, default: 'item') - Image category

**Request Example:**
```bash
DELETE /api/v1/images/iphone-14-pro-1699371234567-abc123-medium.jpg?category=item
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": null
}
```

**Note:** Deletes the image and all its size variants automatically.

---

### 2. Delete Multiple Images

**Endpoint:** `POST /api/v1/images/delete-multiple`
**Auth:** Required

**Request Body:**
```json
{
  "filenames": [
    "image1-1699371234567-abc123-medium.jpg",
    "image2-1699371234567-def456-medium.jpg",
    "image3-1699371234567-ghi789-medium.jpg"
  ],
  "category": "item"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "3 images deleted successfully",
  "data": {
    "count": 3
  }
}
```

---

## 🛠️ Utility Endpoints

### 1. Get Image URLs

**Endpoint:** `GET /api/v1/images/:filename/urls`
**Auth:** Not required

**Query Parameters:**
- `category`: string (optional, default: 'item')

**Purpose:** Get all size variant URLs for a base filename

**Request Example:**
```bash
GET /api/v1/images/iphone-14-pro-1699371234567-abc123.jpg/urls?category=item
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image URLs retrieved successfully",
  "data": {
    "original": "/uploads/items/iphone-14-pro-1699371234567-abc123-original.jpg",
    "large": "/uploads/items/iphone-14-pro-1699371234567-abc123-large.jpg",
    "medium": "/uploads/items/iphone-14-pro-1699371234567-abc123-medium.jpg",
    "thumbnail": "/uploads/items/iphone-14-pro-1699371234567-abc123-thumbnail.jpg"
  }
}
```

---

### 2. Get Storage Statistics

**Endpoint:** `GET /api/v1/images/stats`
**Auth:** Required

**Purpose:** View storage usage across all categories

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Storage statistics retrieved successfully",
  "data": {
    "items": {
      "count": 1245,
      "totalSize": 524288000
    },
    "avatars": {
      "count": 342,
      "totalSize": 45678900
    },
    "bids": {
      "count": 89,
      "totalSize": 23456789
    },
    "temp": {
      "count": 5,
      "totalSize": 1234567
    },
    "total": {
      "count": 1681,
      "totalSize": 594658256
    }
  }
}
```

**Size in bytes** - Divide by 1024^2 for MB, 1024^3 for GB

---

### 3. Clean Up Temp Files

**Endpoint:** `POST /api/v1/images/cleanup-temp`
**Auth:** Required

**Request Body:**
```json
{
  "olderThanHours": 24
}
```

**Purpose:** Delete temporary files older than specified hours

**Response (200 OK):**
```json
{
  "success": true,
  "message": "5 temp files cleaned up successfully",
  "data": {
    "deletedCount": 5
  }
}
```

---

## 📏 Validation Rules

### File Constraints

**Allowed MIME Types:**
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

**Size Limits:**
- Item images: 10MB per file
- Avatar images: 5MB per file
- Bid images: 10MB per file

**Count Limits:**
- Single upload: 1 file
- Multiple upload: 10 files (default)
- Item images: 20 files (max)
- Bid images: 10 files (max)
- Avatar: 1 file

### Filename Rules

Generated filenames follow this pattern:
```
{original-name}-{timestamp}-{random}-{size}.{ext}
```

**Example:**
```
iphone-14-pro-1699371234567-abc123xyz-medium.jpg
```

**Components:**
- `iphone-14-pro`: Sanitized original name
- `1699371234567`: Unix timestamp
- `abc123xyz`: Random string
- `medium`: Size variant
- `.jpg`: File extension

---

## 🎯 Usage Examples

### Example 1: Upload Item Images When Creating Item

**Step 1: Upload Images**
```javascript
const formData = new FormData();
images.forEach(image => formData.append('images', image));

const uploadResponse = await fetch('/api/v1/images/upload-item-images', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { data } = await uploadResponse.json();
const imageUrls = data.images.map(img => img.medium.url);
```

**Step 2: Create Item with Image URLs**
```javascript
const itemResponse = await fetch('/api/v1/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'iPhone 14 Pro Max',
    description: '256GB, Excellent condition',
    categoryId: 'category-uuid',
    condition: 'LIKE_NEW',
    estimatedValue: 25000,
    images: imageUrls  // Array of image URLs
  })
});
```

---

### Example 2: Upload Avatar and Update Profile

**Step 1: Upload Avatar**
```javascript
const formData = new FormData();
formData.append('avatar', avatarFile);

const uploadResponse = await fetch('/api/v1/images/upload-avatar', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { data } = await uploadResponse.json();
const avatarUrl = data.medium.url;
```

**Step 2: Update User Profile**
```javascript
await fetch('/api/v1/users/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    avatar: avatarUrl
  })
});
```

---

### Example 3: Delete Old Images Before Upload

**When updating item images:**
```javascript
// 1. Get old image URLs from item
const item = await fetchItem(itemId);
const oldImages = item.images;  // Array of URLs

// 2. Extract filenames from URLs
const filenames = oldImages.map(url => {
  const parts = url.split('/');
  return parts[parts.length - 1];
});

// 3. Delete old images
await fetch('/api/v1/images/delete-multiple', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    filenames: filenames,
    category: 'item'
  })
});

// 4. Upload new images
// ... upload new images ...

// 5. Update item with new URLs
// ... update item ...
```

---

## ⚠️ Error Handling

### Common Errors

**400 Bad Request - No File**
```json
{
  "success": false,
  "error": {
    "message": "No image file provided"
  }
}
```

**400 Bad Request - File Too Large**
```json
{
  "success": false,
  "error": {
    "message": "File too large. Maximum size is 10MB"
  }
}
```

**400 Bad Request - Invalid Type**
```json
{
  "success": false,
  "error": {
    "message": "Invalid file type. Allowed types: image/jpeg, image/jpg, image/png, image/webp"
  }
}
```

**400 Bad Request - Too Many Files**
```json
{
  "success": false,
  "error": {
    "message": "Too many files. Maximum is 20 files"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "message": "Image file not found"
  }
}
```

---

## 💡 Best Practices

### For Frontend Developers

1. **Show Upload Progress**
   ```javascript
   const xhr = new XMLHttpRequest();
   xhr.upload.addEventListener('progress', (e) => {
     const percent = (e.loaded / e.total) * 100;
     updateProgressBar(percent);
   });
   ```

2. **Validate Before Upload**
   ```javascript
   function validateImage(file) {
     const maxSize = 10 * 1024 * 1024; // 10MB
     const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

     if (file.size > maxSize) {
       throw new Error('File too large');
     }

     if (!allowedTypes.includes(file.mimetype)) {
       throw new Error('Invalid file type');
     }
   }
   ```

3. **Use Appropriate Sizes**
   - **Thumbnails** in lists/grids
   - **Medium** for modals/previews
   - **Large** for full-screen views
   - **Original** only if necessary

4. **Handle Errors Gracefully**
   ```javascript
   try {
     const response = await uploadImage(file);
     if (!response.success) {
       showError(response.error.message);
     }
   } catch (error) {
     showError('Upload failed. Please try again.');
   }
   ```

5. **Clean Up on Failure**
   - Delete uploaded images if item creation fails
   - Use transactions when possible

### For Backend Developers

1. **Always Use Service Functions**
   ```typescript
   import * as imageService from '../services/image.service';

   // Good
   await imageService.uploadImage(file, 'item', true);

   // Bad - don't manipulate files directly
   fs.writeFileSync(path, file.buffer);
   ```

2. **Clean Up Orphaned Images**
   ```typescript
   // When deleting item
   await imageService.deleteImages(item.images, 'item');
   await prisma.item.delete({ where: { id: itemId } });
   ```

3. **Use Cron Jobs for Maintenance**
   ```typescript
   // Clean up temp files daily
   cron.schedule('0 0 * * *', async () => {
     await imageService.cleanupTempFiles(24);
   });
   ```

---

## 📊 Performance Considerations

### Image Sizes Strategy

**Why Multiple Sizes?**
- Reduce bandwidth usage
- Faster page loads
- Better mobile experience
- Responsive images

**File Size Savings:**
- Original: 245KB
- Large: 156KB (36% smaller)
- Medium: 89KB (64% smaller)
- Thumbnail: 23KB (91% smaller)

### Optimization Features

1. **Progressive JPEG**: Loads incrementally
2. **WebP Support**: Modern format with better compression
3. **Fit Inside**: Preserves aspect ratio
4. **Quality Optimization**: Balanced quality vs size

### Caching

Static files are served with appropriate cache headers:
```
Cache-Control: public, max-age=31536000
```

---

## 🔒 Security

### Authentication
- All upload/delete endpoints require JWT authentication
- Images are associated with authenticated user

### Validation
- File type validation (whitelist)
- File size validation
- Filename sanitization
- Path traversal prevention

### Storage
- Images stored outside source code
- Public directory with restricted access
- No executable files allowed

---

## 🎉 Summary

The Image Upload System provides:
- ✅ **5 upload endpoints** (single, multiple, avatar, items, bids)
- ✅ **2 delete endpoints** (single, multiple)
- ✅ **4 utility endpoints** (URLs, stats, cleanup)
- ✅ **Automatic image processing** (multiple sizes)
- ✅ **Smart compression** (60-90% size reduction)
- ✅ **Category organization** (items, avatars, bids)
- ✅ **Comprehensive validation**
- ✅ **Production-ready** error handling

### Total API Endpoints: **11**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/images/upload` | Upload single image |
| POST | `/api/v1/images/upload-multiple` | Upload multiple images |
| POST | `/api/v1/images/upload-avatar` | Upload avatar |
| POST | `/api/v1/images/upload-item-images` | Upload item images (max 20) |
| POST | `/api/v1/images/upload-bid-images` | Upload bid images (max 10) |
| DELETE | `/api/v1/images/:filename` | Delete single image |
| POST | `/api/v1/images/delete-multiple` | Delete multiple images |
| GET | `/api/v1/images/:filename/urls` | Get all size URLs |
| GET | `/api/v1/images/stats` | Get storage statistics |
| POST | `/api/v1/images/cleanup-temp` | Clean temp files |

**Status:** 🟢 **PRODUCTION-READY**

---

**Built for Xchange E-commerce Platform**
**Version:** 1.0.0
**Last Updated:** November 7, 2025
