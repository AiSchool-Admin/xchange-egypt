import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

const SEPARATOR = '='.repeat(60);

async function runSeedScript(scriptName: string, description: string): Promise<void> {
  console.log(`\n${SEPARATOR}`);
  console.log(`📦 ${description}`);
  console.log(SEPARATOR);

  try {
    const { stdout, stderr } = await execAsync(`tsx prisma/${scriptName}`);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error: any) {
    console.error(`❌ Error running ${scriptName}:`, error.message);
    throw error;
  }
}

async function clearDatabase(): Promise<void> {
  console.log('\n🧹 Clearing existing data...');

  try {
    // Delete in reverse dependency order
    await prisma.barterOffer.deleteMany({});
    console.log('   ✓ Cleared barter offers');

    await prisma.transaction.deleteMany({});
    console.log('   ✓ Cleared transactions');

    await prisma.listing.deleteMany({});
    console.log('   ✓ Cleared listings');

    await prisma.item.deleteMany({});
    console.log('   ✓ Cleared items');

    await prisma.user.deleteMany({});
    console.log('   ✓ Cleared users');

    await prisma.category.deleteMany({});
    console.log('   ✓ Cleared categories');

    console.log('✅ Database cleared successfully\n');
  } catch (error: any) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
}

async function main() {
  const startTime = Date.now();

  console.log('\n' + SEPARATOR);
  console.log('🌱 XCHANGE PLATFORM - COMPREHENSIVE DATABASE SEEDING');
  console.log(SEPARATOR);
  console.log('This will seed the database with demo data for testing');
  console.log('and demonstrations to investors.');
  console.log(SEPARATOR);

  try {
    // Step 1: Clear existing data
    await clearDatabase();

    // Step 2: Seed categories (must be first - no dependencies)
    await runSeedScript('seed-categories.ts', 'Seeding Categories');

    // Step 3: Seed users (depends on nothing)
    await runSeedScript('seed-users.ts', 'Seeding Users');

    // Step 4: Seed items (depends on categories and users)
    await runSeedScript('seed-items.ts', 'Seeding Items');

    // Step 5: Seed demo data (depends on everything above)
    await runSeedScript('seed-demo-data.ts', 'Seeding Demo Data (Listings, Transactions, Barter)');

    // Step 6: Seed barter marketplace data
    await runSeedScript('seed-barter-marketplace.ts', 'Seeding Barter Marketplace (Items, Offers, Pools, Chains)');

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + SEPARATOR);
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log(SEPARATOR);
    console.log(`⏱️  Total time: ${duration}s`);
    console.log('\n📊 Database is now populated with:');
    console.log('   • Product categories (hierarchical)');
    console.log('   • Demo users (individuals & businesses)');
    console.log('   • Sample items across categories');
    console.log('   • Active listings');
    console.log('   • Transaction history');
    console.log('   • Barter offers and exchanges');
    console.log('   • Barter marketplace items');
    console.log('   • Open barter offers');
    console.log('   • Collective barter pools');
    console.log('   • Multi-party barter chains');
    console.log('\n🔐 Demo Login Credentials:');
    console.log('   Individual: ahmed.mohamed@example.com / Password123!');
    console.log('   Business: contact@techstore.eg / Password123!');
    console.log('   All passwords: Password123!');
    console.log('\n🚀 Ready for testing and demonstrations!\n');
    console.log(SEPARATOR + '\n');

  } catch (error) {
    console.error('\n' + SEPARATOR);
    console.error('❌ SEEDING FAILED');
    console.error(SEPARATOR);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
