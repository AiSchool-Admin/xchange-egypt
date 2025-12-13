/**
 * Silver Marketplace Routes
 * مسارات سوق الفضة
 */

import { Router } from 'express';
import * as silverController from '../controllers/silver.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// Public Routes (لا تحتاج تسجيل دخول)
// ============================================

// Silver Prices - أسعار الفضة
router.get('/prices', silverController.getPrices);
router.get('/prices/:purity', silverController.getPriceByPurity);

// Price Calculator - حاسبة السعر
router.post('/calculate', silverController.calculatePrice);
router.get('/price-range/:purity', silverController.getSuggestedPriceRange);

// Silver Items - قطع الفضة (قراءة فقط)
router.get('/items', silverController.getItems);
router.get('/items/:id', silverController.getItemById);

// Silver Partners - محلات الفضة الشريكة
router.get('/partners', silverController.getPartners);
router.get('/partners/:id', silverController.getPartnerById);

// Statistics - الإحصائيات
router.get('/statistics', silverController.getStatistics);

// ============================================
// Protected Routes (تحتاج تسجيل دخول)
// ============================================

// Silver Items - إدارة قطع الفضة
router.post('/items', authenticate, silverController.createItem);
router.put('/items/:id', authenticate, silverController.updateItem);
router.delete('/items/:id', authenticate, silverController.deleteItem);
router.get('/my-items', authenticate, silverController.getMyItems);

// Silver Transactions - المعاملات
router.post('/transactions', authenticate, silverController.createTransaction);
router.put('/transactions/:id/status', authenticate, silverController.updateTransactionStatus);
router.get('/transactions', authenticate, silverController.getMyTransactions);

// Admin Routes - مسارات الإدارة
router.post('/prices', authenticate, silverController.updatePrices);

export default router;
