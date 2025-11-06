import { PrismaClient, ListingType, ListingStatus, TransactionStatus, PaymentMethod, BarterOfferStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoData() {
  console.log('🌱 Seeding demo data (listings, transactions, barter offers)...');

  // Get users
  const ahmed = await prisma.user.findUnique({ where: { email: 'ahmed.mohamed@example.com' } });
  const fatma = await prisma.user.findUnique({ where: { email: 'fatma.ali@example.com' } });
  const khaled = await prisma.user.findUnique({ where: { email: 'khaled.hassan@example.com' } });
  const mona = await prisma.user.findUnique({ where: { email: 'mona.ibrahim@example.com' } });
  const omar = await prisma.user.findUnique({ where: { email: 'omar.saeed@example.com' } });
  const techStore = await prisma.user.findUnique({ where: { email: 'contact@techstore.eg' } });

  if (!ahmed || !fatma || !khaled || !mona || !omar || !techStore) {
    throw new Error('Users not found');
  }

  // Get some items
  const items = await prisma.item.findMany({ take: 15 });
  
  if (items.length < 5) {
    throw new Error('Not enough items. Please run seed-items.ts first');
  }

  console.log('\n📋 Creating Listings...');

  // Create active listings
  const listing1 = await prisma.listing.create({
    data: {
      itemId: items[0].id,
      type: ListingType.SALE,
      status: ListingStatus.ACTIVE,
      price: 25000,
      quantity: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      notes: 'Negotiable price, serious buyers only',
    },
  });
  console.log('✅ Created active listing: Dell XPS 13');

  const listing2 = await prisma.listing.create({
    data: {
      itemId: items[1].id,
      type: ListingType.SALE,
      status: ListingStatus.ACTIVE,
      price: 12000,
      quantity: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Created active listing: Canon Camera');

  const listing3 = await prisma.listing.create({
    data: {
      itemId: items[2].id,
      type: ListingType.SALE,
      status: ListingStatus.ACTIVE,
      price: 35000,
      quantity: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Created active listing: Leather Sofa Set');

  const listing4 = await prisma.listing.create({
    data: {
      itemId: items[9].id, // Tech Store Samsung phone
      type: ListingType.SALE,
      status: ListingStatus.ACTIVE,
      price: 22000,
      quantity: 10,
      startDate: new Date(),
    },
  });
  console.log('✅ Created active listing: Samsung Galaxy S23 (Business)');

  console.log('\n💳 Creating Transactions...');

  // Transaction 1: Completed purchase
  const transaction1 = await prisma.transaction.create({
    data: {
      listingId: listing4.id,
      buyerId: ahmed.id,
      sellerId: techStore.id,
      itemId: items[9].id,
      quantity: 1,
      unitPrice: 22000,
      totalAmount: 22000,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      shippingAddress: '123 Nasr City, Cairo',
      status: TransactionStatus.DELIVERED,
      paymentReference: 'TRX20250115001',
      trackingNumber: 'TRACK123456',
      paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      shippedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      notes: 'Fast delivery, excellent condition',
    },
  });
  console.log('✅ Created completed transaction');

  // Transaction 2: Shipped
  const transaction2 = await prisma.transaction.create({
    data: {
      listingId: listing2.id,
      buyerId: mona.id,
      sellerId: ahmed.id,
      itemId: items[1].id,
      quantity: 1,
      unitPrice: 12000,
      totalAmount: 12000,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      shippingAddress: '12 Heliopolis, Cairo',
      status: TransactionStatus.SHIPPED,
      trackingNumber: 'TRACK789012',
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Created shipped transaction');

  // Transaction 3: Pending
  const transaction3 = await prisma.transaction.create({
    data: {
      listingId: listing1.id,
      buyerId: omar.id,
      sellerId: ahmed.id,
      itemId: items[0].id,
      quantity: 1,
      unitPrice: 25000,
      totalAmount: 25000,
      paymentMethod: PaymentMethod.MOBILE_WALLET,
      shippingAddress: '90 Maadi, Cairo',
      status: TransactionStatus.PENDING,
    },
  });
  console.log('✅ Created pending transaction');

  console.log('\n🔄 Creating Barter Offers...');

  // Barter Offer 1: Pending
  const barterOffer1 = await prisma.barterOffer.create({
    data: {
      initiatorId: ahmed.id,
      recipientId: fatma.id,
      offeredItemId: items[0].id, // Dell laptop
      requestedItemId: items[3].id, // iPhone
      status: BarterOfferStatus.PENDING,
      notes: 'Hi, I would like to exchange my Dell laptop for your iPhone. Let me know!',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Created pending barter offer');

  // Barter Offer 2: Counter-offered
  const barterOffer2 = await prisma.barterOffer.create({
    data: {
      initiatorId: khaled.id,
      recipientId: omar.id,
      offeredItemId: items[4].id, // Toyota
      requestedItemId: items[7].id, // MacBook
      counterOfferItemId: items[8].id, // Bed
      status: BarterOfferStatus.COUNTER_OFFERED,
      notes: 'Original offer: Toyota for MacBook\nCounter: How about the bed instead?',
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Created counter-offered barter');

  // Barter Offer 3: Accepted
  const barterOffer3 = await prisma.barterOffer.create({
    data: {
      initiatorId: fatma.id,
      recipientId: mona.id,
      offeredItemId: items[2].id, // Sofa
      requestedItemId: items[5].id, // Refrigerator
      status: BarterOfferStatus.ACCEPTED,
      notes: 'Great! Let us meet in Cairo this weekend.',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Created accepted barter offer');

  // Barter Offer 4: Completed
  const barterOffer4 = await prisma.barterOffer.create({
    data: {
      initiatorId: omar.id,
      recipientId: ahmed.id,
      offeredItemId: items[8].id, // Bed
      requestedItemId: items[1].id, // Camera
      status: BarterOfferStatus.COMPLETED,
      notes: 'Exchange completed successfully in Maadi. Both parties satisfied!',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Created completed barter exchange');

  console.log('\n✨ Demo data seeded successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - 4 Active Listings`);
  console.log(`   - 3 Transactions (1 Delivered, 1 Shipped, 1 Pending)`);
  console.log(`   - 4 Barter Offers (1 Pending, 1 Counter, 1 Accepted, 1 Completed)`);
  console.log('\n');
}

seedDemoData()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
