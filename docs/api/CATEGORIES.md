# Categories API Documentation

This document provides comprehensive documentation for the Categories Management API endpoints in the Xchange platform.

## Overview

The Categories API provides endpoints for managing product/item categories with hierarchical structure support. Categories support bilingual content (Arabic and English) and can be organized in parent-child relationships.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
  - [Get All Categories](#get-all-categories)
  - [Get Root Categories](#get-root-categories)
  - [Get Category Tree](#get-category-tree)
  - [Get Category by ID](#get-category-by-id)
  - [Get Category by Slug](#get-category-by-slug)
- [Protected Endpoints (Admin)](#protected-endpoints-admin)
  - [Create Category](#create-category)
  - [Update Category](#update-category)
  - [Delete Category](#delete-category)
- [Data Models](#data-models)
- [Error Responses](#error-responses)

---

## Base URL

```
http://localhost:5000/api/v1/categories
```

## Authentication

Public endpoints do not require authentication. Admin endpoints require a valid JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Public Endpoints

### Get All Categories

Retrieves all categories with their parent and children relationships.

**Endpoint:** `GET /api/v1/categories`

**Query Parameters:**
- `includeInactive` (optional): `true` | `false` - Include inactive categories (default: `false`)

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/categories?includeInactive=false"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "nameAr": "إلكترونيات",
      "nameEn": "Electronics",
      "slug": "electronics",
      "description": "أجهزة إلكترونية وتقنية",
      "icon": "📱",
      "image": null,
      "parentId": null,
      "order": 1,
      "isActive": true,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "parent": null,
      "children": [
        {
          "id": "223e4567-e89b-12d3-a456-426614174001",
          "nameAr": "هواتف محمولة",
          "nameEn": "Mobile Phones",
          "slug": "mobile-phones",
          "icon": null,
          "image": null,
          "order": 1,
          "isActive": true
        }
      ]
    }
  ],
  "message": "Categories retrieved successfully"
}
```

---

### Get Root Categories

Retrieves only top-level categories (categories without a parent).

**Endpoint:** `GET /api/v1/categories/roots`

**Query Parameters:**
- `includeInactive` (optional): `true` | `false` - Include inactive categories (default: `false`)

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/categories/roots"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "nameAr": "إلكترونيات",
      "nameEn": "Electronics",
      "slug": "electronics",
      "description": "أجهزة إلكترونية وتقنية",
      "icon": "📱",
      "image": null,
      "parentId": null,
      "order": 1,
      "isActive": true,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "children": [
        {
          "id": "223e4567-e89b-12d3-a456-426614174001",
          "nameAr": "هواتف محمولة",
          "nameEn": "Mobile Phones",
          "slug": "mobile-phones",
          "icon": null,
          "image": null,
          "order": 1,
          "isActive": true
        }
      ]
    }
  ],
  "message": "Root categories retrieved successfully"
}
```

---

### Get Category Tree

Retrieves categories in a hierarchical tree structure.

**Endpoint:** `GET /api/v1/categories/tree`

**Query Parameters:**
- `includeInactive` (optional): `true` | `false` - Include inactive categories (default: `false`)

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/categories/tree"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "nameAr": "إلكترونيات",
      "nameEn": "Electronics",
      "slug": "electronics",
      "icon": "📱",
      "image": null,
      "order": 1,
      "isActive": true,
      "children": [
        {
          "id": "223e4567-e89b-12d3-a456-426614174001",
          "nameAr": "هواتف محمولة",
          "nameEn": "Mobile Phones",
          "slug": "mobile-phones",
          "icon": null,
          "image": null,
          "order": 1,
          "isActive": true,
          "children": []
        }
      ]
    }
  ],
  "message": "Category tree retrieved successfully"
}
```

---

### Get Category by ID

Retrieves a single category by its UUID.

**Endpoint:** `GET /api/v1/categories/:id`

**Path Parameters:**
- `id` (required): UUID of the category

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/categories/123e4567-e89b-12d3-a456-426614174000"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "nameAr": "إلكترونيات",
    "nameEn": "Electronics",
    "slug": "electronics",
    "description": "أجهزة إلكترونية وتقنية",
    "icon": "📱",
    "image": null,
    "parentId": null,
    "order": 1,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "parent": null,
    "children": [
      {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "nameAr": "هواتف محمولة",
        "nameEn": "Mobile Phones",
        "slug": "mobile-phones",
        "icon": null,
        "image": null,
        "order": 1,
        "isActive": true
      }
    ]
  },
  "message": "Category retrieved successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Category not found"
  }
}
```

---

### Get Category by Slug

Retrieves a single category by its SEO-friendly slug.

**Endpoint:** `GET /api/v1/categories/slug/:slug`

**Path Parameters:**
- `slug` (required): URL-friendly slug of the category (e.g., "electronics", "mobile-phones")

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/categories/slug/electronics"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "nameAr": "إلكترونيات",
    "nameEn": "Electronics",
    "slug": "electronics",
    "description": "أجهزة إلكترونية وتقنية",
    "icon": "📱",
    "image": null,
    "parentId": null,
    "order": 1,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "parent": null,
    "children": [
      {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "nameAr": "هواتف محمولة",
        "nameEn": "Mobile Phones",
        "slug": "mobile-phones",
        "icon": null,
        "image": null,
        "order": 1,
        "isActive": true
      }
    ]
  },
  "message": "Category retrieved successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Category not found"
  }
}
```

---

## Protected Endpoints (Admin)

### Create Category

Creates a new category. Requires authentication.

**Endpoint:** `POST /api/v1/categories`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nameAr": "إلكترونيات",
  "nameEn": "Electronics",
  "slug": "electronics",
  "description": "أجهزة إلكترونية وتقنية",
  "icon": "📱",
  "image": null,
  "parentId": null,
  "order": 1,
  "isActive": true
}
```

**Field Validations:**
- `nameAr` (required): Arabic name, minimum 2 characters
- `nameEn` (required): English name, minimum 2 characters
- `slug` (required): URL-friendly slug, lowercase with hyphens only (e.g., "mobile-phones")
- `description` (optional): Category description
- `icon` (optional): Emoji or icon identifier
- `image` (optional): Image URL/path
- `parentId` (optional): UUID of parent category (null for root categories)
- `order` (optional): Display order (default: 0)
- `isActive` (optional): Active status (default: true)

**Request Example:**
```bash
curl -X POST "http://localhost:5000/api/v1/categories" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nameAr": "هواتف محمولة",
    "nameEn": "Mobile Phones",
    "slug": "mobile-phones",
    "parentId": "123e4567-e89b-12d3-a456-426614174000",
    "order": 1
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "nameAr": "هواتف محمولة",
    "nameEn": "Mobile Phones",
    "slug": "mobile-phones",
    "description": null,
    "icon": null,
    "image": null,
    "parentId": "123e4567-e89b-12d3-a456-426614174000",
    "order": 1,
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "parent": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "nameAr": "إلكترونيات",
      "nameEn": "Electronics",
      "slug": "electronics"
    }
  },
  "message": "Category created successfully"
}
```

**Error Responses:**

**409 Conflict (Duplicate Slug):**
```json
{
  "success": false,
  "error": {
    "message": "Category with this slug already exists"
  }
}
```

**404 Not Found (Invalid Parent):**
```json
{
  "success": false,
  "error": {
    "message": "Parent category not found"
  }
}
```

**400 Bad Request (Circular Reference):**
```json
{
  "success": false,
  "error": {
    "message": "Category cannot be its own parent"
  }
}
```

---

### Update Category

Updates an existing category. Requires authentication.

**Endpoint:** `PUT /api/v1/categories/:id`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (required): UUID of the category to update

**Request Body:**
All fields are optional. Only include fields you want to update.

```json
{
  "nameAr": "إلكترونيات محدّثة",
  "nameEn": "Electronics Updated",
  "slug": "electronics-updated",
  "description": "وصف محدّث",
  "icon": "📱",
  "image": "/uploads/categories/electronics.jpg",
  "parentId": null,
  "order": 2,
  "isActive": true
}
```

**Request Example:**
```bash
curl -X PUT "http://localhost:5000/api/v1/categories/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nameAr": "إلكترونيات وتقنية",
    "order": 2
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "nameAr": "إلكترونيات وتقنية",
    "nameEn": "Electronics",
    "slug": "electronics",
    "description": "أجهزة إلكترونية وتقنية",
    "icon": "📱",
    "image": null,
    "parentId": null,
    "order": 2,
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z",
    "parent": null,
    "children": [
      {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "nameAr": "هواتف محمولة",
        "nameEn": "Mobile Phones",
        "slug": "mobile-phones"
      }
    ]
  },
  "message": "Category updated successfully"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Category not found"
  }
}
```

**409 Conflict (Duplicate Slug):**
```json
{
  "success": false,
  "error": {
    "message": "Category with this slug already exists"
  }
}
```

**400 Bad Request (Circular Reference):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot set a descendant category as parent"
  }
}
```

---

### Delete Category

Deletes a category. Requires authentication.

**Endpoint:** `DELETE /api/v1/categories/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (required): UUID of the category to delete

**Request Example:**
```bash
curl -X DELETE "http://localhost:5000/api/v1/categories/223e4567-e89b-12d3-a456-426614174001" \
  -H "Authorization: Bearer <access_token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Category deleted successfully"
  },
  "message": "Category deleted successfully"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Category not found"
  }
}
```

**400 Bad Request (Has Subcategories):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot delete category with subcategories. Delete subcategories first or reassign them."
  }
}
```

**400 Bad Request (Has Items):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot delete category with items. Reassign or delete items first."
  }
}
```

---

## Data Models

### Category Object

```typescript
{
  id: string;                    // UUID
  nameAr: string;                // Arabic name
  nameEn: string;                // English name
  slug: string;                  // URL-friendly identifier (unique)
  description: string | null;    // Category description
  icon: string | null;           // Emoji or icon identifier
  image: string | null;          // Image URL/path
  parentId: string | null;       // Parent category UUID (null for root)
  order: number;                 // Display order
  isActive: boolean;             // Active status
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp

  // Relations (when included)
  parent?: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
  };
  children?: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    icon: string | null;
    image: string | null;
    order: number;
    isActive: boolean;
  }>;
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
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data or business rule violation
- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate slug)
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
        "field": "nameAr",
        "message": "Arabic name must be at least 2 characters"
      },
      {
        "field": "slug",
        "message": "Slug must be lowercase with hyphens only"
      }
    ]
  }
}
```

---

## Seeding Categories

The platform includes a seed script to populate initial categories. Run it with:

```bash
cd backend
npx tsx prisma/seed-categories.ts
```

This will create 10 main categories with 49 subcategories:

1. **Electronics** - Mobile Phones, Computers, Tablets, Cameras, Audio & Headphones, Accessories
2. **Furniture** - Bedroom, Living Room, Office, Outdoor
3. **Vehicles** - Cars, Motorcycles, Auto Parts, Car Accessories
4. **Real Estate** - Apartments, Villas, Commercial, Land
5. **Home Appliances** - Refrigerators, Washing Machines, Air Conditioners, Ovens & Stoves, Kitchen Appliances
6. **Fashion** - Men's Clothing, Women's Clothing, Kids Clothing, Shoes, Bags, Accessories
7. **Books & Media** - Books, Magazines, DVDs & Games
8. **Sports & Hobbies** - Sports Equipment, Bicycles, Musical Instruments, Toys & Games
9. **Building Materials & Waste** - Wood, Metals, Plastics, Glass, Other Materials
10. **Services** - Maintenance & Repair, Moving & Shipping, Cleaning, Other Services

---

## Usage Notes

### Hierarchical Structure

Categories support unlimited nesting depth, but the platform prevents:
- Circular references (category cannot be its own parent)
- Setting a descendant as a parent

### Slug Guidelines

- Must be unique across all categories
- Lowercase letters and numbers only
- Use hyphens for word separation
- Examples: `electronics`, `mobile-phones`, `air-conditioners`

### Bilingual Support

All categories must have both Arabic and English names for proper localization support.

### Soft Delete

Categories are hard-deleted from the database. Make sure to:
- Delete or reassign all subcategories first
- Delete or reassign all items in the category first

### Caching Recommendation

Consider caching category tree responses for better performance, as categories change infrequently.

---

## Questions or Issues?

If you encounter any issues or have questions about the Categories API, please contact the development team.
