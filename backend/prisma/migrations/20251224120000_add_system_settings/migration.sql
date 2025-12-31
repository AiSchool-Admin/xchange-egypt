-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "description_ar" TEXT,
    "category" TEXT DEFAULT 'general',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- Insert default company phase
INSERT INTO "system_settings" ("id", "key", "value", "description", "description_ar", "category", "created_at", "updated_at")
VALUES (gen_random_uuid(), 'company_phase', 'MVP', 'Current company phase', 'مرحلة الشركة الحالية', 'board', NOW(), NOW());
