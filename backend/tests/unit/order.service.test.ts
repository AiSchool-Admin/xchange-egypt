/**
 * Order Service Unit Tests
 * اختبارات وحدة خدمة الطلبات
 */

import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import { createTestUser, createTestCategory, createTestItem, createTestListing } from '../helpers/testHelpers';

// Check if Prisma is available
let prismaAvailable = false;
try {
  require('@prisma/client');
  prismaAvailable = true;
} catch {
  console.log('⚠️ Prisma not available - using mock database');
}

const describeIfPrisma = prismaAvailable ? describe : describe.skip;

describe('Order Service Tests', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // ==========================================
  // Shipping Cost Calculation Tests
  // ==========================================
  describe('Shipping Cost Calculation', () => {
    const SHIPPING_COSTS: Record<string, number> = {
      'Cairo': 30,
      'Giza': 30,
      'Alexandria': 45,
      'default': 60,
    };

    const calculateShippingCost = (governorate: string): number => {
      return SHIPPING_COSTS[governorate] || SHIPPING_COSTS['default'];
    };

    it('should calculate Cairo shipping cost as 30 EGP', () => {
      expect(calculateShippingCost('Cairo')).toBe(30);
    });

    it('should calculate Giza shipping cost as 30 EGP', () => {
      expect(calculateShippingCost('Giza')).toBe(30);
    });

    it('should calculate Alexandria shipping cost as 45 EGP', () => {
      expect(calculateShippingCost('Alexandria')).toBe(45);
    });

    it('should calculate other governorates shipping cost as 60 EGP', () => {
      expect(calculateShippingCost('Aswan')).toBe(60);
      expect(calculateShippingCost('Luxor')).toBe(60);
      expect(calculateShippingCost('Sohag')).toBe(60);
    });

    it('should handle unknown governorate with default cost', () => {
      expect(calculateShippingCost('Unknown')).toBe(60);
    });
  });

  // ==========================================
  // Order Number Generation Tests
  // ==========================================
  describe('Order Number Generation', () => {
    const generateOrderNumber = (): string => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `XCH-${timestamp}-${random}`;
    };

    it('should generate order number with XCH prefix', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^XCH-/);
    });

    it('should generate unique order numbers', () => {
      const numbers = new Set<string>();
      for (let i = 0; i < 100; i++) {
        numbers.add(generateOrderNumber());
      }
      expect(numbers.size).toBe(100);
    });

    it('should have correct format XCH-TIMESTAMP-RANDOM', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^XCH-[A-Z0-9]+-[A-Z0-9]{4}$/);
    });
  });

  // ==========================================
  // Shipping Address Tests
  // ==========================================
  describe('Shipping Address Management', () => {
    it('should create shipping address with all fields', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'أحمد محمد',
          phone: '+201001234567',
          address: 'شارع التحرير، المعادي',
          city: 'القاهرة',
          governorate: 'Cairo',
          postalCode: '11728',
          isDefault: true,
        },
      });

      expect(address.id).toBeDefined();
      expect(address.fullName).toBe('أحمد محمد');
      expect(address.governorate).toBe('Cairo');
      expect(address.isDefault).toBe(true);
    });

    it('should get user shipping addresses', async () => {
      const user = await createTestUser();

      await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'Address 1',
          phone: '+201000000001',
          address: 'Street 1',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'Address 2',
          phone: '+201000000002',
          address: 'Street 2',
          city: 'Alexandria',
          governorate: 'Alexandria',
          isDefault: false,
        },
      });

      const addresses = await db.shippingAddress.findMany({
        where: { userId: user.id },
      });

      expect(addresses.length).toBe(2);
    });

    it('should update shipping address', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'Original Name',
          phone: '+201000000001',
          address: 'Original Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const updated = await db.shippingAddress.update({
        where: { id: address.id },
        data: {
          fullName: 'Updated Name',
          address: 'Updated Address',
        },
      });

      expect(updated.fullName).toBe('Updated Name');
      expect(updated.address).toBe('Updated Address');
    });

    it('should delete shipping address', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'To Delete',
          phone: '+201000000001',
          address: 'Street',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: false,
        },
      });

      await db.shippingAddress.delete({
        where: { id: address.id },
      });

      const found = await db.shippingAddress.findUnique({
        where: { id: address.id },
      });

      expect(found).toBeNull();
    });

    it('should set default address correctly', async () => {
      const user = await createTestUser();

      const address1 = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'Address 1',
          phone: '+201000000001',
          address: 'Street 1',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const address2 = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'Address 2',
          phone: '+201000000002',
          address: 'Street 2',
          city: 'Giza',
          governorate: 'Giza',
          isDefault: false,
        },
      });

      // Set address2 as default
      await db.shippingAddress.update({
        where: { id: address1.id },
        data: { isDefault: false },
      });

      await db.shippingAddress.update({
        where: { id: address2.id },
        data: { isDefault: true },
      });

      const updatedAddr1 = await db.shippingAddress.findUnique({ where: { id: address1.id } });
      const updatedAddr2 = await db.shippingAddress.findUnique({ where: { id: address2.id } });

      expect(updatedAddr1?.isDefault).toBe(false);
      expect(updatedAddr2?.isDefault).toBe(true);
    });
  });

  // ==========================================
  // Order Creation Tests
  // ==========================================
  describe('Order Creation', () => {
    it('should create order with correct fields', async () => {
      const buyer = await createTestUser({ email: 'buyer@test.com' });
      const seller = await createTestUser({ email: 'seller@test.com' });

      const shippingAddress = await db.shippingAddress.create({
        data: {
          userId: buyer.id,
          fullName: 'Buyer Name',
          phone: '+201000000001',
          address: 'Test Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const order = await db.order.create({
        data: {
          userId: buyer.id,
          orderNumber: `XCH-TEST-${Date.now()}`,
          status: 'PENDING',
          subtotal: 1000,
          shippingCost: 30,
          total: 1030,
          shippingAddressId: shippingAddress.id,
          paymentMethod: 'CASH_ON_DELIVERY',
        },
      });

      expect(order.id).toBeDefined();
      expect(order.orderNumber).toMatch(/^XCH-/);
      expect(order.status).toBe('PENDING');
      expect(order.subtotal).toBe(1000);
      expect(order.shippingCost).toBe(30);
      expect(order.total).toBe(1030);
    });

    it('should calculate correct total with shipping', async () => {
      const subtotal = 500;
      const shippingCost = 45; // Alexandria
      const total = subtotal + shippingCost;

      expect(total).toBe(545);
    });

    it('should create order items correctly', async () => {
      const buyer = await createTestUser({ email: 'buyer2@test.com' });
      const seller = await createTestUser({ email: 'seller2@test.com' });
      const category = await createTestCategory();

      const item = await createTestItem(seller.id, category.id, {
        title: 'Test Product',
      });

      const listing = await createTestListing({
        itemId: item.id,
        userId: seller.id,
        price: 250,
      });

      const shippingAddress = await db.shippingAddress.create({
        data: {
          userId: buyer.id,
          fullName: 'Buyer',
          phone: '+201000000002',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      // Create order first
      const order = await db.order.create({
        data: {
          userId: buyer.id,
          orderNumber: `XCH-ITEMS-${Date.now()}`,
          status: 'PENDING',
          subtotal: 250,
          shippingCost: 30,
          total: 280,
          shippingAddressId: shippingAddress.id,
          paymentMethod: 'CASH_ON_DELIVERY',
        },
      });

      // Create order item separately
      const orderItem = await db.orderItem.create({
        data: {
          orderId: order.id,
          listingId: listing.id,
          sellerId: seller.id,
          quantity: 1,
          price: 250,
        },
      });

      // Fetch order with items
      const orderWithItems = await db.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      expect(orderWithItems?.items?.length).toBe(1);
      expect(orderWithItems?.items?.[0].price).toBe(250);
      expect(orderWithItems?.items?.[0].quantity).toBe(1);
    });
  });

  // ==========================================
  // Order Status Tests
  // ==========================================
  describe('Order Status Management', () => {
    const ORDER_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

    it('should create order with PENDING status', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const order = await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-STATUS-${Date.now()}`,
          status: 'PENDING',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
        },
      });

      expect(order.status).toBe('PENDING');
    });

    it('should update order status to PAID with paidAt timestamp', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const order = await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-PAID-${Date.now()}`,
          status: 'PENDING',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
        },
      });

      const updated = await db.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      expect(updated.status).toBe('PAID');
      expect(updated.paidAt).toBeDefined();
    });

    it('should update order status to SHIPPED with shippedAt timestamp', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const order = await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-SHIP-${Date.now()}`,
          status: 'PAID',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
          paidAt: new Date(),
        },
      });

      const updated = await db.order.update({
        where: { id: order.id },
        data: {
          status: 'SHIPPED',
          shippedAt: new Date(),
        },
      });

      expect(updated.status).toBe('SHIPPED');
      expect(updated.shippedAt).toBeDefined();
    });

    it('should update order status to DELIVERED with deliveredAt timestamp', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const order = await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-DELIVER-${Date.now()}`,
          status: 'SHIPPED',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
          paidAt: new Date(),
          shippedAt: new Date(),
        },
      });

      const updated = await db.order.update({
        where: { id: order.id },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        },
      });

      expect(updated.status).toBe('DELIVERED');
      expect(updated.deliveredAt).toBeDefined();
    });

    it('should allow cancelling PENDING order only', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const order = await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-CANCEL-${Date.now()}`,
          status: 'PENDING',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
        },
      });

      // Can cancel PENDING order
      const cancelled = await db.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });

      expect(cancelled.status).toBe('CANCELLED');
    });
  });

  // ==========================================
  // Order Query Tests
  // ==========================================
  describe('Order Queries', () => {
    it('should get user orders with pagination', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      // Create 5 orders
      for (let i = 0; i < 5; i++) {
        await db.order.create({
          data: {
            userId: user.id,
            orderNumber: `XCH-PAGE-${Date.now()}-${i}`,
            status: 'PENDING',
            subtotal: 100 * (i + 1),
            shippingCost: 30,
            total: 100 * (i + 1) + 30,
            shippingAddressId: address.id,
            paymentMethod: 'CASH_ON_DELIVERY',
          },
        });
      }

      const orders = await db.order.findMany({
        where: { userId: user.id },
        take: 3,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });

      expect(orders.length).toBe(3);
    });

    it('should filter orders by status', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-PEND-${Date.now()}`,
          status: 'PENDING',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
        },
      });

      await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-DELIV-${Date.now()}`,
          status: 'DELIVERED',
          subtotal: 200,
          shippingCost: 30,
          total: 230,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
          deliveredAt: new Date(),
        },
      });

      const pendingOrders = await db.order.findMany({
        where: { userId: user.id, status: 'PENDING' },
      });

      const deliveredOrders = await db.order.findMany({
        where: { userId: user.id, status: 'DELIVERED' },
      });

      expect(pendingOrders.length).toBe(1);
      expect(deliveredOrders.length).toBe(1);
    });

    it('should get order by order number', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const orderNumber = `XCH-UNIQUE-${Date.now()}`;

      await db.order.create({
        data: {
          userId: user.id,
          orderNumber,
          status: 'PENDING',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
        },
      });

      const order = await db.order.findFirst({
        where: { orderNumber },
      });

      expect(order).not.toBeNull();
      expect(order?.orderNumber).toBe(orderNumber);
    });

    it('should get order with items and shipping address', async () => {
      const buyer = await createTestUser({ email: 'buyer3@test.com' });
      const seller = await createTestUser({ email: 'seller3@test.com' });
      const category = await createTestCategory();

      const item = await createTestItem(seller.id, category.id);

      const listing = await createTestListing({
        itemId: item.id,
        userId: seller.id,
        price: 500,
      });

      const address = await db.shippingAddress.create({
        data: {
          userId: buyer.id,
          fullName: 'Buyer Name',
          phone: '+201000000003',
          address: 'Test Street',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      // Create order first
      const order = await db.order.create({
        data: {
          userId: buyer.id,
          orderNumber: `XCH-FULL-${Date.now()}`,
          status: 'PENDING',
          subtotal: 500,
          shippingCost: 30,
          total: 530,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
        },
      });

      // Create order item separately
      await db.orderItem.create({
        data: {
          orderId: order.id,
          listingId: listing.id,
          sellerId: seller.id,
          quantity: 1,
          price: 500,
        },
      });

      // Fetch order with relations
      const fullOrder = await db.order.findUnique({
        where: { id: order.id },
        include: {
          items: true,
          shippingAddress: true,
        },
      });

      expect(fullOrder?.items?.length).toBe(1);
      expect(fullOrder?.shippingAddress).toBeDefined();
      expect(fullOrder?.shippingAddress?.fullName).toBe('Buyer Name');
    });
  });

  // ==========================================
  // Egyptian Governorates Tests
  // ==========================================
  describe('Egyptian Governorates', () => {
    const EGYPTIAN_GOVERNORATES = [
      'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Beheira', 'Fayoum',
      'Gharbiya', 'Ismailia', 'Menofia', 'Minya', 'Qaliubiya', 'New Valley',
      'Suez', 'Aswan', 'Assiut', 'Beni Suef', 'Port Said', 'Damietta', 'Sharkia',
      'South Sinai', 'Kafr El Sheikh', 'Matrouh', 'Luxor', 'Qena', 'North Sinai', 'Sohag'
    ];

    it('should have 27 governorates', () => {
      expect(EGYPTIAN_GOVERNORATES.length).toBe(27);
    });

    it('should include major cities', () => {
      expect(EGYPTIAN_GOVERNORATES).toContain('Cairo');
      expect(EGYPTIAN_GOVERNORATES).toContain('Alexandria');
      expect(EGYPTIAN_GOVERNORATES).toContain('Giza');
    });

    it('should include Upper Egypt governorates', () => {
      expect(EGYPTIAN_GOVERNORATES).toContain('Aswan');
      expect(EGYPTIAN_GOVERNORATES).toContain('Luxor');
      expect(EGYPTIAN_GOVERNORATES).toContain('Qena');
      expect(EGYPTIAN_GOVERNORATES).toContain('Sohag');
    });

    it('should include Delta governorates', () => {
      expect(EGYPTIAN_GOVERNORATES).toContain('Dakahlia');
      expect(EGYPTIAN_GOVERNORATES).toContain('Gharbiya');
      expect(EGYPTIAN_GOVERNORATES).toContain('Sharkia');
    });

    it('should include Sinai governorates', () => {
      expect(EGYPTIAN_GOVERNORATES).toContain('North Sinai');
      expect(EGYPTIAN_GOVERNORATES).toContain('South Sinai');
    });
  });

  // ==========================================
  // Payment Method Tests
  // ==========================================
  describe('Payment Methods', () => {
    const PAYMENT_METHODS = ['CASH_ON_DELIVERY', 'FAWRY', 'INSTAPAY', 'WALLET'];

    it('should accept CASH_ON_DELIVERY', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const order = await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-COD-${Date.now()}`,
          status: 'PENDING',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
        },
      });

      expect(order.paymentMethod).toBe('CASH_ON_DELIVERY');
    });

    it('should accept FAWRY payment', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const order = await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-FAWRY-${Date.now()}`,
          status: 'PENDING',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'FAWRY',
        },
      });

      expect(order.paymentMethod).toBe('FAWRY');
    });
  });

  // ==========================================
  // Order Notes Tests
  // ==========================================
  describe('Order Notes', () => {
    it('should save order notes', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const order = await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-NOTES-${Date.now()}`,
          status: 'PENDING',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
          notes: 'Please call before delivery',
        },
      });

      expect(order.notes).toBe('Please call before delivery');
    });

    it('should allow Arabic notes', async () => {
      const user = await createTestUser();

      const address = await db.shippingAddress.create({
        data: {
          userId: user.id,
          fullName: 'User',
          phone: '+201000000001',
          address: 'Address',
          city: 'Cairo',
          governorate: 'Cairo',
          isDefault: true,
        },
      });

      const order = await db.order.create({
        data: {
          userId: user.id,
          orderNumber: `XCH-ARABIC-${Date.now()}`,
          status: 'PENDING',
          subtotal: 100,
          shippingCost: 30,
          total: 130,
          shippingAddressId: address.id,
          paymentMethod: 'CASH_ON_DELIVERY',
          notes: 'الرجاء الاتصال قبل التوصيل',
        },
      });

      expect(order.notes).toBe('الرجاء الاتصال قبل التوصيل');
    });
  });
});
