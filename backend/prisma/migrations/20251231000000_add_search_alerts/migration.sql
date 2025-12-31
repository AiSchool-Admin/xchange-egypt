-- CreateTable
CREATE TABLE "search_alerts" (
    "id" TEXT NOT NULL,
    "saved_search_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'INSTANT',
    "notify_push" BOOLEAN NOT NULL DEFAULT true,
    "notify_email" BOOLEAN NOT NULL DEFAULT false,
    "notify_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "alerts_sent" INTEGER NOT NULL DEFAULT 0,
    "last_alert_at" TIMESTAMP(3),
    "matched_items" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_alerts_user_id_idx" ON "search_alerts"("user_id");

-- CreateIndex
CREATE INDEX "search_alerts_is_active_idx" ON "search_alerts"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "search_alerts_saved_search_id_user_id_key" ON "search_alerts"("saved_search_id", "user_id");

-- AddForeignKey
ALTER TABLE "search_alerts" ADD CONSTRAINT "search_alerts_saved_search_id_fkey" FOREIGN KEY ("saved_search_id") REFERENCES "saved_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_alerts" ADD CONSTRAINT "search_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
