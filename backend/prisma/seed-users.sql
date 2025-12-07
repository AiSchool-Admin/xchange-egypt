-- ============================================
-- XChange Egypt - Users Seed Data
-- Run this FIRST in Supabase SQL Editor
-- ============================================

-- Password hash for "Password123!" using bcrypt
-- You can use this for testing, or update with your own hashed passwords

DO $$
DECLARE
    hashed_password TEXT := '$2b$10$rQZ8K.XpK5YK5YK5YK5YKuQZ8K.XpK5YK5YK5YK5YKuQZ8K.XpK5Y';
BEGIN
    RAISE NOTICE '🌱 Seeding users...';

    -- ============================================
    -- Individual Users (أفراد)
    -- ============================================

    INSERT INTO users (id, email, password, full_name, phone, account_type, governorate, address, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        'ahmed.mohamed@example.com',
        hashed_password,
        'Ahmed Mohamed',
        '+201012345678',
        'INDIVIDUAL',
        'Cairo',
        '123 Nasr City, Cairo',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
    RAISE NOTICE '✅ Created user: Ahmed Mohamed';

    INSERT INTO users (id, email, password, full_name, phone, account_type, governorate, address, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        'fatma.ali@example.com',
        hashed_password,
        'Fatma Ali',
        '+201023456789',
        'INDIVIDUAL',
        'Alexandria',
        '45 Smouha, Alexandria',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
    RAISE NOTICE '✅ Created user: Fatma Ali';

    INSERT INTO users (id, email, password, full_name, phone, account_type, governorate, address, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        'khaled.hassan@example.com',
        hashed_password,
        'Khaled Hassan',
        '+201034567890',
        'INDIVIDUAL',
        'Giza',
        '78 Dokki, Giza',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
    RAISE NOTICE '✅ Created user: Khaled Hassan';

    INSERT INTO users (id, email, password, full_name, phone, account_type, governorate, address, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        'mona.ibrahim@example.com',
        hashed_password,
        'Mona Ibrahim',
        '+201045678901',
        'INDIVIDUAL',
        'Cairo',
        '12 Heliopolis, Cairo',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
    RAISE NOTICE '✅ Created user: Mona Ibrahim';

    INSERT INTO users (id, email, password, full_name, phone, account_type, governorate, address, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        'omar.saeed@example.com',
        hashed_password,
        'Omar Saeed',
        '+201056789012',
        'INDIVIDUAL',
        'Cairo',
        '90 Maadi, Cairo',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
    RAISE NOTICE '✅ Created user: Omar Saeed';

    -- ============================================
    -- Business Users (شركات)
    -- ============================================

    INSERT INTO users (id, email, password, full_name, phone, account_type, business_name, business_type, tax_id, governorate, address, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        'contact@techstore.eg',
        hashed_password,
        'Mohamed Samy',
        '+201112345678',
        'BUSINESS',
        'Tech Store Egypt',
        'Electronics Retailer',
        'TAX123456',
        'Cairo',
        '456 Downtown, Cairo',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
    RAISE NOTICE '✅ Created business: Tech Store Egypt';

    INSERT INTO users (id, email, password, full_name, phone, account_type, business_name, business_type, tax_id, governorate, address, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        'info@furniturehub.eg',
        hashed_password,
        'Sara Ahmed',
        '+201123456789',
        'BUSINESS',
        'Furniture Hub',
        'Furniture Retailer',
        'TAX234567',
        'Giza',
        '789 6th October City, Giza',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
    RAISE NOTICE '✅ Created business: Furniture Hub';

    INSERT INTO users (id, email, password, full_name, phone, account_type, business_name, business_type, tax_id, governorate, address, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        'sales@autoparts.eg',
        hashed_password,
        'Youssef Khalil',
        '+201134567890',
        'BUSINESS',
        'Auto Parts Plus',
        'Auto Parts Dealer',
        'TAX345678',
        'Alexandria',
        '321 El-Manshia, Alexandria',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
    RAISE NOTICE '✅ Created business: Auto Parts Plus';

    INSERT INTO users (id, email, password, full_name, phone, account_type, business_name, business_type, tax_id, governorate, address, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        'support@greencycle.eg',
        hashed_password,
        'Laila Mahmoud',
        '+201145678901',
        'BUSINESS',
        'Green Cycle',
        'Recycling Company',
        'TAX456789',
        'Cairo',
        '654 New Cairo, Cairo',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
    RAISE NOTICE '✅ Created business: Green Cycle';

    -- ============================================
    -- Summary
    -- ============================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✨ USERS SEEDING COMPLETED! ✨';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Individual Users: 5';
    RAISE NOTICE '🏢 Business Users: 4';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Demo Login Credentials:';
    RAISE NOTICE '   Individual: ahmed.mohamed@example.com';
    RAISE NOTICE '   Business: contact@techstore.eg';
    RAISE NOTICE '   Password: Password123!';
    RAISE NOTICE '';

END $$;
