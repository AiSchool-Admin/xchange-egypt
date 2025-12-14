# OPUS TASK: Dynamic Pricing Algorithm for Xchange Cars

## Context
You are building a sophisticated pricing algorithm for a used car marketplace in Egypt. The algorithm must provide accurate price estimates based on multiple factors and real-time market data.

## Objective
Create a complete TypeScript/Python implementation of a dynamic pricing algorithm that:
1. Estimates fair market value for any vehicle
2. Provides price ranges (min, avg, max)
3. Considers Egyptian market specifics
4. Updates based on real-time supply/demand
5. Handles edge cases and data quality issues

## Input Data Structure

```typescript
interface VehicleInput {
  make: string;              // "Toyota"
  model: string;             // "Corolla"
  year: number;              // 2021
  mileage: number;           // 45000 km
  condition: "NEW" | "USED_EXCELLENT" | "USED_GOOD" | "USED_FAIR" | "USED_POOR";
  fuelType: string;          // "GASOLINE", "DIESEL", etc.
  transmissionType: string;  // "AUTOMATIC", "MANUAL"
  governorate: string;       // "Cairo", "Alexandria", etc.
  color?: string;
  hasAccidents?: boolean;
  features?: string[];       // ["sunroof", "leatherSeats", ...]
  inspectionGrade?: "A" | "B" | "C" | "D";
}

interface MarketData {
  // Historical price data from database
  similarListings: Array<{
    make: string;
    model: string;
    year: number;
    mileage: number;
    price: number;
    soldAt?: Date;
    daysToSell?: number;
  }>;
  
  // Market statistics
  totalListings: number;
  averageDaysToSell: number;
  supplyDemandRatio: number;  // listings / inquiries
}
```

## Required Output

```typescript
interface PriceEstimate {
  estimatedValue: number;      // Best estimate
  priceRange: {
    min: number;               // Conservative estimate
    max: number;               // Optimistic estimate
  };
  confidence: number;          // 0-100
  marketDemand: "HIGH" | "MEDIUM" | "LOW";
  recommendedAskingPrice: number;
  depreciationRate: number;    // Percentage per year
  
  // Breakdown of how price was calculated
  breakdown: {
    basePrice: number;
    mileageAdjustment: number;
    conditionAdjustment: number;
    locationAdjustment: number;
    featuresAdjustment: number;
    marketAdjustment: number;
    seasonalAdjustment: number;
  };
  
  // Comparable listings
  comparables: Array<{
    listingId: string;
    price: number;
    similarity: number;  // 0-100
  }>;
}
```

## Pricing Factors & Weights

### 1. Base Price (40%)
- Start with average market price for exact make/model/year
- If no exact matches, use similar models with adjustment factor
- Factor in original MSRP and known depreciation curves

### 2. Mileage Impact (20%)
Egyptian market specifics:
- 0-30K km: +5% premium
- 30-60K: baseline
- 60-100K: -8%
- 100-150K: -15%
- 150K+: -25%
- Penalty increases exponentially after 100K

### 3. Condition (15%)
- NEW: +20%
- USED_EXCELLENT (A): baseline
- USED_GOOD (B): -10%
- USED_FAIR (C): -20%
- USED_POOR (D): -35%
- If has accidents: additional -5% to -15% depending on severity

### 4. Location (10%)
Governorate price variance:
- Cairo/Giza: baseline
- Alexandria: -3%
- Coastal cities (Hurghada, Sharm): +5% (tourism demand)
- Delta cities: -5%
- Upper Egypt: -10%

### 5. Features & Options (5%)
Premium features add value:
- Sunroof: +2%
- Leather seats: +3%
- Navigation system: +2%
- Parking sensors: +1%
- Rear camera: +1%
- Premium sound: +1.5%

### 6. Market Dynamics (10%)
- If supplyDemandRatio < 0.5 (high demand): +10%
- If supplyDemandRatio 0.5-1.5 (balanced): baseline
- If supplyDemandRatio > 1.5 (oversupply): -10%
- Consider trending makes/models (Chinese brands ↑, luxury ↓)

### 7. Seasonal Adjustment (5%)
- January-February (tax season): +5%
- Ramadan/Eid: -5% (lower activity)
- Summer (July-Aug): baseline
- Year-end (Dec): +3% (bonus season)

## Algorithm Steps

### Step 1: Find Comparables
```
1. Query database for similar vehicles:
   - Exact make/model/year ±1 year
   - Mileage within ±20%
   - Same governorate or adjacent
   - Listed in last 6 months

2. Calculate similarity score for each:
   similarity = weighted_average([
     make_match * 0.3,
     model_match * 0.3,
     year_difference * 0.2,
     mileage_difference * 0.15,
     condition_match * 0.05
   ])

3. Keep top 20 comparables (similarity > 70%)
```

### Step 2: Calculate Base Price
```
if (comparables.length >= 5) {
  // Use median of comparables (more robust than mean)
  basePrice = median(comparables.map(c => c.price));
} else {
  // Use depreciation formula
  originalMSRP = getOriginalMSRP(make, model, year);
  vehicleAge = currentYear - year;
  
  // Egyptian depreciation rates (higher than global)
  depreciationRate = {
    year1: 0.25,   // 25% first year
    year2: 0.15,   // 15% second year
    year3: 0.12,   // 12% third year
    year4plus: 0.10  // 10% per year after
  };
  
  basePrice = calculateDepreciatedValue(originalMSRP, vehicleAge, depreciationRate);
}
```

### Step 3: Apply Adjustments
```
adjustedPrice = basePrice;

// Mileage adjustment
mileageAdjustment = calculateMileageAdjustment(mileage, year);
adjustedPrice += mileageAdjustment;

// Condition adjustment
conditionAdjustment = calculateConditionAdjustment(condition, hasAccidents, inspectionGrade);
adjustedPrice += conditionAdjustment;

// Location adjustment
locationAdjustment = getLocationFactor(governorate) * basePrice;
adjustedPrice += locationAdjustment;

// Features adjustment
featuresAdjustment = calculateFeaturesValue(features);
adjustedPrice += featuresAdjustment;

// Market adjustment
marketAdjustment = calculateMarketAdjustment(supplyDemandRatio, make, model);
adjustedPrice += marketAdjustment;

// Seasonal adjustment
seasonalAdjustment = getSeasonalFactor(currentMonth) * basePrice;
adjustedPrice += seasonalAdjustment;
```

### Step 4: Calculate Confidence
```
confidence = calculateConfidence({
  comparablesCount: comparables.length,
  dataRecency: averageAgeOfComparables,
  priceVariance: standardDeviation(comparablePrices),
  similarityScores: comparables.map(c => c.similarity)
});

// Confidence formula:
// - Start with 50
// - +10 for each 5 comparables (max +30)
// - +10 if data < 30 days old
// - -20 if high variance (CV > 0.3)
// - +10 if avg similarity > 85%
```

### Step 5: Determine Price Range
```
variance = standardDeviation(comparablePrices) || (adjustedPrice * 0.15);

priceRange = {
  min: adjustedPrice - variance,
  max: adjustedPrice + variance
};

// Sanity checks
priceRange.min = Math.max(priceRange.min, adjustedPrice * 0.75);
priceRange.max = Math.min(priceRange.max, adjustedPrice * 1.25);
```

### Step 6: Recommend Asking Price
```
// Slightly above estimated value for negotiation room
recommendedAskingPrice = adjustedPrice * 1.08;

// If high demand, suggest higher
if (marketDemand === "HIGH") {
  recommendedAskingPrice = adjustedPrice * 1.12;
}

// Round to nearest 5,000
recommendedAskingPrice = Math.round(recommendedAskingPrice / 5000) * 5000;
```

## Edge Cases to Handle

1. **No Comparables Found**
   - Fall back to depreciation formula
   - Lower confidence score to 40-50
   - Wider price range (±20%)

2. **Extreme Outliers**
   - Remove prices > 3 standard deviations from mean
   - Flag for manual review if price seems impossible

3. **New/Rare Models**
   - Use manufacturer's suggested price
   - Apply standard first-year depreciation
   - Mark as "Limited Data" in response

4. **Currency Fluctuations**
   - Egyptian pound devalued ~50% in 2022-2024
   - Adjust historical prices by inflation index
   - Weight recent data more heavily

5. **Modified Vehicles**
   - Aftermarket modifications usually decrease value
   - Exception: official dealer upgrades (+5%)
   - Heavy modifications: -10% to -20%

## Testing Requirements

Create test cases for:
1. ✅ Toyota Corolla 2021, 45K km, Excellent → Should be ~480K EGP
2. ✅ Hyundai Elantra 2020, 80K km, Good → Should be ~380K EGP
3. ✅ Mercedes C-Class 2018, 60K km, Excellent → Should be ~650K EGP
4. ✅ Nissan Sunny 2022, 20K km, Excellent → Should be ~520K EGP
5. ✅ Edge case: Ferrari (no comparables) → Use depreciation
6. ✅ Edge case: 2015 car with 250K km → Heavy depreciation
7. ✅ Location test: Same car Cairo vs. Upper Egypt → 10% difference

## Performance Requirements

- Must calculate estimate in < 500ms
- Cache market data (refresh every 6 hours)
- Optimize database queries (use indexes)
- Handle 1000+ requests per minute

## Deliverables

Please provide:
1. ✅ Complete TypeScript implementation
2. ✅ Helper functions with clear documentation
3. ✅ Unit tests covering all test cases
4. ✅ Performance benchmarks
5. ✅ Example API endpoint integration
6. ✅ README with algorithm explanation

## Constraints

- Language: TypeScript (Node.js 20+)
- Database: PostgreSQL with Prisma ORM
- Must be production-ready
- Include error handling
- Add logging for debugging

---

**Start Implementation:**
Begin with the core pricing function, then build helper functions, then add tests.
