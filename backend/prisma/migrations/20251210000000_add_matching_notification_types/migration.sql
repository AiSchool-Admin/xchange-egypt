-- Add new notification types for smart matching
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PURCHASE_REQUEST_MATCH';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SALE_TO_DEMAND';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'DEMAND_TO_SUPPLY';
