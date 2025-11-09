# Items API Documentation

This document provides comprehensive documentation for the Items Management API endpoints in the Xchange platform.

## Overview

The Items API provides endpoints for managing marketplace items (products). Users can create, update, delete, and search items with multiple images, bilingual content, and detailed information including condition, location, and category.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Item Conditions](#item-conditions)
- [Egyptian Governorates](#egyptian-governorates)
- [Public Endpoints](#public-endpoints)
  - [Search Items](#search-items)
  - [Get User Items](#get-user-items)
  - [Get Category Items](#get-category-items)
  - [Get Item by ID](#get-item-by-id)
- [Protected Endpoints](#protected-endpoints)
  - [Create Item](#create-item)
  - [Update Item](#update-item)
  - [Delete Item](#delete-item)
  - [Add Item Images](#add-item-images)
  - [Remove Item Images](#remove-item-images)
- [Data Models](#data-models)
- [Error Responses](#error-responses)

---

## Base URL

```
http://localhost:5000/api/v1/items
```

## Authentication

Public endpoints do not require authentication. Protected endpoints require a valid JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Item Conditions

Items can have one of the following conditions:

- `NEW` - Brand new, never used
- `LIKE_NEW` - Barely used, perfect condition
- `EXCELLENT` - Lightly used, excellent condition
- `GOOD` - Used but in good condition
- `FAIR` - Heavily used, acceptable condition
- `POOR` - Very worn, still functional
- `FOR_PARTS` - Not working, for parts only

## Egyptian Governorates

Valid governorate values:
- Cairo, Giza, Alexandria
- Dakahlia, Red Sea, Beheira, Fayoum, Gharbiya
- Ismailia, Menofia, Minya, Qaliubiya, New Valley
- Suez, Aswan, Assiut, Beni Suef, Port Said
- Damietta, Sharkia, South Sinai, Kafr El Sheikh
- Matrouh, Luxor, Qena, North Sinai, Sohag

---

## Public Endpoints

### Search Items

Search and filter items with pagination.

**Endpoint:** `GET /api/v1/items/search`

**Query Parameters:**
- `search` (optional): Search term (searches in titles and descriptions)
- `categoryId` (optional): Filter by category UUID
- `sellerId` (optional): Filter by seller UUID
- `condition` (optional): Filter by item condition
- `governorate` (optional): Filter by governorate
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sortBy` (optional): Sort field - `createdAt`, `updatedAt`, `titleAr`, `titleEn` (default: `createdAt`)
- `sortOrder` (optional): Sort order - `asc`, `desc` (default: `desc`)

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/items/search?search=laptop&condition=EXCELLENT&governorate=Cairo&page=1&limit=20"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "sellerId": "223e4567-e89b-12d3-a456-426614174001",
        "categoryId": "323e4567-e89b-12d3-a456-426614174002",
        "titleAr": "لابتوب ديل XPS 13",
        "titleEn": "Dell XPS 13 Laptop",
        "descriptionAr": "لابتوب ديل XPS 13 في حالة ممتازة، مستعمل لمدة 6 أشهر فقط",
        "descriptionEn": "Dell XPS 13 in excellent condition, used for only 6 months",
        "condition": "EXCELLENT",
        "quantity": 1,
        "images": [
          "/uploads/items/laptop-001-processed.jpg",
          "/uploads/items/laptop-002-processed.jpg"
        ],
        "location": "Nasr City",
        "governorate": "Cairo",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z",
        "seller": {
          "id": "223e4567-e89b-12d3-a456-426614174001",
          "fullName": "Ahmed Mohamed",
          "avatar": "/uploads/avatars/user-001-processed.jpg",
          "accountType": "INDIVIDUAL"
        },
        "category": {
          "id": "323e4567-e89b-12d3-a456-426614174002",
          "nameAr": "أجهزة كمبيوتر",
          "nameEn": "Computers",
          "slug": "computers"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasMore": true
    }
  },
  "message": "Items retrieved successfully"
}
```

---

### Get User Items

Get all items listed by a specific user.

**Endpoint:** `GET /api/v1/items/user/:userId`

**Path Parameters:**
- `userId` (required): UUID of the user

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/items/user/223e4567-e89b-12d3-a456-426614174001?page=1&limit=10"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "sellerId": "223e4567-e89b-12d3-a456-426614174001",
        "categoryId": "323e4567-e89b-12d3-a456-426614174002",
        "titleAr": "لابتوب ديل XPS 13",
        "titleEn": "Dell XPS 13 Laptop",
        "descriptionAr": "لابتوب ديل XPS 13 في حالة ممتازة",
        "descriptionEn": "Dell XPS 13 in excellent condition",
        "condition": "EXCELLENT",
        "quantity": 1,
        "images": ["/uploads/items/laptop-001-processed.jpg"],
        "location": "Nasr City",
        "governorate": "Cairo",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z",
        "category": {
          "id": "323e4567-e89b-12d3-a456-426614174002",
          "nameAr": "أجهزة كمبيوتر",
          "nameEn": "Computers",
          "slug": "computers"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "totalPages": 2,
      "hasMore": true
    }
  },
  "message": "User items retrieved successfully"
}
```

---

### Get Category Items

Get all items in a specific category, optionally including subcategories.

**Endpoint:** `GET /api/v1/items/category/:categoryId`

**Path Parameters:**
- `categoryId` (required): UUID of the category

**Query Parameters:**
- `includeSubcategories` (optional): Include items from subcategories - `true`, `false` (default: `false`)
- `condition` (optional): Filter by item condition
- `governorate` (optional): Filter by governorate
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sortBy` (optional): Sort field (default: `createdAt`)
- `sortOrder` (optional): Sort order (default: `desc`)

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/items/category/323e4567-e89b-12d3-a456-426614174002?includeSubcategories=true&condition=EXCELLENT&page=1"
```

**Response (200 OK):**
Same structure as Search Items response.

---

### Get Item by ID

Get detailed information about a specific item.

**Endpoint:** `GET /api/v1/items/:id`

**Path Parameters:**
- `id` (required): UUID of the item

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/items/123e4567-e89b-12d3-a456-426614174000"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sellerId": "223e4567-e89b-12d3-a456-426614174001",
    "categoryId": "323e4567-e89b-12d3-a456-426614174002",
    "titleAr": "لابتوب ديل XPS 13",
    "titleEn": "Dell XPS 13 Laptop",
    "descriptionAr": "لابتوب ديل XPS 13 في حالة ممتازة، مستعمل لمدة 6 أشهر فقط. المواصفات: Intel Core i7، 16GB RAM، 512GB SSD",
    "descriptionEn": "Dell XPS 13 in excellent condition, used for only 6 months. Specs: Intel Core i7, 16GB RAM, 512GB SSD",
    "condition": "EXCELLENT",
    "quantity": 1,
    "images": [
      "/uploads/items/laptop-001-processed.jpg",
      "/uploads/items/laptop-002-processed.jpg",
      "/uploads/items/laptop-003-processed.jpg"
    ],
    "location": "Nasr City",
    "governorate": "Cairo",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "seller": {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "fullName": "Ahmed Mohamed",
      "avatar": "/uploads/avatars/user-001-processed.jpg",
      "accountType": "INDIVIDUAL",
      "businessName": null
    },
    "category": {
      "id": "323e4567-e89b-12d3-a456-426614174002",
      "nameAr": "أجهزة كمبيوتر",
      "nameEn": "Computers",
      "slug": "computers",
      "parent": {
        "id": "423e4567-e89b-12d3-a456-426614174003",
        "nameAr": "إلكترونيات",
        "nameEn": "Electronics",
        "slug": "electronics"
      }
    }
  },
  "message": "Item retrieved successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Item not found"
  }
}
```

---

## Protected Endpoints

### Create Item

Create a new item with optional images. Requires authentication.

**Endpoint:** `POST /api/v1/items`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `titleAr` (required): Arabic title (3-200 characters)
- `titleEn` (optional): English title (3-200 characters)
- `descriptionAr` (required): Arabic description (10-5000 characters)
- `descriptionEn` (optional): English description (10-5000 characters)
- `categoryId` (required): UUID of the category
- `condition` (required): Item condition enum value
- `quantity` (optional): Item quantity (default: 1)
- `location` (required): Specific location/address (3-200 characters)
- `governorate` (required): Egyptian governorate
- `images` (optional): Array of image files (max 10 images, max 5MB each)

**Request Example:**
```bash
curl -X POST "http://localhost:5000/api/v1/items" \
  -H "Authorization: Bearer <access_token>" \
  -F "titleAr=لابتوب ديل XPS 13" \
  -F "titleEn=Dell XPS 13 Laptop" \
  -F "descriptionAr=لابتوب ديل XPS 13 في حالة ممتازة" \
  -F "descriptionEn=Dell XPS 13 in excellent condition" \
  -F "categoryId=323e4567-e89b-12d3-a456-426614174002" \
  -F "condition=EXCELLENT" \
  -F "quantity=1" \
  -F "location=Nasr City" \
  -F "governorate=Cairo" \
  -F "images=@laptop1.jpg" \
  -F "images=@laptop2.jpg"
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sellerId": "223e4567-e89b-12d3-a456-426614174001",
    "categoryId": "323e4567-e89b-12d3-a456-426614174002",
    "titleAr": "لابتوب ديل XPS 13",
    "titleEn": "Dell XPS 13 Laptop",
    "descriptionAr": "لابتوب ديل XPS 13 في حالة ممتازة",
    "descriptionEn": "Dell XPS 13 in excellent condition",
    "condition": "EXCELLENT",
    "quantity": 1,
    "images": [
      "/uploads/items/uuid-001-processed.jpg",
      "/uploads/items/uuid-002-processed.jpg"
    ],
    "location": "Nasr City",
    "governorate": "Cairo",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "seller": {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "fullName": "Ahmed Mohamed",
      "avatar": "/uploads/avatars/user-001-processed.jpg",
      "accountType": "INDIVIDUAL"
    },
    "category": {
      "id": "323e4567-e89b-12d3-a456-426614174002",
      "nameAr": "أجهزة كمبيوتر",
      "nameEn": "Computers",
      "slug": "computers"
    }
  },
  "message": "Item created successfully"
}
```

**Error Responses:**

**404 Not Found (Invalid Category):**
```json
{
  "success": false,
  "error": {
    "message": "Category not found"
  }
}
```

**400 Bad Request (Inactive Category):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot create item in inactive category"
  }
}
```

---

### Update Item

Update an existing item. Users can only update their own items.

**Endpoint:** `PUT /api/v1/items/:id`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (required): UUID of the item to update

**Request Body:**
All fields are optional. Only include fields you want to update.

```json
{
  "titleAr": "لابتوب ديل XPS 13 محدّث",
  "titleEn": "Dell XPS 13 Laptop Updated",
  "descriptionAr": "وصف محدّث",
  "descriptionEn": "Updated description",
  "categoryId": "423e4567-e89b-12d3-a456-426614174003",
  "condition": "GOOD",
  "quantity": 1,
  "location": "Maadi",
  "governorate": "Cairo"
}
```

**Request Example:**
```bash
curl -X PUT "http://localhost:5000/api/v1/items/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "condition": "GOOD",
    "location": "Maadi"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sellerId": "223e4567-e89b-12d3-a456-426614174001",
    "categoryId": "323e4567-e89b-12d3-a456-426614174002",
    "titleAr": "لابتوب ديل XPS 13",
    "titleEn": "Dell XPS 13 Laptop",
    "descriptionAr": "لابتوب ديل XPS 13 في حالة ممتازة",
    "descriptionEn": "Dell XPS 13 in excellent condition",
    "condition": "GOOD",
    "quantity": 1,
    "images": ["/uploads/items/uuid-001-processed.jpg"],
    "location": "Maadi",
    "governorate": "Cairo",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z",
    "seller": {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "fullName": "Ahmed Mohamed",
      "avatar": "/uploads/avatars/user-001-processed.jpg",
      "accountType": "INDIVIDUAL"
    },
    "category": {
      "id": "323e4567-e89b-12d3-a456-426614174002",
      "nameAr": "أجهزة كمبيوتر",
      "nameEn": "Computers",
      "slug": "computers"
    }
  },
  "message": "Item updated successfully"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Item not found"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "message": "You can only update your own items"
  }
}
```

---

### Delete Item

Delete an item. Users can only delete their own items.

**Endpoint:** `DELETE /api/v1/items/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (required): UUID of the item to delete

**Request Example:**
```bash
curl -X DELETE "http://localhost:5000/api/v1/items/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <access_token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Item deleted successfully"
  },
  "message": "Item deleted successfully"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Item not found"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "message": "You can only delete your own items"
  }
}
```

**400 Bad Request (Active Listings):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot delete item with active listings. Close or complete the listings first."
  }
}
```

---

### Add Item Images

Add new images to an existing item (max 10 images total per item).

**Endpoint:** `POST /api/v1/items/:id/images`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Path Parameters:**
- `id` (required): UUID of the item

**Form Data:**
- `images` (required): Array of image files (max 5MB each)

**Request Example:**
```bash
curl -X POST "http://localhost:5000/api/v1/items/123e4567-e89b-12d3-a456-426614174000/images" \
  -H "Authorization: Bearer <access_token>" \
  -F "images=@laptop3.jpg" \
  -F "images=@laptop4.jpg"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "images": [
      "/uploads/items/uuid-001-processed.jpg",
      "/uploads/items/uuid-002-processed.jpg",
      "/uploads/items/uuid-003-processed.jpg",
      "/uploads/items/uuid-004-processed.jpg"
    ],
    "...": "...other item fields"
  },
  "message": "Images added successfully"
}
```

**Error Responses:**

**400 Bad Request (Too Many Images):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot add 5 images. Maximum 10 images per item. Current: 7"
  }
}
```

---

### Remove Item Images

Remove specific images from an item.

**Endpoint:** `DELETE /api/v1/items/:id/images`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (required): UUID of the item

**Request Body:**
```json
{
  "imagesToRemove": [
    "/uploads/items/uuid-003-processed.jpg",
    "/uploads/items/uuid-004-processed.jpg"
  ]
}
```

**Request Example:**
```bash
curl -X DELETE "http://localhost:5000/api/v1/items/123e4567-e89b-12d3-a456-426614174000/images" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "imagesToRemove": ["/uploads/items/uuid-003-processed.jpg"]
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "images": [
      "/uploads/items/uuid-001-processed.jpg",
      "/uploads/items/uuid-002-processed.jpg"
    ],
    "...": "...other item fields"
  },
  "message": "Images removed successfully"
}
```

**Error Responses:**

**400 Bad Request (Invalid Images):**
```json
{
  "success": false,
  "error": {
    "message": "Some images do not belong to this item"
  }
}
```

---

## Data Models

### Item Object

```typescript
{
  id: string;                    // UUID
  sellerId: string;              // Seller UUID
  categoryId: string;            // Category UUID
  titleAr: string;               // Arabic title (required)
  titleEn: string | null;        // English title (optional)
  descriptionAr: string;         // Arabic description (required)
  descriptionEn: string | null;  // English description (optional)
  condition: ItemCondition;      // NEW | LIKE_NEW | EXCELLENT | GOOD | FAIR | POOR | FOR_PARTS
  quantity: number;              // Available quantity
  images: string[];              // Array of image URLs (max 10)
  location: string;              // Specific location/address
  governorate: string;           // Egyptian governorate
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp

  // Relations (when included)
  seller: {
    id: string;
    fullName: string;
    avatar: string | null;
    accountType: 'INDIVIDUAL' | 'BUSINESS';
    businessName?: string | null;
  };
  category: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    parent?: {
      id: string;
      nameAr: string;
      nameEn: string;
      slug: string;
    };
  };
}
```

### Pagination Object

```typescript
{
  page: number;        // Current page number
  limit: number;       // Items per page
  total: number;       // Total items count
  totalPages: number;  // Total pages
  hasMore: boolean;    // Whether more pages exist
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error message here"
  }
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Item created successfully
- `400 Bad Request` - Invalid request data or business rule violation
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have permission (e.g., trying to modify someone else's item)
- `404 Not Found` - Item or related resource not found
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

### Validation Error Format

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "titleAr",
        "message": "Arabic title must be at least 3 characters"
      },
      {
        "field": "governorate",
        "message": "Invalid governorate"
      }
    ]
  }
}
```

---

## Image Upload Guidelines

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### File Size Limits
- Maximum file size: 5MB per image
- Maximum images per item: 10 images
- Images are automatically processed and optimized

### Image Processing
All uploaded images are automatically:
- Resized to 1200x1200 pixels (maintaining aspect ratio)
- Converted to JPEG format
- Compressed with 85% quality
- Progressive JPEG encoding for faster loading

### Image URLs
Images are served from `/uploads/items/` directory:
```
http://localhost:5000/uploads/items/uuid-processed.jpg
```

---

## Usage Notes

### Bilingual Support
- Arabic title and description are required
- English title and description are optional
- Useful for international buyers and SEO

### Item Ownership
- Users can only update and delete their own items
- Attempting to modify another user's item returns 403 Forbidden

### Active Listings Protection
- Items with active listings cannot be deleted
- Close or complete all listings before deleting an item

### Category Validation
- Category must exist and be active
- Cannot create items in inactive categories

### Image Management
- Items can have 0-10 images
- Images are automatically cleaned up when items are deleted
- Failed image uploads automatically clean up partial uploads

### Search Optimization
- Search queries are case-insensitive
- Searches across both Arabic and English titles/descriptions
- Use filters to narrow down results efficiently

### Pagination Best Practices
- Default limit is 20 items per page
- Maximum limit is 100 items per page
- Use `hasMore` field to determine if more pages exist

---

## Questions or Issues?

If you encounter any issues or have questions about the Items API, please contact the development team.
