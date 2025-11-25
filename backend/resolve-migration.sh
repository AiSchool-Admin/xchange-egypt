#!/bin/bash

# This script resolves the failed migration and allows new migrations to run
# Run this ONCE on Railway before redeploying

echo "🔧 Resolving failed migration..."

# Mark the failed migration as rolled back so Prisma can proceed
npx prisma migrate resolve --rolled-back "20250125000001_seed_3_level_categories"

echo "✅ Migration resolved! Now redeploy on Railway."
