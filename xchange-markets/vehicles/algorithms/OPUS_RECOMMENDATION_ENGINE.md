# OPUS TASK: Intelligent Recommendation Engine for Xchange

## Context
You are building a sophisticated recommendation system for a car marketplace that suggests relevant listings to users based on their behavior, preferences, and market trends. The system must balance personalization with discovery and handle cold-start problems.

## Objective
Create a multi-faceted recommendation engine that:
1. Recommends listings based on user behavior
2. Suggests similar cars to currently viewed listing
3. Predicts what users might like
4. Handles new users with no history
5. Adapts to Egyptian market preferences
6. Optimizes for engagement and conversion

## Recommendation Types

### 1. Personalized Homepage Feed
**Input:** User ID  
**Output:** Top 20 recommended listings  
**Use Case:** "For You" section on homepage

### 2. Similar Listings
**Input:** Listing ID  
**Output:** Top 10 similar cars  
**Use Case:** "You Might Also Like" on listing page

### 3. Search Re-Ranking
**Input:** User ID + Search Results  
**Output:** Re-ordered results  
**Use Case:** Personalize search results

### 4. Email Digest
**Input:** User ID  
**Output:** Top 5 new listings matching preferences  
**Use Case:** Weekly email "New cars you'll love"

## Data Structures

```typescript
interface UserProfile {
  userId: string;
  
  // Explicit preferences (from registration/profile)
  explicitPreferences?: {
    preferredMakes: string[];
    budgetMin: number;
    budgetMax: number;
    governorates: string[];
    features: string[];
  };
  
  // Implicit preferences (learned from behavior)
  implicitPreferences: {
    makeAffinity: Map<string, number>;      // Toyota → 0.85
    priceRange: { min: number; max: number };
    yearPreference: { min: number; max: number };
    transmissionPreference: Map<string, number>;  // AUTOMATIC → 0.9
    colorAffinity: Map<string, number>;
  };
  
  // Behavioral signals
  viewHistory: Array<{
    listingId: string;
    viewedAt: Date;
    durationSeconds: number;
    scrollDepth: number;      // 0-100%
    imagesViewed: number;
  }>;
  
  favoriteListings: string[];
  searches: Array<{
    query: string;
    filters: any;
    resultClicks: string[];   // Which listings clicked
    searchedAt: Date;
  }>;
  
  inquiries: string[];         // Listings contacted about
  
  // Demographics (if available)
  demographics?: {
    age?: number;
    governorate?: string;
    verificationLevel?: string;
  };
  
  // Computed
  interestVector: number[];    // Embedding representation
  lifetimeValue: number;       // Predicted CLV
}

interface ListingFeatures {
  listingId: string;
  
  // Basic attributes
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  governorate: string;
  
  // Derived features
  pricePerYear: number;        // Price / age
  valueScore: number;          // Compared to market average
  popularityScore: number;     // Views, favorites, inquiries
  freshnessScore: number;      // How recently listed
  qualityScore: number;        // Photos, description, certification
  
  // Categorical embeddings
  makeEmbedding: number[];
  modelEmbedding: number[];
  
  // Computed
  featureVector: number[];     // Full embedding
}

interface RecommendationResult {
  listingId: string;
  score: number;               // 0-100
  reasons: string[];           // ["Matches your budget", "Popular in your area"]
  
  // For debugging/transparency
  scoreBreakdown: {
    relevance: number;         // 0-40
    popularity: number;        // 0-20
    freshness: number;         // 0-15
    value: number;             // 0-15
    diversity: number;         // 0-10
  };
}
```

## Algorithm Components

### Component 1: Content-Based Filtering

```typescript
function contentBasedRecommendations(
  userProfile: UserProfile,
  candidateListings: ListingFeatures[],
  limit: number = 20
): RecommendationResult[] {
  
  /*
  Score each listing based on match to user's implicit preferences
  
  Scoring factors:
  - Make match (30%): How much user likes this brand
  - Price match (25%): How well it fits budget
  - Features match (20%): Desired features present
  - Location match (15%): Preferred governorates
  - Specs match (10%): Transmission, fuel type, etc.
  */
  
  return candidateListings.map(listing => {
    const makeScore = userProfile.implicitPreferences.makeAffinity.get(listing.make) || 0;
    
    const priceScore = calculatePriceMatch(
      listing.price,
      userProfile.implicitPreferences.priceRange
    );
    
    const locationScore = userProfile.explicitPreferences?.governorates?.includes(listing.governorate) 
      ? 100 
      : 50;
    
    const totalScore = (
      makeScore * 0.30 +
      priceScore * 0.25 +
      locationScore * 0.15 +
      // ... other factors
    );
    
    return {
      listingId: listing.listingId,
      score: totalScore,
      reasons: generateReasons(userProfile, listing),
      scoreBreakdown: { /* ... */ }
    };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, limit);
}

function calculatePriceMatch(
  listingPrice: number,
  preferredRange: { min: number; max: number }
): number {
  // Perfect match: within preferred range
  if (listingPrice >= preferredRange.min && listingPrice <= preferredRange.max) {
    return 100;
  }
  
  // Close match: within 20% of range
  const rangeMidpoint = (preferredRange.min + preferredRange.max) / 2;
  const deviation = Math.abs(listingPrice - rangeMidpoint) / rangeMidpoint;
  
  if (deviation < 0.2) return 80;
  if (deviation < 0.4) return 60;
  if (deviation < 0.6) return 40;
  return 20;
}
```

### Component 2: Collaborative Filtering

```typescript
function collaborativeRecommendations(
  userId: string,
  userSimilarity: Map<string, number>,  // userId → similarity score
  allUserFavorites: Map<string, string[]>,
  limit: number = 20
): string[] {
  
  /*
  "Users who liked similar cars also liked..."
  
  Algorithm:
  1. Find K most similar users (K=20)
  2. Aggregate their favorites
  3. Weight by similarity score
  4. Exclude items user already interacted with
  */
  
  const similarUsers = Array.from(userSimilarity.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  const candidateScores = new Map<string, number>();
  
  for (const [similarUserId, similarity] of similarUsers) {
    const theirFavorites = allUserFavorites.get(similarUserId) || [];
    
    for (const listingId of theirFavorites) {
      const currentScore = candidateScores.get(listingId) || 0;
      candidateScores.set(listingId, currentScore + similarity);
    }
  }
  
  // Remove items user already knows
  const myFavorites = new Set(allUserFavorites.get(userId) || []);
  for (const listingId of myFavorites) {
    candidateScores.delete(listingId);
  }
  
  return Array.from(candidateScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([listingId]) => listingId);
}

function calculateUserSimilarity(
  user1: UserProfile,
  user2: UserProfile
): number {
  /*
  Cosine similarity between user interest vectors
  
  Factors:
  - Shared favorites (Jaccard similarity)
  - Similar price ranges
  - Similar make preferences
  - Similar locations
  */
  
  // Jaccard similarity of favorites
  const favorites1 = new Set(user1.favoriteListings);
  const favorites2 = new Set(user2.favoriteListings);
  const intersection = new Set([...favorites1].filter(x => favorites2.has(x)));
  const union = new Set([...favorites1, ...favorites2]);
  const jaccardSim = intersection.size / union.size;
  
  // Price range overlap
  const priceOverlap = calculateRangeOverlap(
    user1.implicitPreferences.priceRange,
    user2.implicitPreferences.priceRange
  );
  
  // Make affinity correlation
  const makeCorrelation = calculateMapCorrelation(
    user1.implicitPreferences.makeAffinity,
    user2.implicitPreferences.makeAffinity
  );
  
  return (
    jaccardSim * 0.4 +
    priceOverlap * 0.3 +
    makeCorrelation * 0.3
  );
}
```

### Component 3: Trending & Popular

```typescript
interface TrendingCriteria {
  timeWindow: number;        // Last 24 hours
  minViews: number;          // At least 50 views
  minEngagementRate: number; // At least 10% favorites/views
}

function getTrendingListings(
  criteria: TrendingCriteria = {
    timeWindow: 24 * 60 * 60 * 1000,
    minViews: 50,
    minEngagementRate: 0.10
  }
): string[] {
  
  /*
  Identify listings gaining traction
  
  Trending score formula:
  - View velocity (views per hour)
  - Engagement rate (favorites + inquiries / views)
  - Freshness boost (newer = better)
  - Price competitiveness
  */
  
  const cutoffTime = new Date(Date.now() - criteria.timeWindow);
  
  return db.listings
    .where('publishedAt', '>', cutoffTime)
    .map(listing => {
      const viewVelocity = listing.views / ((Date.now() - listing.publishedAt) / 3600000);
      const engagementRate = (listing.favorites + listing.inquiries) / Math.max(listing.views, 1);
      const freshnessBoost = 1 - ((Date.now() - listing.publishedAt) / criteria.timeWindow);
      
      const trendingScore = (
        viewVelocity * 0.4 +
        engagementRate * 100 * 0.3 +
        freshnessBoost * 100 * 0.3
      );
      
      return { listingId: listing.id, score: trendingScore };
    })
    .filter(item => item.score >= criteria.minEngagementRate * 100)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(item => item.listingId);
}
```

### Component 4: Similar Listings (Item-to-Item)

```typescript
function findSimilarListings(
  listingId: string,
  limit: number = 10
): RecommendationResult[] {
  
  const sourceListing = getListingFeatures(listingId);
  const candidates = getAllActiveListings().filter(l => l.listingId !== listingId);
  
  return candidates.map(candidate => {
    /*
    Similarity factors:
    - Same make/model (80% weight if model match, 40% if only make)
    - Price similarity (20% weight, exponential decay)
    - Year similarity (15% weight)
    - Mileage similarity (10% weight)
    - Location proximity (10% weight)
    */
    
    let similarityScore = 0;
    const reasons: string[] = [];
    
    // Make/Model matching
    if (candidate.model === sourceListing.model) {
      similarityScore += 80;
      reasons.push(`Same model (${candidate.model})`);
    } else if (candidate.make === sourceListing.make) {
      similarityScore += 40;
      reasons.push(`Same brand (${candidate.make})`);
    }
    
    // Price similarity (exponential decay)
    const priceDiff = Math.abs(candidate.price - sourceListing.price);
    const priceScore = 20 * Math.exp(-priceDiff / sourceListing.price);
    similarityScore += priceScore;
    if (priceScore > 15) {
      reasons.push(`Similar price (${formatPrice(candidate.price)})`);
    }
    
    // Year similarity
    const yearDiff = Math.abs(candidate.year - sourceListing.year);
    const yearScore = Math.max(0, 15 - yearDiff * 3);
    similarityScore += yearScore;
    
    // Mileage similarity
    const mileageDiff = Math.abs(candidate.mileage - sourceListing.mileage);
    const mileageScore = 10 * Math.exp(-mileageDiff / Math.max(sourceListing.mileage, 1000));
    similarityScore += mileageScore;
    
    // Location (same governorate)
    if (candidate.governorate === sourceListing.governorate) {
      similarityScore += 10;
      reasons.push(`Located in ${candidate.governorate}`);
    }
    
    return {
      listingId: candidate.listingId,
      score: similarityScore,
      reasons,
      scoreBreakdown: { /* ... */ }
    };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, limit);
}
```

### Component 5: Diversity & Serendipity

```typescript
function ensureDiversity(
  recommendations: RecommendationResult[],
  diversityFactor: number = 0.3
): RecommendationResult[] {
  
  /*
  Problem: Pure relevance can create filter bubbles
  Solution: Inject diverse recommendations
  
  Strategy:
  - Keep top 70% by relevance
  - Replace bottom 30% with diverse picks:
    * Different makes than usual
    * Different price ranges
    * Different locations
    * Trending items user wouldn't normally see
  */
  
  const keepCount = Math.floor(recommendations.length * (1 - diversityFactor));
  const topRecommendations = recommendations.slice(0, keepCount);
  
  const diverseCandidates = getDiverseCandidates(topRecommendations);
  const diversePicks = diverseCandidates.slice(0, recommendations.length - keepCount);
  
  return [...topRecommendations, ...diversePicks];
}

function getDiverseCandidates(
  currentRecommendations: RecommendationResult[]
): RecommendationResult[] {
  
  // Extract makes already recommended
  const recommendedMakes = new Set(
    currentRecommendations.map(r => getListingFeatures(r.listingId).make)
  );
  
  // Find high-quality listings with different makes
  return getAllActiveListings()
    .filter(listing => !recommendedMakes.has(listing.make))
    .filter(listing => listing.qualityScore > 70)  // Only high-quality diverse picks
    .map(listing => ({
      listingId: listing.listingId,
      score: listing.popularityScore,
      reasons: ["Discover something new"],
      scoreBreakdown: { /* ... */ }
    }))
    .sort((a, b) => b.score - a.score);
}
```

### Component 6: Cold Start Problem

```typescript
function handleColdStart(
  userId: string,
  demographics?: { governorate?: string; age?: number }
): RecommendationResult[] {
  
  /*
  For new users with zero history:
  
  Strategy:
  1. Use demographics if available (30%)
  2. Show trending listings (40%)
  3. Show popular in their governorate (20%)
  4. Show variety across price ranges (10%)
  */
  
  const recommendations: RecommendationResult[] = [];
  
  // Trending listings
  const trending = getTrendingListings()
    .slice(0, 8)
    .map(id => ({
      listingId: id,
      score: 90,
      reasons: ["Trending now"],
      scoreBreakdown: { /* ... */ }
    }));
  recommendations.push(...trending);
  
  // Popular in user's governorate (if known)
  if (demographics?.governorate) {
    const localPopular = getPopularInGovernorate(demographics.governorate)
      .slice(0, 4)
      .map(id => ({
        listingId: id,
        score: 85,
        reasons: [`Popular in ${demographics.governorate}`],
        scoreBreakdown: { /* ... */ }
      }));
    recommendations.push(...localPopular);
  }
  
  // Variety across price ranges
  const priceRanges = [
    { min: 0, max: 300000, label: "Budget-friendly" },
    { min: 300000, max: 700000, label: "Mid-range" },
    { min: 700000, max: Infinity, label: "Premium" }
  ];
  
  for (const range of priceRanges) {
    const rangeListing = getTopInPriceRange(range.min, range.max)
      .slice(0, 2)
      .map(id => ({
        listingId: id,
        score: 75,
        reasons: [range.label],
        scoreBreakdown: { /* ... */ }
      }));
    recommendations.push(...rangeListing);
  }
  
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}
```

### Component 7: Contextual Recommendations

```typescript
function getContextualRecommendations(
  userId: string,
  context: {
    currentListing?: string;
    searchQuery?: string;
    timeOfDay?: number;
    dayOfWeek?: string;
  }
): RecommendationResult[] {
  
  /*
  Adjust recommendations based on context:
  
  - Viewing listing → Similar listings
  - After search → Refine search results
  - Weekend browsing → More leisure/family cars
  - Late night → Quick, compelling picks
  */
  
  if (context.currentListing) {
    return findSimilarListings(context.currentListing);
  }
  
  if (context.searchQuery) {
    return refineSearchResults(userId, context.searchQuery);
  }
  
  // Time-based adjustments
  if (context.dayOfWeek === 'Friday' || context.dayOfWeek === 'Saturday') {
    // Weekend: Show family cars, SUVs
    return getRecommendations(userId, { preferredTypes: ['SUV', 'VAN'] });
  }
  
  // Default personalized feed
  return getPersonalizedFeed(userId);
}
```

## Hybrid Recommendation Strategy

```typescript
function getHybridRecommendations(
  userId: string,
  context?: any
): RecommendationResult[] {
  
  /*
  Combine multiple algorithms with weights:
  - Content-based: 40%
  - Collaborative: 25%
  - Trending: 20%
  - Diversity: 15%
  */
  
  const userProfile = getUserProfile(userId);
  
  // If cold start, use special strategy
  if (userProfile.viewHistory.length < 5) {
    return handleColdStart(userId, userProfile.demographics);
  }
  
  const candidates = new Map<string, number>();
  
  // Content-based recommendations
  const contentBased = contentBasedRecommendations(userProfile, getAllActiveListings(), 30);
  for (const rec of contentBased) {
    candidates.set(rec.listingId, (candidates.get(rec.listingId) || 0) + rec.score * 0.40);
  }
  
  // Collaborative filtering
  const collaborative = collaborativeRecommendations(userId, getUserSimilarities(userId), getAllFavorites(), 30);
  for (const listingId of collaborative) {
    candidates.set(listingId, (candidates.get(listingId) || 0) + 80 * 0.25);
  }
  
  // Trending boost
  const trending = getTrendingListings();
  for (const listingId of trending) {
    candidates.set(listingId, (candidates.get(listingId) || 0) + 70 * 0.20);
  }
  
  // Diversity injection (handled after sorting)
  
  let recommendations = Array.from(candidates.entries())
    .map(([listingId, score]) => ({
      listingId,
      score,
      reasons: generateReasons(userProfile, getListingFeatures(listingId)),
      scoreBreakdown: { /* ... */ }
    }))
    .sort((a, b) => b.score - a.score);
  
  // Ensure diversity
  recommendations = ensureDiversity(recommendations, 0.25);
  
  return recommendations.slice(0, 20);
}
```

## Performance & Scalability

```typescript
// Pre-compute expensive operations
class RecommendationCache {
  private userSimilarityCache = new LRUCache<string, Map<string, number>>({ max: 10000 });
  private listingFeaturesCache = new LRUCache<string, ListingFeatures>({ max: 50000 });
  private trendingCache: { value: string[]; expiry: number } | null = null;
  
  async getUserSimilarities(userId: string): Promise<Map<string, number>> {
    if (this.userSimilarityCache.has(userId)) {
      return this.userSimilarityCache.get(userId)!;
    }
    
    const similarities = await computeUserSimilarities(userId);
    this.userSimilarityCache.set(userId, similarities);
    return similarities;
  }
  
  async getTrendingListings(): Promise<string[]> {
    const now = Date.now();
    if (this.trendingCache && this.trendingCache.expiry > now) {
      return this.trendingCache.value;
    }
    
    const trending = await computeTrendingListings();
    this.trendingCache = {
      value: trending,
      expiry: now + 15 * 60 * 1000  // Cache for 15 minutes
    };
    return trending;
  }
}

// Batch processing for email digests
async function generateEmailDigests(): Promise<void> {
  const activeUsers = await db.users.where('isActive', true).get();
  
  // Process in batches of 1000
  for (let i = 0; i < activeUsers.length; i += 1000) {
    const batch = activeUsers.slice(i, i + 1000);
    
    await Promise.all(
      batch.map(async user => {
        const recommendations = getHybridRecommendations(user.id);
        await sendEmailDigest(user.email, recommendations.slice(0, 5));
      })
    );
    
    // Rate limiting
    await sleep(1000);
  }
}
```

## A/B Testing & Optimization

```typescript
interface ABTest {
  name: string;
  variants: {
    control: RecommendationStrategy;
    variant: RecommendationStrategy;
  };
  metrics: {
    clickThroughRate: number;
    conversionRate: number;
    averageTimeOnSite: number;
  };
}

// Test different recommendation strategies
const tests: ABTest[] = [
  {
    name: "Diversity vs Relevance",
    variants: {
      control: () => getHybridRecommendations(userId, { diversityFactor: 0.1 }),
      variant: () => getHybridRecommendations(userId, { diversityFactor: 0.4 })
    },
    metrics: { /* ... */ }
  },
  {
    name: "Collaborative Weight",
    variants: {
      control: () => getHybridRecommendations(userId, { collaborativeWeight: 0.25 }),
      variant: () => getHybridRecommendations(userId, { collaborativeWeight: 0.40 })
    },
    metrics: { /* ... */ }
  }
];
```

## Deliverables

1. ✅ Complete TypeScript recommendation engine
2. ✅ Multiple recommendation algorithms (content, collaborative, trending, hybrid)
3. ✅ Similarity calculation functions
4. ✅ Cold start handling
5. ✅ Diversity injection
6. ✅ Caching layer for performance
7. ✅ API endpoints
8. ✅ Test suite with real-world scenarios
9. ✅ Performance benchmarks (target: <100ms per recommendation)
10. ✅ Documentation with examples

---

**Begin Implementation:**
Start with user profiling, then implement content-based filtering, add collaborative filtering, finally create the hybrid engine.
