/**
 * Run this in your browser console to seed categories
 * Just copy-paste this entire file content into browser console and press Enter
 */

(async function seedCategories() {
  console.log('🌱 Starting category seeding...\n');

  const API_URL = 'https://xchange-egypt-production.up.railway.app/api/v1/seed/seed-categories';

  try {
    console.log(`📡 Calling: ${API_URL}\n`);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('📦 Response:', data);
    console.log('');

    if (data.success) {
      console.log('✅ SUCCESS!');
      console.log(`✨ ${data.message}`);
      console.log('');
      console.log('👉 Next steps:');
      console.log('   1. Go to: https://xchange-egypt.vercel.app/barter/new');
      console.log('   2. Scroll to "Describe what you want"');
      console.log('   3. You should now see categories in the dropdowns!');
      console.log('');
      console.log('📊 Seeded categories include:');
      console.log('   - Electronics → Smartphones → iPhone, Samsung, Xiaomi, etc.');
      console.log('   - Home Appliances → Refrigerators → 16 Feet, 18 Feet, 20 Feet, 24 Feet, Side by Side');
      console.log('   - Furniture → Living Room → Sofas, TV Units');
      console.log('   - Vehicles → Cars → Sedans, SUVs, Hatchbacks');
      console.log('   - And more!');
    } else {
      console.warn('⚠️ Seeding issue:', data.message);
      if (data.message.includes('already exist')) {
        console.log('ℹ️ Categories are already in the database.');
        console.log('👉 Just refresh your barter page to see them!');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('🔍 Possible issues:');
    console.log('   - Railway backend might not be fully deployed yet');
    console.log('   - CORS configuration issue');
    console.log('   - Network error');
    console.log('');
    console.log('💡 Try opening this URL in a new tab:');
    console.log('   ' + API_URL.replace('/seed/', '/'));
    console.log('   If you see a JSON response, the backend is running!');
  }
})();
