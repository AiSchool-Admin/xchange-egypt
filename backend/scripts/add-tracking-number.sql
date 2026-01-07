-- Add tracking_number column to orders table
-- This column stores the shipping tracking number for orders

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT;
