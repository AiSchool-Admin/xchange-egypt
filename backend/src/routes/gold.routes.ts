/**
 * Gold Marketplace Routes
 * مسارات سوق الذهب
 */

import { Router } from 'express';
import * as goldController from '../controllers/gold.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// Public Routes (لا تحتاج تسجيل دخول)
// ============================================

// Gold Prices - أسعار الذهب
router.get('/prices', goldController.getPrices);
router.get('/prices/:karat', goldController.getPriceByKarat);

// Price Calculator - حاسبة السعر
router.post('/calculate', goldController.calculatePrice);
router.get('/price-range/:karat', goldController.getSuggestedPriceRange);

// Gold Items - قطع الذهب (قراءة فقط)
router.get('/items', goldController.getItems);
router.get('/items/:id', goldController.getItemById);

// Gold Partners - الصاغة الشركاء
router.get('/partners', goldController.getPartners);
router.get('/partners/:id', goldController.getPartnerById);

// Statistics - الإحصائيات
router.get('/statistics', goldController.getStatistics);

// ============================================
// Protected Routes (تحتاج تسجيل دخول)
// ============================================

// Gold Items - إدارة قطع الذهب
router.post('/items', authenticate, goldController.createItem);
router.put('/items/:id', authenticate, goldController.updateItem);
router.delete('/items/:id', authenticate, goldController.deleteItem);
router.get('/my-items', authenticate, goldController.getMyItems);

// Gold Transactions - المعاملات
router.post('/transactions', authenticate, goldController.createTransaction);
router.put('/transactions/:id/status', authenticate, goldController.updateTransactionStatus);
router.get('/transactions', authenticate, goldController.getMyTransactions);

// Admin Routes - مسارات الإدارة
router.post('/prices', authenticate, goldController.updatePrices);

export default router;
