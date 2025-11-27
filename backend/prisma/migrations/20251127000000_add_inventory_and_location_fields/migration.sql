-- AlterTable: Add geographic location fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "primary_governorate" TEXT,
ADD COLUMN IF NOT EXISTS "primary_city" TEXT,
ADD COLUMN IF NOT EXISTS "primary_latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "primary_longitude" DOUBLE PRECISION;

-- CreateEnum: LockType
DO $$ BEGIN
 CREATE TYPE "LockType" AS ENUM ('SOFT', 'HARD', 'RESERVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: LockStatus
DO $$ BEGIN
 CREATE TYPE "LockStatus" AS ENUM ('ACTIVE', 'RELEASED', 'EXPIRED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: CashFlowStatus
DO $$ BEGIN
 CREATE TYPE "CashFlowStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: CashFlowType
DO $$ BEGIN
 CREATE TYPE "CashFlowType" AS ENUM ('CHAIN_BALANCE', 'COMMISSION', 'SHIPPING_FEE', 'ADJUSTMENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable: inventory_locks
CREATE TABLE IF NOT EXISTS "inventory_locks" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lock_type" "LockType" NOT NULL DEFAULT 'SOFT',
    "lock_status" "LockStatus" NOT NULL DEFAULT 'ACTIVE',
    "locked_by_chain_id" TEXT,
    "locked_by_offer_id" TEXT,
    "locked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "auto_release" BOOLEAN NOT NULL DEFAULT true,
    "released_at" TIMESTAMP(3),
    "released_by" TEXT,
    "release_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable: cash_flows
CREATE TABLE IF NOT EXISTS "cash_flows" (
    "id" TEXT NOT NULL,
    "chain_id" TEXT,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "flow_type" "CashFlowType" NOT NULL DEFAULT 'CHAIN_BALANCE',
    "payment_status" "CashFlowStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),

    CONSTRAINT "cash_flows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inventory_locks_item_id_idx" ON "inventory_locks"("item_id");
CREATE INDEX IF NOT EXISTS "inventory_locks_user_id_idx" ON "inventory_locks"("user_id");
CREATE INDEX IF NOT EXISTS "inventory_locks_lock_status_idx" ON "inventory_locks"("lock_status");
CREATE INDEX IF NOT EXISTS "inventory_locks_expires_at_idx" ON "inventory_locks"("expires_at");
CREATE INDEX IF NOT EXISTS "inventory_locks_locked_by_chain_id_idx" ON "inventory_locks"("locked_by_chain_id");
CREATE INDEX IF NOT EXISTS "inventory_locks_locked_by_offer_id_idx" ON "inventory_locks"("locked_by_offer_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "cash_flows_chain_id_idx" ON "cash_flows"("chain_id");
CREATE INDEX IF NOT EXISTS "cash_flows_from_user_id_idx" ON "cash_flows"("from_user_id");
CREATE INDEX IF NOT EXISTS "cash_flows_to_user_id_idx" ON "cash_flows"("to_user_id");
CREATE INDEX IF NOT EXISTS "cash_flows_payment_status_idx" ON "cash_flows"("payment_status");
CREATE INDEX IF NOT EXISTS "cash_flows_flow_type_idx" ON "cash_flows"("flow_type");
CREATE INDEX IF NOT EXISTS "cash_flows_created_at_idx" ON "cash_flows"("created_at");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "inventory_locks" ADD CONSTRAINT "inventory_locks_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "cash_flows" ADD CONSTRAINT "cash_flows_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "barter_chains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
