/**
 * Simple Test Server - Uses pg directly without Prisma binaries
 * This is for testing the platform when Prisma binaries are unavailable
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'xchange-dev-secret-key-for-testing-2024';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xchange_user:dev123@localhost:5432/xchange',
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Response helper
const successResponse = (res: Response, data: any, message: string, status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

// ============================================
// Auth Routes
// ============================================

// Register
app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, governorate, city, district } = req.body;

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, governorate, city, district, primary_governorate, primary_city, primary_district, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $6, $7, $8, NOW())`,
      [id, email, passwordHash, fullName, phone, governorate, city, district]
    );

    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });

    return successResponse(res, {
      user: { id, email, fullName, phone, governorate, city, district },
      token
    }, 'Registration successful', 201);
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Login
app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, phone, governorate, city, district FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        governorate: user.governorate,
        city: user.city,
        district: user.district,
      },
      token,
    }, 'Login successful');
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
app.get('/api/v1/auth/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      'SELECT id, email, full_name, phone, governorate, city, district, avatar, bio FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    return successResponse(res, {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      governorate: user.governorate,
      city: user.city,
      district: user.district,
      avatar: user.avatar,
      bio: user.bio,
    }, 'User retrieved');
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// Categories Routes
// ============================================

app.get('/api/v1/categories', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name_en as "nameEn", name_ar as "nameAr", slug, icon, parent_id as "parentId", "order" FROM categories WHERE is_active = true ORDER BY "order"'
    );
    return successResponse(res, result.rows, 'Categories retrieved');
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/categories/tree', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name_en as "nameEn", name_ar as "nameAr", slug, icon, parent_id as "parentId", "order" FROM categories WHERE is_active = true ORDER BY "order"'
    );

    // Build tree structure
    const categories = result.rows;
    const rootCategories = categories.filter(c => !c.parentId);

    const buildTree = (parent: any) => {
      const children = categories.filter(c => c.parentId === parent.id);
      return {
        ...parent,
        children: children.map(buildTree),
      };
    };

    const tree = rootCategories.map(buildTree);
    return successResponse(res, tree, 'Category tree retrieved');
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// Inventory Routes
// ============================================

// Market config
const MARKET_CONFIG = {
  DISTRICT: {
    nameAr: 'سوق الحي',
    nameEn: 'District Market',
    listingFee: 25,
    commissionPercent: 5,
    description: 'تبادل داخل الحي - أسرع توصيل',
  },
  CITY: {
    nameAr: 'سوق المدينة',
    nameEn: 'City Market',
    listingFee: 25,
    commissionPercent: 5,
    description: 'تبادل داخل المدينة',
  },
  GOVERNORATE: {
    nameAr: 'سوق المحافظة',
    nameEn: 'Governorate Market',
    listingFee: 25,
    commissionPercent: 5,
    description: 'تبادل داخل المحافظة',
  },
  NATIONAL: {
    nameAr: 'السوق الشامل',
    nameEn: 'National Market',
    listingFee: 25,
    commissionPercent: 5,
    description: 'تبادل على مستوى الجمهورية',
  },
};

app.get('/api/v1/inventory/markets', (req: Request, res: Response) => {
  return successResponse(res, MARKET_CONFIG, 'Markets retrieved');
});

// Get user inventory
app.get('/api/v1/inventory', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, status, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT i.*, c.name_ar as "categoryNameAr", c.name_en as "categoryNameEn"
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.seller_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (type) {
      query += ` AND i.item_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      query += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await pool.query(query, params);

    // Count total
    let countQuery = 'SELECT COUNT(*) FROM items WHERE seller_id = $1';
    const countParams = [userId];
    const countResult = await pool.query(countQuery, countParams);

    const items = result.rows.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      categoryId: item.category_id,
      categoryNameAr: item.categoryNameAr,
      categoryNameEn: item.categoryNameEn,
      condition: item.condition,
      estimatedValue: item.estimated_value,
      images: item.images || [],
      status: item.status,
      itemType: item.item_type,
      marketType: item.market_type,
      governorate: item.governorate,
      city: item.city,
      district: item.district,
      location: item.location,
      createdAt: item.created_at,
    }));

    return successResponse(res, {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult.rows[0].count),
      },
    }, 'Inventory retrieved');
  } catch (error: any) {
    console.error('Get inventory error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create inventory item
app.post('/api/v1/inventory', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      title,
      description,
      categoryId,
      condition,
      estimatedValue,
      images,
      itemType,
      marketType,
      governorate,
      city,
      district,
      location,
      desiredCategoryId,
      desiredKeywords,
      desiredValueMin,
      desiredValueMax,
    } = req.body;

    const id = uuidv4();

    await pool.query(
      `INSERT INTO items (
        id, seller_id, title, description, category_id, condition, estimated_value, images,
        item_type, market_type, governorate, city, district, location,
        desired_category_id, desired_keywords, desired_value_min, desired_value_max,
        status, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'ACTIVE', NOW())`,
      [
        id, userId, title, description, categoryId, condition || 'GOOD', estimatedValue, images || [],
        itemType || 'GOOD', marketType || 'DISTRICT', governorate, city, district, location,
        desiredCategoryId, desiredKeywords, desiredValueMin, desiredValueMax,
      ]
    );

    return successResponse(res, { id }, 'Item created successfully', 201);
  } catch (error: any) {
    console.error('Create item error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get latest items (public)
app.get('/api/v1/inventory/latest', async (req: Request, res: Response) => {
  try {
    const { limit = 8, marketType, governorate } = req.query;

    let query = `
      SELECT i.*, c.name_ar as "categoryNameAr", c.name_en as "categoryNameEn",
             u.full_name as "sellerName", u.governorate as "sellerGovernorate"
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN users u ON i.seller_id = u.id
      WHERE i.status = 'ACTIVE'
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (marketType) {
      query += ` AND i.market_type = $${paramIndex}`;
      params.push(marketType);
      paramIndex++;
    }

    if (governorate) {
      query += ` AND i.governorate = $${paramIndex}`;
      params.push(governorate);
      paramIndex++;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex}`;
    params.push(Number(limit));

    const result = await pool.query(query, params);

    const items = result.rows.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      categoryId: item.category_id,
      categoryNameAr: item.categoryNameAr,
      categoryNameEn: item.categoryNameEn,
      condition: item.condition,
      estimatedValue: item.estimated_value,
      images: item.images || [],
      status: item.status,
      itemType: item.item_type,
      marketType: item.market_type,
      governorate: item.governorate,
      city: item.city,
      district: item.district,
      sellerName: item.sellerName,
      sellerGovernorate: item.sellerGovernorate,
      createdAt: item.created_at,
    }));

    return successResponse(res, { supply: items, demand: [] }, 'Latest items retrieved');
  } catch (error: any) {
    console.error('Get latest error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Nearby items
app.get('/api/v1/inventory/nearby', async (req: Request, res: Response) => {
  try {
    const { governorate, city, district, type = 'SUPPLY', limit = 20 } = req.query;

    if (!governorate) {
      return res.status(400).json({ success: false, message: 'Governorate is required' });
    }

    let query = `
      SELECT i.*, c.name_ar as "categoryNameAr", c.name_en as "categoryNameEn"
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.status = 'ACTIVE' AND i.governorate = $1
    `;
    const params: any[] = [governorate];
    let paramIndex = 2;

    if (city) {
      query += ` AND i.city = $${paramIndex}`;
      params.push(city);
      paramIndex++;
    }

    if (district) {
      query += ` AND i.district = $${paramIndex}`;
      params.push(district);
      paramIndex++;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex}`;
    params.push(Number(limit));

    const result = await pool.query(query, params);

    const items = result.rows.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      categoryId: item.category_id,
      categoryNameAr: item.categoryNameAr,
      categoryNameEn: item.categoryNameEn,
      condition: item.condition,
      estimatedValue: item.estimated_value,
      images: item.images || [],
      marketType: item.market_type,
      governorate: item.governorate,
      city: item.city,
      district: item.district,
      createdAt: item.created_at,
    }));

    return successResponse(res, { items, count: items.length }, 'Nearby items retrieved');
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Inventory stats
app.get('/api/v1/inventory/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'TRADED' THEN 1 END) as traded,
        COUNT(CASE WHEN status = 'ARCHIVED' THEN 1 END) as archived
      FROM items WHERE seller_id = $1`,
      [userId]
    );

    return successResponse(res, result.rows[0], 'Stats retrieved');
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete item
app.delete('/api/v1/inventory/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await pool.query(
      'UPDATE items SET status = $1, updated_at = NOW() WHERE id = $2 AND seller_id = $3',
      ['DELETED', id, userId]
    );

    return successResponse(res, null, 'Item deleted');
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// Locations API
// ============================================

const EGYPT_LOCATIONS = {
  'القاهرة': {
    cities: {
      'مدينة نصر': ['الحي الأول', 'الحي السابع', 'الحي العاشر', 'المنطقة الأولى'],
      'المعادي': ['المعادي الجديدة', 'دجلة', 'زهراء المعادي', 'المعادي القديمة'],
      'مصر الجديدة': ['روكسي', 'الكوربة', 'ألماظة', 'هليوبوليس'],
      'المقطم': ['الأسمرات', 'الهضبة الوسطى', 'الهضبة العليا'],
    },
  },
  'الجيزة': {
    cities: {
      '6 أكتوبر': ['الحي الأول', 'الحي الثاني', 'الحي المتميز', 'زايد'],
      'الشيخ زايد': ['الحي الأول', 'الحي الثاني', 'بيفرلي هيلز'],
      'الدقي': ['المهندسين', 'الدقي', 'العجوزة'],
      'الهرم': ['فيصل', 'الطالبية', 'المريوطية'],
    },
  },
  'الإسكندرية': {
    cities: {
      'وسط البلد': ['المنشية', 'محطة الرمل', 'الأزاريطة'],
      'سموحة': ['سموحة', 'الفلل', 'زيزينيا'],
      'العجمي': ['البيطاش', 'الهانوفيل', 'أبو يوسف'],
    },
  },
};

app.get('/api/v1/locations', (req: Request, res: Response) => {
  return successResponse(res, EGYPT_LOCATIONS, 'Locations retrieved');
});

app.get('/api/v1/locations/governorates', (req: Request, res: Response) => {
  return successResponse(res, Object.keys(EGYPT_LOCATIONS), 'Governorates retrieved');
});

app.get('/api/v1/locations/:governorate/cities', (req: Request, res: Response) => {
  const { governorate } = req.params;
  const gov = EGYPT_LOCATIONS[governorate as keyof typeof EGYPT_LOCATIONS];
  if (!gov) {
    return res.status(404).json({ success: false, message: 'Governorate not found' });
  }
  return successResponse(res, Object.keys(gov.cities), 'Cities retrieved');
});

app.get('/api/v1/locations/:governorate/:city/districts', (req: Request, res: Response) => {
  const { governorate, city } = req.params;
  const gov = EGYPT_LOCATIONS[governorate as keyof typeof EGYPT_LOCATIONS];
  if (!gov) {
    return res.status(404).json({ success: false, message: 'Governorate not found' });
  }
  const cityData = gov.cities[city as keyof typeof gov.cities];
  if (!cityData) {
    return res.status(404).json({ success: false, message: 'City not found' });
  }
  return successResponse(res, cityData, 'Districts retrieved');
});

// ============================================
// Health Check
// ============================================

app.get('/api/v1/health', (req: Request, res: Response) => {
  return res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Xchange Egypt Test Server Running!                    ║
║                                                            ║
║   API URL: http://localhost:${PORT}/api/v1                   ║
║   Health:  http://localhost:${PORT}/api/v1/health            ║
║                                                            ║
║   Test Endpoints:                                          ║
║   - POST /api/v1/auth/register                             ║
║   - POST /api/v1/auth/login                                ║
║   - GET  /api/v1/categories                                ║
║   - GET  /api/v1/inventory/markets                         ║
║   - GET  /api/v1/inventory/latest                          ║
║   - POST /api/v1/inventory                                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
