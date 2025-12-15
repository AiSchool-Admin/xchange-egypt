# XCHANGE SILVER MARKETPLACE - BUSINESS LOGIC DOCUMENTATION

## نظرة عامة

هذا المستند يشرح الخوارزميات المعقدة التي تميز منصة Xchange عن المنافسين. هذه الخوارزميات يُفضل تطويرها باستخدام **Claude Opus** لضمان الدقة والتعقيد المطلوب.

---

## 1️⃣ خوارزمية التسعير الديناميكي

### المشكلة المُحلة
الصاغة التقليديون يشترون الفضة المستعملة بسعر **الفضة الخام فقط**، دون احتساب أي قيمة للمصنعية. هذا يعني خسارة 25-38% من قيمة الشراء الأصلية.

**مثال:**
- شراء: 12.5 جرام فضة 925 بـ 1,637.50 ج.م (97 ج.م/جرام + 400 ج.م مصنعية)
- بيع للصائغ: 1,212.50 ج.م (فقط 97 ج.م × 12.5 جرام)
- **الخسارة: 425 ج.م (26%)**

### الحل: نموذج التسعير المُعتمد على الحالة

```javascript
/**
 * حساب السعر المقترح لقطعة فضية مستعملة
 * @param {Object} item - بيانات القطعة
 * @returns {Object} - تفاصيل التسعير
 */
function calculateSuggestedPrice(item) {
  // 1. قيمة الفضة الخام
  const currentSilverPrice = getCurrentSilverPrice(item.purity);
  const rawSilverValue = item.weight * currentSilverPrice;
  
  // 2. نسبة الصنعة المحتسبة حسب الحالة
  const craftingRatios = {
    NEW: 0.70,           // جديد لم يستعمل: 70% من المصنعية
    EXCELLENT: 0.50,     // ممتاز: 50%
    VERY_GOOD: 0.30,     // جيد جداً: 30%
    GOOD: 0.15,          // جيد: 15%
    FAIR: 0.05,          // مقبول: 5%
    POOR: 0.00           // ضعيف: 0% (للصهر فقط)
  };
  
  const craftingRatio = craftingRatios[item.condition] || 0;
  const craftingValue = (item.craftingCost || 0) * craftingRatio;
  
  // 3. معاملات إضافية
  let multiplier = 1.0;
  
  // وجود دمغة رسمية: +5%
  if (item.hasHallmark) {
    multiplier += 0.05;
  }
  
  // وجود شهادة تقييم: +10%
  if (item.hasCertificate) {
    multiplier += 0.10;
  }
  
  // قطع تاريخية/أنتيكات: +20-50%
  if (item.category === 'ANTIQUES' && item.age > 50) {
    multiplier += 0.20;
  }
  
  // علامة تجارية مرموقة (إيطالي، تركي): +15%
  if (item.brand && ['ITALIAN', 'TURKISH'].includes(item.brand)) {
    multiplier += 0.15;
  }
  
  // 4. الحساب النهائي
  const totalValue = (rawSilverValue + craftingValue) * multiplier;
  
  // 5. هامش السلامة: لا يتجاوز 95% من السعر الأصلي
  const maxPrice = item.originalPrice ? item.originalPrice * 0.95 : Infinity;
  const suggestedPrice = Math.min(totalValue, maxPrice);
  
  return {
    rawSilverValue: Math.round(rawSilverValue),
    craftingValue: Math.round(craftingValue),
    craftingRatio: craftingRatio * 100, // نسبة مئوية
    multiplier: multiplier,
    suggestedPrice: Math.round(suggestedPrice),
    
    // للعرض للمستخدم
    breakdown: {
      rawValue: Math.round(rawSilverValue),
      craftingComponent: Math.round(craftingValue),
      bonuses: {
        hallmark: item.hasHallmark ? '+5%' : null,
        certificate: item.hasCertificate ? '+10%' : null,
        antique: item.category === 'ANTIQUES' ? '+20%' : null,
        brand: item.brand ? '+15%' : null
      },
      total: Math.round(suggestedPrice)
    },
    
    // المقارنة
    comparison: {
      traditionalJeweler: Math.round(rawSilverValue),
      xchange: Math.round(suggestedPrice),
      difference: Math.round(suggestedPrice - rawSilverValue),
      differencePercent: Math.round(((suggestedPrice - rawSilverValue) / rawSilverValue) * 100)
    }
  };
}
```

### أمثلة تطبيقية

#### مثال 1: خاتم ممتاز مع دمغة
```javascript
const item = {
  weight: 12.5,
  purity: 'STERLING_925',
  condition: 'EXCELLENT',
  craftingCost: 400,
  hasHallmark: true,
  hasCertificate: false,
  category: 'JEWELRY_MENS',
  originalPrice: 1637.50
};

const pricing = calculateSuggestedPrice(item);

// النتيجة:
{
  rawSilverValue: 1237,      // 12.5 × 99
  craftingValue: 200,         // 400 × 0.5
  craftingRatio: 50,
  multiplier: 1.05,           // +5% للدمغة
  suggestedPrice: 1509,       // (1237 + 200) × 1.05
  
  breakdown: {
    rawValue: 1237,
    craftingComponent: 200,
    bonuses: { hallmark: '+5%', certificate: null, ... },
    total: 1509
  },
  
  comparison: {
    traditionalJeweler: 1237,
    xchange: 1509,
    difference: 272,           // فرق 272 جنيه
    differencePercent: 22      // 22% أفضل من الصاغة
  }
}
```

#### مثال 2: قطعة أنتيكا
```javascript
const antique = {
  weight: 45,
  purity: 'GRADE_800',
  condition: 'GOOD',
  craftingCost: 2000,
  hasHallmark: true,
  hasCertificate: true,
  category: 'ANTIQUES',
  age: 80, // سنة
  originalPrice: 9000
};

const pricing = calculateSuggestedPrice(antique);

// النتيجة:
{
  rawSilverValue: 3870,      // 45 × 86
  craftingValue: 300,         // 2000 × 0.15 (حالة جيدة)
  multiplier: 1.35,           // +5% دمغة +10% شهادة +20% أنتيكا
  suggestedPrice: 5629,       // (3870 + 300) × 1.35
  
  comparison: {
    traditionalJeweler: 3870,
    xchange: 5629,
    difference: 1759,          // فرق 1,759 جنيه!
    differencePercent: 45      // 45% أفضل
  }
}
```

---

## 2️⃣ خوارزمية تحديد الحالة (Condition Assessment)

### التقييم الأولي (من البائع)
البائع يختار الحالة من القائمة، لكن يمكن للنظام التحقق عبر:

```javascript
/**
 * اقتراح الحالة بناءً على المدخلات
 */
function suggestCondition(item) {
  const age = item.purchaseDate 
    ? (new Date() - new Date(item.purchaseDate)) / (365 * 24 * 60 * 60 * 1000)
    : null;
  
  let suggestions = [];
  
  // قطعة جديدة (أقل من 6 أشهر ولم تستعمل)
  if (age && age < 0.5 && item.description.includes('لم يستعمل')) {
    suggestions.push({
      condition: 'NEW',
      confidence: 0.8,
      reason: 'القطعة جديدة نسبياً ولم تستعمل'
    });
  }
  
  // قطعة قديمة جداً (أكثر من 5 سنوات)
  if (age && age > 5) {
    suggestions.push({
      condition: 'FAIR',
      confidence: 0.6,
      reason: 'القطعة قديمة، يُنصح بالفحص الدقيق'
    });
  }
  
  // تحليل الوصف بحثاً عن كلمات مفتاحية
  const keywords = {
    NEW: ['جديد', 'لم يستعمل', 'بالكرتونة', 'مغلف'],
    EXCELLENT: ['ممتاز', 'كالجديد', 'نظيف جداً', 'بدون خدوش'],
    VERY_GOOD: ['جيد جداً', 'استعمال خفيف', 'حالة جيدة'],
    GOOD: ['جيد', 'استعمال عادي', 'بعض الخدوش'],
    FAIR: ['مقبول', 'آثار استعمال', 'خدوش واضحة'],
    POOR: ['ضعيف', 'للصهر', 'تالف', 'مكسور']
  };
  
  for (const [condition, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (item.description.includes(word) || item.conditionNotes?.includes(word)) {
        suggestions.push({
          condition,
          confidence: 0.7,
          reason: `الوصف يحتوي على: "${word}"`
        });
        break;
      }
    }
  }
  
  return suggestions;
}
```

### التقييم المتقدم (من الخبير)
عند طلب تقييم احترافي، يستخدم الخبير معايير محددة:

```javascript
const expertGradingCriteria = {
  visualInspection: {
    scratches: {
      none: { grade: 'A+', points: 10 },
      minor: { grade: 'A', points: 8 },
      moderate: { grade: 'B', points: 6 },
      heavy: { grade: 'C', points: 4 },
      severe: { grade: 'D', points: 2 }
    },
    tarnish: {
      none: 10,
      light: 8,
      moderate: 5,
      heavy: 2
    },
    dents: {
      none: 10,
      minor: 7,
      noticeable: 4,
      significant: 1
    }
  },
  
  functional: {
    clasps: { working: 10, stiff: 7, broken: 0 },
    chains: { intact: 10, weak_links: 5, broken: 0 },
    settings: { secure: 10, loose: 5, missing: 0 }
  },
  
  authenticity: {
    hallmark: { present_clear: 10, present_faded: 7, absent: 0 },
    weight_matches: { yes: 10, close: 7, no: 0 },
    purity_test: { matches: 10, close: 5, fails: 0 }
  }
};

/**
 * حساب الدرجة الإجمالية من فحص الخبير
 */
function calculateExpertGrade(inspection) {
  let totalPoints = 0;
  let maxPoints = 0;
  
  // Visual
  totalPoints += expertGradingCriteria.visualInspection.scratches[inspection.scratches].points;
  maxPoints += 10;
  
  totalPoints += expertGradingCriteria.visualInspection.tarnish[inspection.tarnish];
  maxPoints += 10;
  
  totalPoints += expertGradingCriteria.visualInspection.dents[inspection.dents];
  maxPoints += 10;
  
  // Functional
  totalPoints += expertGradingCriteria.functional.clasps[inspection.clasps];
  maxPoints += 10;
  
  // Authenticity
  totalPoints += expertGradingCriteria.authenticity.hallmark[inspection.hallmark];
  maxPoints += 10;
  
  const percentage = (totalPoints / maxPoints) * 100;
  
  // تحويل النسبة لحالة
  if (percentage >= 95) return { condition: 'NEW', grade: 'A+', score: percentage };
  if (percentage >= 85) return { condition: 'EXCELLENT', grade: 'A', score: percentage };
  if (percentage >= 70) return { condition: 'VERY_GOOD', grade: 'B+', score: percentage };
  if (percentage >= 55) return { condition: 'GOOD', grade: 'B', score: percentage };
  if (percentage >= 40) return { condition: 'FAIR', grade: 'C', score: percentage };
  return { condition: 'POOR', grade: 'D', score: percentage };
}
```

---

## 3️⃣ نظام المقايضة متعدد الأطراف

### السيناريو 1: استبدال فضة بفضة (مباشر)

```javascript
/**
 * حساب قيمة الاستبدال المباشر
 */
function calculateDirectTradeIn(oldItem, newItem) {
  // 1. تقييم القطعة القديمة
  const oldItemValuation = calculateSuggestedPrice(oldItem);
  
  // 2. رصيد الاستبدال = 80-90% من القيمة (حسب مستوى ثقة المستخدم)
  const creditPercentage = getUserTradeInPercentage(oldItem.userId);
  const tradeInCredit = oldItemValuation.suggestedPrice * creditPercentage;
  
  // 3. سعر القطعة الجديدة
  const newItemPrice = newItem.askingPrice;
  
  // 4. الفرق
  const difference = newItemPrice - tradeInCredit;
  
  return {
    oldItemValue: oldItemValuation.suggestedPrice,
    tradeInCredit: Math.round(tradeInCredit),
    creditPercentage: creditPercentage * 100,
    newItemPrice: newItemPrice,
    additionalPayment: difference > 0 ? Math.round(difference) : 0,
    refundCredit: difference < 0 ? Math.round(Math.abs(difference)) : 0,
    
    breakdown: {
      youGive: {
        item: oldItem.title,
        estimatedValue: oldItemValuation.suggestedPrice,
        creditReceived: Math.round(tradeInCredit)
      },
      youGet: {
        item: newItem.title,
        price: newItemPrice
      },
      balance: difference > 0 
        ? `تدفع إضافة: ${Math.round(difference)} ج.م`
        : `رصيد متبقي: ${Math.round(Math.abs(difference))} ج.م`
    }
  };
}

/**
 * نسبة رصيد الاستبدال حسب مستوى الثقة
 */
function getUserTradeInPercentage(userId) {
  const user = getUserTrustLevel(userId);
  
  const percentages = {
    NEW: 0.75,          // 75% للمستخدمين الجدد
    VERIFIED: 0.80,     // 80% للموثقين
    TRUSTED: 0.85,      // 85% للموثوقين
    PROFESSIONAL: 0.90  // 90% للمحترفين
  };
  
  return percentages[user.trustLevel] || 0.75;
}
```

### السيناريو 2: مقايضة فضة بذهب

```javascript
/**
 * استبدال فضة بذهب (أو العكس)
 */
function calculateSilverGoldBarter(silverItem, goldItem) {
  // 1. قيمة الفضة
  const silverValue = calculateSuggestedPrice(silverItem).suggestedPrice;
  const silverCredit = silverValue * 0.80; // 80% رصيد
  
  // 2. قيمة الذهب (من سوق الذهب في Xchange)
  const goldValue = goldItem.askingPrice;
  
  // 3. نسبة الذهب/الفضة الحالية
  const goldSilverRatio = getCurrentGoldSilverRatio(); // مثلاً 85:1
  
  // 4. عمولة التحويل بين المعادن: 2-5%
  const conversionFee = silverCredit * 0.03; // 3%
  
  // 5. الرصيد النهائي
  const finalCredit = silverCredit - conversionFee;
  
  return {
    silverValue: silverValue,
    silverCredit: Math.round(silverCredit),
    conversionFee: Math.round(conversionFee),
    finalCredit: Math.round(finalCredit),
    goldItemPrice: goldValue,
    additionalPayment: Math.round(Math.max(0, goldValue - finalCredit)),
    
    note: `نسبة الذهب/الفضة الحالية: ${goldSilverRatio}:1`
  };
}
```

### السيناريو 3: مقايضة فضة بموبايل/سيارة

```javascript
/**
 * مقايضة عابرة للفئات
 */
function calculateCrossCategoryBarter(silverItems, targetItem, targetCategory) {
  // 1. حساب القيمة الإجمالية لقطع الفضة
  const totalSilverValue = silverItems.reduce((sum, item) => {
    return sum + calculateSuggestedPrice(item).suggestedPrice;
  }, 0);
  
  // 2. رصيد المقايضة
  const barterCredit = totalSilverValue * 0.80;
  
  // 3. عمولة المقايضة العابرة (5%)
  const crossCategoryFee = barterCredit * 0.05;
  
  // 4. الرصيد النهائي
  const finalCredit = barterCredit - crossCategoryFee;
  
  // 5. سعر المنتج المستهدف
  const targetPrice = getItemPrice(targetItem, targetCategory);
  
  return {
    silverItems: silverItems.map(i => ({
      title: i.title,
      value: calculateSuggestedPrice(i).suggestedPrice
    })),
    totalSilverValue: Math.round(totalSilverValue),
    barterCredit: Math.round(barterCredit),
    crossCategoryFee: Math.round(crossCategoryFee),
    finalCredit: Math.round(finalCredit),
    targetItem: {
      category: targetCategory,
      title: targetItem.title,
      price: targetPrice
    },
    additionalPayment: Math.round(Math.max(0, targetPrice - finalCredit)),
    
    viability: finalCredit >= targetPrice * 0.3 
      ? 'ممكن - رصيدك يغطي جزء كبير'
      : 'غير عملي - ستحتاج دفع أكثر من 70%'
  };
}
```

---

## 4️⃣ نظام الادخار بالفضة - Dollar Cost Averaging

### آلية الاستثمار التلقائي

```javascript
/**
 * معالجة الاستثمار التلقائي الشهري
 */
async function processAutoInvestment(savingsAccount) {
  // 1. السحب من المحفظة/البطاقة
  const payment = await chargeUser(
    savingsAccount.userId,
    savingsAccount.autoInvestAmount,
    savingsAccount.paymentMethod
  );
  
  if (!payment.success) {
    await notifyUser(savingsAccount.userId, 'AUTOINVEST_FAILED');
    return;
  }
  
  // 2. السعر الحالي للفضة
  const currentPrice = await getCurrentSilverPrice('STERLING_925');
  
  // 3. الجرامات المشتراة
  const gramsPurchased = savingsAccount.autoInvestAmount / currentPrice;
  
  // 4. تحديث الحساب
  await prisma.silverSavingsAccount.update({
    where: { id: savingsAccount.id },
    data: {
      currentBalance: {
        increment: savingsAccount.autoInvestAmount
      },
      equivalentGrams: {
        increment: gramsPurchased
      }
    }
  });
  
  // 5. تسجيل الإيداع
  await prisma.savingsDeposit.create({
    data: {
      accountId: savingsAccount.id,
      amount: savingsAccount.autoInvestAmount,
      silverPriceAt: currentPrice,
      gramsAdded: gramsPurchased,
      method: savingsAccount.paymentMethod
    }
  });
  
  // 6. حساب التالي
  const nextDate = calculateNextInvestmentDate(
    savingsAccount.autoInvestFrequency
  );
  
  await prisma.silverSavingsAccount.update({
    where: { id: savingsAccount.id },
    data: { nextAutoInvestAt: nextDate }
  });
  
  // 7. إشعار المستخدم
  await notifyUser(savingsAccount.userId, 'AUTOINVEST_SUCCESS', {
    amount: savingsAccount.autoInvestAmount,
    grams: gramsPurchased.toFixed(2),
    price: currentPrice,
    totalGrams: savingsAccount.equivalentGrams + gramsPurchased
  });
}
```

### حساب الربح/الخسارة

```javascript
/**
 * حساب أداء حساب الادخار
 */
async function calculateSavingsPerformance(accountId) {
  const account = await prisma.silverSavingsAccount.findUnique({
    where: { id: accountId },
    include: { deposits: true }
  });
  
  // 1. متوسط سعر الشراء
  const totalDeposited = account.deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalGrams = account.deposits.reduce((sum, d) => sum + d.gramsAdded, 0);
  const averagePurchasePrice = totalDeposited / totalGrams;
  
  // 2. السعر الحالي
  const currentPrice = await getCurrentSilverPrice('STERLING_925');
  
  // 3. القيمة الحالية
  const currentValue = totalGrams * currentPrice;
  
  // 4. الربح/الخسارة
  const profitLoss = currentValue - totalDeposited;
  const profitLossPercent = (profitLoss / totalDeposited) * 100;
  
  return {
    summary: {
      totalDeposited: Math.round(totalDeposited),
      totalGrams: totalGrams.toFixed(2),
      averagePurchasePrice: averagePurchasePrice.toFixed(2),
      currentPrice: currentPrice.toFixed(2),
      currentValue: Math.round(currentValue),
      profitLoss: Math.round(profitLoss),
      profitLossPercent: profitLossPercent.toFixed(2),
      roi: profitLossPercent.toFixed(2) + '%'
    },
    
    comparison: {
      ifKeptAsCash: totalDeposited,
      asSilver: Math.round(currentValue),
      difference: Math.round(currentValue - totalDeposited)
    },
    
    projections: {
      if5PercentGrowth: Math.round(currentValue * 1.05),
      if10PercentGrowth: Math.round(currentValue * 1.10),
      if15PercentGrowth: Math.round(currentValue * 1.15)
    }
  };
}
```

---

## 5️⃣ نظام الـ Escrow الذكي

### حالات إفراج الأموال

```javascript
/**
 * منطق إفراج/رد الأموال من Escrow
 */
async function handleEscrowRelease(purchaseId) {
  const purchase = await prisma.silverPurchase.findUnique({
    where: { id: purchaseId },
    include: { escrow: true, listing: true }
  });
  
  // حالة 1: المشتري أكد الاستلام → إفراج للبائع
  if (purchase.buyerConfirmed && !purchase.disputeOpened) {
    await releaseToSeller(purchase);
    return 'RELEASED_TO_SELLER';
  }
  
  // حالة 2: انتهت فترة الفحص (7 أيام) ولم يفتح نزاع → إفراج تلقائي
  const inspectionPeriodEnd = new Date(purchase.deliveredAt);
  inspectionPeriodEnd.setDate(inspectionPeriodEnd.getDate() + 7);
  
  if (new Date() > inspectionPeriodEnd && !purchase.disputeOpened) {
    await releaseToSeller(purchase);
    return 'AUTO_RELEASED_TO_SELLER';
  }
  
  // حالة 3: نزاع مفتوح → انتظار قرار
  if (purchase.disputeOpened) {
    const dispute = await getDisputeDecision(purchaseId);
    
    if (dispute.decision === 'BUYER_WINS') {
      await refundToBuyer(purchase);
      return 'REFUNDED_TO_BUYER';
    } else if (dispute.decision === 'SELLER_WINS') {
      await releaseToSeller(purchase);
      return 'RELEASED_TO_SELLER_AFTER_DISPUTE';
    } else if (dispute.decision === 'PARTIAL_REFUND') {
      await partialRefund(purchase, dispute.refundAmount);
      return 'PARTIAL_REFUND';
    }
  }
  
  return 'PENDING';
}

async function releaseToSeller(purchase) {
  // 1. تحديث حالة Escrow
  await prisma.escrowTransaction.update({
    where: { id: purchase.escrowId },
    data: {
      status: 'RELEASED',
      releasedAt: new Date()
    }
  });
  
  // 2. إضافة المبلغ لرصيد البائع
  const sellerAmount = purchase.agreedPrice - purchase.platformFee;
  await addToSellerBalance(purchase.listing.sellerId, sellerAmount);
  
  // 3. تحديث حالة المعاملة
  await prisma.silverPurchase.update({
    where: { id: purchase.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date()
    }
  });
  
  // 4. إشعارات
  await notifyUser(purchase.listing.sellerId, 'PAYMENT_RELEASED', {
    amount: sellerAmount,
    purchaseId: purchase.id
  });
}
```

---

## 6️⃣ نظام الثقة والسمعة

### حساب مستوى الثقة

```javascript
/**
 * ترقية مستوى ثقة المستخدم تلقائياً
 */
async function updateUserTrustLevel(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      listings: true,
      purchases: true,
      reviews: true
    }
  });
  
  // معايير الترقية
  const completedSales = user.listings.filter(l => l.status === 'SOLD').length;
  const completedPurchases = user.purchases.filter(p => p.status === 'COMPLETED').length;
  const totalTransactions = completedSales + completedPurchases;
  
  const averageRating = calculateAverageRating(user.reviews);
  const hasVerifiedID = user.kycStatus === 'APPROVED';
  
  let newTrustLevel = user.trustLevel;
  
  // NEW → VERIFIED: تحقق من الهوية
  if (user.trustLevel === 'NEW' && hasVerifiedID) {
    newTrustLevel = 'VERIFIED';
  }
  
  // VERIFIED → TRUSTED: 5+ معاملات ناجحة + تقييم 4+
  if (user.trustLevel === 'VERIFIED' && 
      totalTransactions >= 5 && 
      averageRating >= 4.0) {
    newTrustLevel = 'TRUSTED';
  }
  
  // TRUSTED → PROFESSIONAL: 50+ معاملات + تقييم 4.5+
  if (user.trustLevel === 'TRUSTED' && 
      totalTransactions >= 50 && 
      averageRating >= 4.5) {
    newTrustLevel = 'PROFESSIONAL';
  }
  
  if (newTrustLevel !== user.trustLevel) {
    await prisma.user.update({
      where: { id: userId },
      data: { trustLevel: newTrustLevel }
    });
    
    await notifyUser(userId, 'TRUST_LEVEL_UPGRADED', {
      oldLevel: user.trustLevel,
      newLevel: newTrustLevel
    });
  }
  
  return newTrustLevel;
}
```

---

## 🎓 ملاحظات للتطوير

### استخدام Opus للخوارزميات المعقدة
الخوارزميات التالية يُفضل تطويرها باستخدام Claude Opus:

1. **التسعير الديناميكي** - تحتاج دقة في احتساب العوامل المتعددة
2. **المقايضة متعددة الأطراف** - منطق معقد لمطابقة عدة أطراف
3. **AI لتقييم الحالة من الصور** - Computer vision متقدم
4. **كشف الاحتيال** - Pattern recognition

### استخدام Sonnet للمنطق البسيط
يمكن استخدام Sonnet لـ:

1. **CRUD operations** الأساسية
2. **Validation logic**
3. **التكاملات البسيطة** (APIs)
4. **Webhook handling**

### الاختبار
كل خوارزمية يجب أن يكون لها:
- Unit tests شاملة
- Integration tests
- Test cases للحالات الحدية
- Performance benchmarks
