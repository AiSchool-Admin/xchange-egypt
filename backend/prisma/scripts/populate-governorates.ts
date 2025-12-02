/**
 * Script to populate governorate field for existing items
 * based on seller's governorate
 *
 * Run with: npx ts-node prisma/scripts/populate-governorates.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting governorate population script...');

  // Get all items without governorate
  const itemsWithoutGovernorate = await prisma.item.findMany({
    where: {
      governorate: null,
    },
    include: {
      seller: {
        select: {
          id: true,
          governorate: true,
          fullName: true,
        },
      },
    },
  });

  console.log(`Found ${itemsWithoutGovernorate.length} items without governorate`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const item of itemsWithoutGovernorate) {
    if (item.seller?.governorate) {
      await prisma.item.update({
        where: { id: item.id },
        data: { governorate: item.seller.governorate },
      });
      updatedCount++;
      console.log(`Updated item "${item.title?.substring(0, 30)}" with governorate: ${item.seller.governorate}`);
    } else {
      skippedCount++;
      console.log(`Skipped item "${item.title?.substring(0, 30)}" - seller has no governorate`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total items processed: ${itemsWithoutGovernorate.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped (no seller governorate): ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
