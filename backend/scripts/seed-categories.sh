#!/bin/bash

# Script to seed 3-level category hierarchy
# Usage: ./scripts/seed-categories.sh

echo "🌱 Seeding 3-level category hierarchy..."
echo ""

# Compile TypeScript seed file
echo "📦 Compiling seed file..."
npx ts-node prisma/seeds/categories-3-level.seed.ts

echo ""
echo "✅ Done!"
