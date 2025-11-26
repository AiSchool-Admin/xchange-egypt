# 🎯 AI Features Frontend Integration - COMPLETE GUIDE

## ✅ What We've Built

### 1. AI API Client (`frontend/lib/api/ai.ts`)
- ✅ All 14 AI endpoints connected
- ✅ Price estimation functions
- ✅ Auto-categorization functions
- ✅ Fraud detection functions
- ✅ Smart search functions
- ✅ Barter recommendations functions

### 2. AI UI Components
- ✅ `PriceWarning.tsx` - Shows price validation with color-coded warnings
- ✅ `CategorySuggestion.tsx` - Shows AI category suggestions with confidence scores
- ✅ `FraudWarning.tsx` - Shows fraud detection warnings and recommendations

---

## 🚀 INTEGRATION STEPS

### Step 1: Update Item Creation Page

**File:** `frontend/app/items/new/page.tsx`

**Add these imports at the top:**

```typescript
// Add to imports section (after line 8)
import { PriceWarning, CategorySuggestion, FraudWarning } from '@/components/ai';
import * as aiApi from '@/lib/api/ai';
import { useDebounce } from '@/lib/hooks/useDebounce'; // We'll create this
```

**Add AI state variables (after line 16):**

```typescript
// AI Features State
const [priceEstimation, setPriceEstimation] = useState<aiApi.PriceEstimationResponse | null>(null);
const [priceLoading, setPriceLoading] = useState(false);
const [categorySuggestions, setCategorySuggestions] = useState<aiApi.CategorySuggestion[]>([]);
const [categoryLoading, setCategoryLoading] = useState(false);
const [fraudCheck, setFraudCheck] = useState<aiApi.FraudCheckResponse | null>(null);

// Debounced values for AI calls
const debouncedTitle = useDebounce(formData.title, 1000); // Wait 1s after typing stops
const debouncedPrice = useDebounce(formData.price, 800);
```

**Add AI effect hooks (after line 50):**

```typescript
// AI: Auto-categorize when title/description changes
useEffect(() => {
  if (debouncedTitle.length >= 3) {
    suggestCategory();
  }
}, [debouncedTitle, formData.description]);

// AI: Validate price when it changes
useEffect(() => {
  if (debouncedPrice && formData.categoryId) {
    validatePriceWithAI();
  }
}, [debouncedPrice, formData.categoryId, formData.condition]);

// AI: Category suggestion function
const suggestCategory = async () => {
  if (!debouncedTitle) return;

  setCategoryLoading(true);
  try {
    const result = await aiApi.categorizeItem({
      title: debouncedTitle,
      description: formData.description,
    });

    if (result && result.success) {
      setCategorySuggestions([result.category, ...result.alternatives]);
    }
  } catch (error) {
    console.error('Category suggestion error:', error);
  } finally {
    setCategoryLoading(false);
  }
};

// AI: Price validation function
const validatePriceWithAI = async () => {
  const price = parseFloat(debouncedPrice);
  if (isNaN(price) || price <= 0) return;

  setPriceLoading(true);
  try {
    const result = await aiApi.estimatePrice({
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId,
      condition: formData.condition as any,
      estimatedValue: price,
    });

    setPriceEstimation(result);
  } catch (error) {
    console.error('Price estimation error:', error);
  } finally {
    setPriceLoading(false);
  }
};

// AI: Handle category selection from AI suggestion
const handleAICategorySelect = (categoryId: string) => {
  // Find the selected category in the suggestions
  const selected = categorySuggestions.find(cat => cat.id === categoryId);
  if (selected) {
    // Update form with AI suggestion
    setFormData({
      ...formData,
      categoryId: categoryId,
      // You may need to set parentCategoryId here too based on your category structure
    });
    setCategorySuggestions([]); // Clear suggestions after selection
  }
};

// AI: Run fraud check before submit
const runFraudCheck = async (): Promise<boolean> => {
  if (uploadedImages.length === 0) {
    // Can still check without images
  }

  const result = await aiApi.checkListing({
    title: formData.title,
    description: formData.description,
    price: parseFloat(formData.price) || 0,
    categoryId: formData.categoryId,
    images: uploadedImages,
  });

  setFraudCheck(result);

  // Block submission if high risk
  if (result && result.riskLevel === 'HIGH') {
    setError('This listing has suspicious indicators. Please review the warnings below.');
    return false;
  }

  return true;
};
```

**Update handleSubmit (replace lines 83-134):**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  // Validation (keep existing validation)
  if (!formData.title || formData.title.length < 3) {
    setError('Title must be at least 3 characters long');
    return;
  }

  if (!formData.description || formData.description.length < 10) {
    setError('Description must be at least 10 characters long');
    return;
  }

  if (!formData.categoryId) {
    setError('Please select a category');
    return;
  }

  if (!formData.governorate) {
    setError('Please select a governorate');
    return;
  }

  if (!formData.location || formData.location.length < 3) {
    setError('Location must be at least 3 characters long');
    return;
  }

  // **NEW: AI Fraud Check before submission**
  const fraudCheckPassed = await runFraudCheck();
  if (!fraudCheckPassed) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  try {
    setLoading(true);
    await createItem({
      titleAr: formData.title,
      titleEn: formData.title,
      descriptionAr: formData.description,
      descriptionEn: formData.description,
      categoryId: formData.categoryId,
      condition: formData.condition,
      estimatedValue: formData.price ? parseFloat(formData.price) : 0,
      location: formData.location,
      governorate: formData.governorate,
      imageUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
    });

    router.push('/items?success=true');
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to create item. Please check all fields.');
  } finally {
    setLoading(false);
  }
};
```

**Add AI components to JSX (after error display, around line 153):**

```tsx
{error && (
  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-600">{error}</p>
  </div>
)}

{/* **NEW: AI Fraud Warning** */}
{fraudCheck && fraudCheck.riskLevel !== 'LOW' && (
  <FraudWarning fraudCheck={fraudCheck} />
)}

{/* Existing Requirements Info Box... */}
```

**Add AI components after Title field (around line 193):**

```tsx
{/* Title field... */}
<input
  type="text"
  name="title"
  value={formData.title}
  onChange={handleChange}
  // ... existing props
/>

{/* **NEW: AI Category Suggestions** */}
{categorySuggestions.length > 0 && (
  <CategorySuggestion
    suggestions={categorySuggestions}
    onSelect={handleAICategorySelect}
    loading={categoryLoading}
  />
)}
```

**Add price warning after Price field:**

```tsx
{/* Price/Estimated Value field... */}
<input
  type="number"
  name="price"
  value={formData.price}
  onChange={handleChange}
  // ... existing props
/>

{/* **NEW: AI Price Warning** */}
{formData.price && formData.categoryId && (
  <PriceWarning
    estimation={priceEstimation}
    enteredPrice={parseFloat(formData.price)}
    loading={priceLoading}
  />
)}
```

---

### Step 2: Create useDebounce Hook

**File:** `frontend/lib/hooks/useDebounce.ts` (CREATE NEW)

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 🎯 TESTING THE INTEGRATED AI

### Test 1: AI Auto-Categorization

1. Go to `/items/new`
2. Type in Title: `iPhone 12 Pro Max`
3. **Wait 1 second** (debounce)
4. **Expected:** Purple box appears with category suggestion "Electronics → Smartphones"
5. Click the suggestion button
6. **Expected:** Category auto-fills

### Test 2: AI Price Validation

1. Continue in same form
2. Select category (if not auto-filled)
3. Enter Price: `1000` EGP
4. **Wait 1 second** (debounce)
5. **Expected:** Yellow warning box: "Price seems too low. Similar items: 12,000-18,000 EGP"
6. Change price to: `15000` EGP
7. **Expected:** Green box: "✅ Price looks good!"

### Test 3: AI Fraud Detection

1. Continue in same form
2. Change title to: `iPhone 13 Pro Max BRAND NEW 100% ORIGINAL`
3. Change description to: `BEST PRICE! LIMITED TIME! CONTACT FAST!!!`
4. Change price to: `3000` EGP
5. Upload only 1 photo
6. Click "Submit" or "Create Listing"
7. **Expected:** Red warning box with fraud flags before submission

---

## 📊 What Users Will See

### Before (No AI):
- Manual category selection
- No price guidance
- No fraud warnings
- Users make mistakes

### After (With AI):
- 🤖 Categories suggested automatically
- 💰 Price warnings prevent bad listings
- 🚨 Fraud detection protects buyers
- ✨ Better user experience

---

## 🐛 Troubleshooting

**Issue:** "Cannot find module '@/components/ai'"
**Fix:**
```bash
# Make sure components/ai folder exists
ls frontend/components/ai/
# Should show: PriceWarning.tsx, CategorySuggestion.tsx, FraudWarning.tsx, index.ts
```

**Issue:** "useDebounce is not defined"
**Fix:** Create the `frontend/lib/hooks/useDebounce.ts` file as shown above

**Issue:** AI components don't appear
**Fix:** Check browser console (F12) for API errors. Verify backend is running on correct URL.

**Issue:** API calls failing
**Fix:** Check `frontend/lib/api/client.ts` - make sure NEXT_PUBLIC_API_URL is set correctly

---

## ✅ Verification Checklist

Before deploying:

- [ ] AI API client created (`lib/api/ai.ts`)
- [ ] AI components created (3 files in `components/ai/`)
- [ ] useDebounce hook created
- [ ] Item creation page updated with AI integration
- [ ] Test: Category suggestions appear
- [ ] Test: Price warnings appear
- [ ] Test: Fraud warnings appear
- [ ] Test: Can submit valid listing
- [ ] Test: Cannot submit high-risk listing
- [ ] Committed and pushed to git
- [ ] Deployed to Vercel
- [ ] Tested on live site

---

## 🚀 Deployment

Once integrated:

```bash
# Commit changes
git add frontend/
git commit -m "feat: Integrate AI features into frontend UI

- Add AI API client with all 14 endpoints
- Create AI UI components (price warnings, category suggestions, fraud alerts)
- Integrate AI into item creation flow
- Add debounced AI calls for better UX
- Implement fraud check before submission

Users now experience:
- Automatic category suggestions
- Real-time price validation
- Fraud detection warnings"

# Push to your branch
git push

# Deploy will happen automatically on Vercel
```

---

## 📝 Summary

**Files Created:**
1. ✅ `frontend/lib/api/ai.ts` (AI API client)
2. ✅ `frontend/components/ai/PriceWarning.tsx`
3. ✅ `frontend/components/ai/CategorySuggestion.tsx`
4. ✅ `frontend/components/ai/FraudWarning.tsx`
5. ✅ `frontend/components/ai/index.ts`
6. ⏳ `frontend/lib/hooks/useDebounce.ts` (NEED TO CREATE)

**Files to Modify:**
1. ⏳ `frontend/app/items/new/page.tsx` (ADD AI INTEGRATION)

**Total Integration Time:** ~30 minutes of coding

**Result:** Users see AI features working in real-time as they create listings! 🎉

---

**Ready to complete the integration?** Tell me and I'll finish modifying the item creation page!
