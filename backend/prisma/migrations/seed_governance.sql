-- ============================================
-- Seed Governance Data - بيانات الحوكمة
-- ============================================

-- Get CEO member ID for KPI ownership
DO $$
DECLARE
  ceo_id TEXT;
  cfo_id TEXT;
  coo_id TEXT;
  cto_id TEXT;
  cmo_id TEXT;
BEGIN
  -- Get member IDs
  SELECT id INTO ceo_id FROM board_members WHERE role = 'CEO' LIMIT 1;
  SELECT id INTO cfo_id FROM board_members WHERE role = 'CFO' LIMIT 1;
  SELECT id INTO coo_id FROM board_members WHERE role = 'COO' LIMIT 1;
  SELECT id INTO cto_id FROM board_members WHERE role = 'CTO' LIMIT 1;
  SELECT id INTO cmo_id FROM board_members WHERE role = 'CMO' LIMIT 1;

  -- If CEO not found, use first available member
  IF ceo_id IS NULL THEN
    SELECT id INTO ceo_id FROM board_members LIMIT 1;
  END IF;

  -- Insert KPIs - Financial
  INSERT INTO kpi_metrics (id, code, name, name_ar, category, unit, current_value, target_value, warning_threshold, critical_threshold, threshold_direction, status, owner_id, last_updated_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'GMV', 'Gross Merchandise Value', 'إجمالي قيمة البضائع', 'FINANCIAL', 'EGP', 8500000, 10000000, 7000000, 5000000, 'above', 'YELLOW', COALESCE(cfo_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'REVENUE', 'Monthly Revenue', 'الإيرادات الشهرية', 'FINANCIAL', 'EGP', 420000, 500000, 350000, 250000, 'above', 'YELLOW', COALESCE(cfo_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'CAC', 'Customer Acquisition Cost', 'تكلفة اكتساب العميل', 'FINANCIAL', 'EGP', 45, 50, 75, 100, 'below', 'GREEN', COALESCE(cfo_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'LTV', 'Customer Lifetime Value', 'القيمة الدائمة للعميل', 'FINANCIAL', 'EGP', 850, 1000, 700, 500, 'above', 'YELLOW', COALESCE(cfo_id, ceo_id), NOW(), NOW(), NOW())
  ON CONFLICT (code) DO NOTHING;

  -- Insert KPIs - Operational
  INSERT INTO kpi_metrics (id, code, name, name_ar, category, unit, current_value, target_value, warning_threshold, critical_threshold, threshold_direction, status, owner_id, last_updated_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'ORDER_FULFILLMENT', 'Order Fulfillment Rate', 'معدل إتمام الطلبات', 'OPERATIONAL', '%', 92, 95, 85, 75, 'above', 'YELLOW', COALESCE(coo_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'DELIVERY_TIME', 'Average Delivery Time', 'متوسط وقت التوصيل', 'OPERATIONAL', 'hours', 52, 48, 72, 96, 'below', 'YELLOW', COALESCE(coo_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'DISPUTE_RATE', 'Dispute Rate', 'معدل النزاعات', 'OPERATIONAL', '%', 3.5, 2, 5, 10, 'below', 'YELLOW', COALESCE(coo_id, ceo_id), NOW(), NOW(), NOW())
  ON CONFLICT (code) DO NOTHING;

  -- Insert KPIs - Customer
  INSERT INTO kpi_metrics (id, code, name, name_ar, category, unit, current_value, target_value, warning_threshold, critical_threshold, threshold_direction, status, owner_id, last_updated_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'NPS', 'Net Promoter Score', 'صافي نقاط الترويج', 'CUSTOMER', 'score', 45, 50, 30, 10, 'above', 'YELLOW', COALESCE(cmo_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'RETENTION', 'Customer Retention Rate', 'معدل الاحتفاظ بالعملاء', 'CUSTOMER', '%', 75, 80, 60, 40, 'above', 'YELLOW', COALESCE(cmo_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'SUPPORT_RESPONSE', 'Support Response Time', 'وقت استجابة الدعم', 'CUSTOMER', 'minutes', 25, 30, 60, 120, 'below', 'GREEN', COALESCE(cmo_id, ceo_id), NOW(), NOW(), NOW())
  ON CONFLICT (code) DO NOTHING;

  -- Insert KPIs - Technical
  INSERT INTO kpi_metrics (id, code, name, name_ar, category, unit, current_value, target_value, warning_threshold, critical_threshold, threshold_direction, status, owner_id, last_updated_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'UPTIME', 'System Uptime', 'وقت تشغيل النظام', 'TECHNICAL', '%', 99.5, 99.9, 99, 95, 'above', 'YELLOW', COALESCE(cto_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'API_LATENCY', 'API Response Time', 'وقت استجابة API', 'TECHNICAL', 'ms', 180, 200, 500, 1000, 'below', 'GREEN', COALESCE(cto_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'ERROR_RATE', 'Error Rate', 'معدل الأخطاء', 'TECHNICAL', '%', 0.3, 0.1, 1, 5, 'below', 'YELLOW', COALESCE(cto_id, ceo_id), NOW(), NOW(), NOW())
  ON CONFLICT (code) DO NOTHING;

  -- Insert KPIs - Growth
  INSERT INTO kpi_metrics (id, code, name, name_ar, category, unit, current_value, target_value, warning_threshold, critical_threshold, threshold_direction, status, owner_id, last_updated_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'MAU', 'Monthly Active Users', 'المستخدمين النشطين شهرياً', 'GROWTH', 'users', 85000, 100000, 70000, 50000, 'above', 'YELLOW', COALESCE(cmo_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'USER_GROWTH', 'User Growth Rate', 'معدل نمو المستخدمين', 'GROWTH', '%', 8, 10, 5, 0, 'above', 'YELLOW', COALESCE(cmo_id, ceo_id), NOW(), NOW(), NOW()),
    (gen_random_uuid(), 'LISTING_GROWTH', 'New Listings Growth', 'نمو الإعلانات الجديدة', 'GROWTH', '%', 12, 15, 5, -5, 'above', 'YELLOW', COALESCE(cmo_id, ceo_id), NOW(), NOW(), NOW())
  ON CONFLICT (code) DO NOTHING;

  -- Create a sample scheduled meeting - Weekly Board Meeting
  INSERT INTO board_meetings (id, meeting_number, type, status, title, title_ar, scheduled_at, duration, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'WKL-2025-001',
    'WEEKLY',
    'SCHEDULED',
    'Weekly Board Strategy Meeting',
    'اجتماع الاستراتيجية الأسبوعي',
    NOW() + INTERVAL '2 days',
    60,
    NOW(),
    NOW()
  ) ON CONFLICT DO NOTHING;

  -- Create another scheduled meeting - Monthly Review
  INSERT INTO board_meetings (id, meeting_number, type, status, title, title_ar, scheduled_at, duration, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'MTH-2025-001',
    'MONTHLY',
    'SCHEDULED',
    'December Monthly Performance Review',
    'مراجعة الأداء الشهرية - ديسمبر',
    NOW() + INTERVAL '7 days',
    180,
    NOW(),
    NOW()
  ) ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Governance data seeded successfully!';
END $$;

-- Display summary
SELECT 'KPIs created:' as info, COUNT(*) as count FROM kpi_metrics
UNION ALL
SELECT 'Meetings created:', COUNT(*) FROM board_meetings;
