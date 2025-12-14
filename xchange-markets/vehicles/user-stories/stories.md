# Xchange Cars - User Stories

## 🎯 EPIC 1: User Registration & Authentication

### US-001: Register as Buyer
**As a** potential car buyer  
**I want to** create an account with my phone number  
**So that** I can browse and purchase cars

**Acceptance Criteria:**
- [x] User provides phone number, password, first name, last name, governorate, city
- [x] System validates phone number (Egyptian format: 010/011/012/015 + 8 digits)
- [x] System sends OTP via SMS
- [x] User verifies phone with OTP within 5 minutes
- [x] System creates user account with role BUYER
- [x] System returns JWT token for authentication
- [x] User receives welcome notification

**Technical Notes:**
- Use Twilio/local SMS gateway for OTP
- Hash password with bcrypt (12 rounds)
- JWT expires in 30 days
- Store OTP in Redis with 5-minute TTL

---

### US-002: Verify National ID
**As a** registered user  
**I want to** upload my national ID  
**So that** I can increase my verification level and build trust

**Acceptance Criteria:**
- [x] User uploads front image of national ID
- [x] User uploads back image of national ID
- [x] User takes selfie holding national ID
- [x] System validates image quality (min 800x600, max 5MB)
- [x] System extracts data using OCR (name, ID number, date of birth)
- [x] Admin reviews and approves within 24 hours
- [x] User verification level changes to ID_VERIFIED
- [x] User receives notification of verification status

**Technical Notes:**
- Use Tesseract OCR or cloud service
- Store images in S3/CloudFlare R2
- Queue verification task for admin review
- Add watermark "Xchange Verification" on images

---

### US-003: Login with Phone
**As a** registered user  
**I want to** log in with my phone number and password  
**So that** I can access my account

**Acceptance Criteria:**
- [x] User provides phone number and password
- [x] System validates credentials
- [x] System returns JWT token
- [x] System updates lastLoginAt timestamp
- [x] User redirected to homepage/dashboard
- [x] Show error message for invalid credentials
- [x] Implement rate limiting (5 attempts per 15 minutes)

---

## 🎯 EPIC 2: Creating Listings

### US-010: Create Marketplace Listing
**As a** car owner  
**I want to** list my car for sale  
**So that** potential buyers can find it

**Acceptance Criteria:**
- [x] User selects "Sell My Car"
- [x] User provides vehicle details (make, model, year, mileage, condition, color, etc.)
- [x] System auto-suggests make/model from database
- [x] User uploads 3-15 photos (min 3 required)
- [x] User provides asking price (min 50,000 EGP)
- [x] User writes description (min 50 characters)
- [x] User selects governorate and city
- [x] User optionally checks "Accepts Trade-In" or "Accepts Barter"
- [x] System validates all fields
- [x] System creates listing with status PENDING_REVIEW
- [x] System generates unique listing ID
- [x] User receives confirmation notification
- [x] Listing appears in "My Listings" as "Pending Review"

**Technical Notes:**
- Compress images to max 1200px width
- Generate thumbnails (300x200)
- Store images in CDN
- Queue listing for auto-moderation check
- Auto-approve if user is VERIFIED and no red flags
- Otherwise, queue for manual review

---

### US-011: Upload Listing Images
**As a** seller  
**I want to** upload multiple high-quality images  
**So that** buyers can see my car in detail

**Acceptance Criteria:**
- [x] User can upload 3-15 images
- [x] First image is automatically set as primary
- [x] User can reorder images via drag-and-drop
- [x] User can mark any image as primary
- [x] System validates image format (JPG, PNG, WebP)
- [x] System validates image size (max 5MB per image)
- [x] System validates image dimensions (min 800x600)
- [x] System compresses images without quality loss
- [x] System generates thumbnails
- [x] User can add caption to each image
- [x] User can delete images

**Technical Notes:**
- Use sharp/jimp for image processing
- Store original, compressed, and thumbnail versions
- Implement lazy loading on frontend
- Add watermark "Xchange" on corner

---

### US-012: Edit Listing
**As a** seller  
**I want to** edit my listing details or price  
**So that** I can keep it accurate and competitive

**Acceptance Criteria:**
- [x] User navigates to "My Listings"
- [x] User selects "Edit" on a listing
- [x] User can modify: title, description, price, photos, features
- [x] User CANNOT modify: make, model, year (to prevent fraud)
- [x] System saves changes
- [x] If price reduced, notify users who favorited the listing
- [x] Listing remains ACTIVE (no re-review needed unless flagged)

---

## 🎯 EPIC 3: Searching & Browsing

### US-020: Search for Cars
**As a** buyer  
**I want to** search for cars using multiple filters  
**So that** I can find exactly what I'm looking for

**Acceptance Criteria:**
- [x] User can filter by: make, model, year range, price range, mileage, condition, governorate, city, fuel type, transmission, color
- [x] User can sort by: newest, price (low-high), price (high-low), mileage, year
- [x] System returns matching listings with pagination (20 per page)
- [x] System shows filter options with counts (e.g., "Toyota (45)")
- [x] User can save search for later
- [x] User can enable notifications for new matching listings
- [x] System displays total results count
- [x] Each listing shows: primary image, price, year, mileage, location, badges (CERTIFIED, URGENT, etc.)

**Technical Notes:**
- Use PostgreSQL full-text search for title/description
- Create database indexes on: make, model, year, price, governorate
- Cache filter options in Redis (update every hour)
- Implement infinite scroll or classic pagination

---

### US-021: View Listing Details
**As a** buyer  
**I want to** see complete details of a listing  
**So that** I can decide if it's worth pursuing

**Acceptance Criteria:**
- [x] User clicks on listing card
- [x] System displays: all images in gallery, full vehicle specs, features list, seller info (name, rating, verification level), location on map (approximate), inspection report (if certified), warranty info (if certified), asking price, contact buttons
- [x] System increments view count
- [x] System shows "Similar Listings" at bottom
- [x] User can: favorite, share, report, contact seller, request trade-in quote (if enabled), propose barter (if enabled)
- [x] If seller is online, show "Active now" badge

**Technical Notes:**
- Track view with IP and user ID to prevent duplicate counts
- Use PostGIS for location-based queries
- Implement image zoom/lightbox
- Add structured data for SEO (JSON-LD)

---

### US-022: Favorite Listing
**As a** buyer  
**I want to** save listings I'm interested in  
**So that** I can review them later

**Acceptance Criteria:**
- [x] User clicks "favorite" icon (heart)
- [x] System adds listing to user's favorites
- [x] Icon changes to filled/highlighted
- [x] User can access favorites from "My Favorites" page
- [x] User receives notification if price drops
- [x] User can remove from favorites

---

### US-023: Save Search
**As a** buyer  
**I want to** save my search filters  
**So that** I can quickly re-run the same search

**Acceptance Criteria:**
- [x] User applies filters and clicks "Save this search"
- [x] User provides search name (e.g., "Toyota Corolla under 500K")
- [x] User chooses whether to receive notifications for new listings
- [x] System saves filters as JSON
- [x] User can access saved searches from profile
- [x] User receives daily/weekly email digest of new matching listings (if opted in)
- [x] System runs saved searches automatically and sends notifications

**Technical Notes:**
- Use cron job to check saved searches daily
- Send email notifications via SendGrid/SES
- Limit to 10 saved searches per user

---

## 🎯 EPIC 4: Inspection & Certification

### US-030: Request Inspection
**As a** seller  
**I want to** get my car inspected and certified  
**So that** buyers trust it more and I can sell faster

**Acceptance Criteria:**
- [x] User selects "Get Certified" on listing
- [x] System shows inspection benefits and fee (300 EGP)
- [x] User provides preferred date/time and address
- [x] System checks inspector availability
- [x] System schedules inspection
- [x] User pays inspection fee
- [x] System assigns nearest available inspector
- [x] User and inspector receive confirmation
- [x] Inspector receives inspection checklist

**Technical Notes:**
- Match inspector based on governorate
- Send SMS reminder 24 hours before
- Hold payment in escrow until inspection complete

---

### US-031: Perform 150-Point Inspection
**As an** inspector  
**I want to** conduct a thorough inspection  
**So that** I can provide an accurate certification

**Acceptance Criteria:**
- [x] Inspector arrives at scheduled location
- [x] Inspector opens inspection app
- [x] Inspector scans/enters VIN
- [x] Inspector goes through 150-point checklist covering: exterior (20 points), interior (25 points), mechanical (40 points), electrical (25 points), under the hood (20 points), under the car (15 points), test drive (5 points)
- [x] Inspector uses tools: paint thickness meter, OBD-II scanner, battery tester, tire depth gauge
- [x] Inspector takes photos of: overall car, any damages, VIN plate, odometer, engine bay, undercarriage
- [x] Inspector notes critical issues and recommendations
- [x] System calculates overall score and grade (A/B/C/D)
- [x] Inspector uploads report
- [x] System generates certification code
- [x] Listing status changes to CERTIFIED
- [x] Listing shows certification badge

**Technical Notes:**
- Checklist stored as JSON in DB
- Generate PDF report
- If score < 60 (Grade D), do not certify
- Upload photos to S3 with geolocation metadata

---

### US-032: View Inspection Report
**As a** buyer  
**I want to** see the full inspection report  
**So that** I can make an informed decision

**Acceptance Criteria:**
- [x] User clicks "View Inspection Report" on certified listing
- [x] System displays: overall grade and score, detailed scores by category, checklist results (pass/fail/caution for each point), critical issues highlighted, photos from inspection, paint thickness readings, OBD-II codes (if any), battery health, tire condition, inspector notes and recommendations, estimated repair costs, certification code for verification
- [x] User can download PDF
- [x] User can verify certification code via QR code

---

## 🎯 EPIC 5: Transactions & Payments

### US-040: Initiate Purchase
**As a** buyer  
**I want to** buy a car I'm interested in  
**So that** I can complete the transaction securely

**Acceptance Criteria:**
- [x] User clicks "Buy Now" on listing
- [x] System shows purchase flow: review details, choose payment method, request financing (optional), schedule delivery (optional)
- [x] User confirms purchase
- [x] System creates transaction record
- [x] System generates unique transaction code
- [x] Listing status changes to RESERVED
- [x] Seller receives notification
- [x] Buyer redirected to payment page

**Technical Notes:**
- Lock listing for 24 hours (no other buyers can purchase)
- Send notifications via SMS + push
- Create transaction with status INITIATED

---

### US-041: Pay with Card via Paymob
**As a** buyer  
**I want to** pay securely with my credit/debit card  
**So that** the transaction is protected

**Acceptance Criteria:**
- [x] User selects "Card Payment"
- [x] System redirects to Paymob iframe
- [x] User enters card details
- [x] Paymob processes payment
- [x] System receives callback with payment status
- [x] If successful: money held in escrow, transaction status → PAYMENT_HELD, buyer and seller notified
- [x] If failed: transaction cancelled, listing back to ACTIVE
- [x] User can retry payment

**Technical Notes:**
- Use Paymob iframe integration
- Set webhook URL for callbacks
- Store payment reference
- Implement 3D Secure for security

---

### US-042: Escrow System
**As a** buyer  
**I want to** my payment held safely until I receive the car  
**So that** I'm protected from fraud

**Acceptance Criteria:**
- [x] After successful payment, money held in escrow account
- [x] Seller cannot access money until delivery confirmed
- [x] Buyer has 7 days to inspect car after delivery
- [x] Buyer clicks "Confirm Receipt & Satisfaction"
- [x] System releases funds to seller (minus platform fee)
- [x] If buyer reports issue within 7 days, funds remain held pending dispute resolution
- [x] If no action after 7 days, funds auto-released

**Technical Notes:**
- Use Paymob hold/capture feature or separate escrow account
- Set auto-release cron job
- Platform fee: 3% for marketplace, 5% for certified

---

### US-043: Request Refund
**As a** buyer  
**I want to** request a refund if the car doesn't match  
**So that** I can get my money back

**Acceptance Criteria:**
- [x] Buyer clicks "Request Refund" within 7 days of delivery
- [x] Buyer selects reason (vehicle mismatch, hidden damages, fake documents, etc.)
- [x] Buyer uploads evidence (photos, videos, documents)
- [x] System creates dispute
- [x] Funds remain in escrow
- [x] Seller receives notification and can respond
- [x] Admin reviews dispute within 48 hours
- [x] If approved: full refund to buyer, listing back to active
- [x] If rejected: funds released to seller

---

## 🎯 EPIC 6: Financing

### US-050: Check Financing Eligibility
**As a** buyer  
**I want to** check if I qualify for financing  
**So that** I know my budget

**Acceptance Criteria:**
- [x] User enters: vehicle price, desired down payment, monthly income
- [x] System calculates: max finance amount, suggested terms (36/48/60 months)
- [x] System shows: monthly payment, total interest, total payable for each term
- [x] System indicates eligibility status
- [x] User can proceed to formal application

**Technical Notes:**
- Use simple formula: (financed amount × (1 + rate/12)^months) / months
- Eligibility: monthly payment ≤ 40% of monthly income
- Partner APIs: Contact, Drive

---

### US-051: Apply for Financing
**As a** buyer  
**I want to** apply for car financing  
**So that** I can purchase the car with installments

**Acceptance Criteria:**
- [x] User clicks "Apply for Financing"
- [x] User selects partner (Contact, Drive, etc.)
- [x] User fills application: personal info, employment details, income proof, down payment amount, desired duration
- [x] User uploads: national ID, salary certificate/bank statement, utility bill
- [x] System validates and submits to partner API
- [x] System creates financing record with status PENDING
- [x] User receives application reference number
- [x] Partner processes within 24-48 hours
- [x] User receives notification of approval/rejection
- [x] If approved: user signs digital contract, transaction proceeds with financing

**Technical Notes:**
- Integrate Contact/Drive APIs
- Store documents securely (encrypted)
- Send webhook when partner updates status
- Digital signature via OTP

---

## 🎯 EPIC 7: Trade-In

### US-060: Request Trade-In Quote
**As a** buyer  
**I want to** trade in my old car  
**So that** I can reduce the price of the new car

**Acceptance Criteria:**
- [x] User clicks "Trade-In My Car" on listing
- [x] User provides old car details (make, model, year, mileage, condition)
- [x] User uploads 3-5 photos
- [x] System uses pricing algorithm to generate instant estimate
- [x] System shows: estimated value range (e.g., 180K-220K), quote valid for 7 days
- [x] User can accept estimate or schedule inspection for exact quote
- [x] If accepted: inspection scheduled
- [x] After inspection: final quote provided
- [x] User accepts final quote
- [x] Trade-in value deducted from new car price

**Technical Notes:**
- Pricing algorithm factors: make, model, year, mileage, condition, market data
- Inspection same as regular certification
- Create separate TradeInRequest record
- Link to main transaction

---

## 🎯 EPIC 8: Barter (المقايضة)

### US-070: Propose Car-for-Car Barter
**As a** seller  
**I want to** exchange my car for another  
**So that** I can upgrade/downgrade without cash hassle

**Acceptance Criteria:**
- [x] User viewing listing sees "Propose Barter" button (if seller accepts barter)
- [x] User selects their own listing to offer
- [x] System shows both cars with estimated values
- [x] User sets: my car value, their car value, cash difference, who pays difference
- [x] User adds message
- [x] System creates barter offer with status PROPOSED
- [x] Receiver gets notification
- [x] Receiver can: accept, reject, counter-offer
- [x] If accepted: both cars reserved, inspections scheduled (if not already certified)
- [x] After inspections: final values confirmed, cash difference paid
- [x] Ownership transfer for both cars

**Technical Notes:**
- Both cars must pass inspection
- Create complex transaction record with 2 vehicles
- Handle edge cases: one car certified, other not
- Multi-party escrow for cash difference

---

### US-071: Multi-Party Barter
**As a** user  
**I want to** participate in a complex barter  
**So that** I can exchange assets across categories (car ↔ phone ↔ property)

**Acceptance Criteria:**
- [x] User proposes barter involving multiple items
- [x] System tracks all involved parties and items
- [x] System calculates total values and differences
- [x] All parties must accept before execution
- [x] System coordinates simultaneous transfers
- [x] If any party backs out, entire barter cancelled

**Technical Notes:**
- This is a complex feature - Phase 2
- Requires integration with phone/property marketplaces
- Use distributed transaction pattern
- Implement timeouts and rollbacks

---

## 🎯 EPIC 9: Communication

### US-080: Message Seller
**As a** buyer  
**I want to** ask the seller questions  
**So that** I can get more information

**Acceptance Criteria:**
- [x] User clicks "Contact Seller" on listing
- [x] User types message
- [x] User can attach images
- [x] System sends message
- [x] Seller receives notification (push + SMS)
- [x] Seller can reply
- [x] Conversation appears in both users' "Messages" section
- [x] System shows read/unread status
- [x] System shows when user is typing

**Technical Notes:**
- Use WebSockets for real-time messaging
- Fall back to polling if WebSocket unavailable
- Store messages in PostgreSQL
- Implement rate limiting (max 10 messages/minute)

---

### US-081: Receive Notifications
**As a** user  
**I want to** be notified of important events  
**So that** I don't miss opportunities

**Acceptance Criteria:**
- [x] User receives notifications for: new message, listing viewed, listing favorited, price drop on favorited listing, barter/trade-in offer, payment received, inspection scheduled, dispute opened, review received
- [x] Notifications appear in notification bell (in-app)
- [x] User receives push notifications (if enabled)
- [x] User receives SMS for critical events (payment, inspection)
- [x] User can mark individual notifications as read
- [x] User can mark all as read
- [x] User can manage notification preferences

**Technical Notes:**
- Store notifications in DB
- Use FCM (Firebase Cloud Messaging) for push
- Send SMS via local gateway
- Implement notification preferences page

---

## 🎯 EPIC 10: Reviews & Trust

### US-090: Leave Review
**As a** buyer/seller  
**I want to** review the other party after transaction  
**So that** the community knows their reputation

**Acceptance Criteria:**
- [x] After transaction completes, both parties receive "Leave Review" prompt
- [x] User rates: overall (1-5 stars), communication, accuracy, professionalism
- [x] User writes review title and comment
- [x] System validates: user can only review once per transaction, review must be 20-500 characters
- [x] System publishes review
- [x] Review appears on target user's profile
- [x] Target user's average rating recalculated
- [x] Target user can respond to review (once)

**Technical Notes:**
- Link review to transaction to prevent fake reviews
- Implement profanity filter
- Allow flagging inappropriate reviews
- Admin can hide reviews

---

### US-091: Build Trust Score
**As a** user  
**I want** my profile to show my trustworthiness  
**So that** others feel confident dealing with me

**Acceptance Criteria:**
- [x] System calculates trust score based on: verification level (40%), successful transactions (30%), reviews (20%), account age (10%)
- [x] Profile displays: trust score (0-100), verification badges, number of successful sales/purchases, average rating, member since date
- [x] High-trust users get priority in search
- [x] Certified sellers get "Trusted Dealer" badge

---

## 🎯 EPIC 11: Analytics & Insights

### US-100: View My Listing Analytics
**As a** seller  
**I want to** see how my listing is performing  
**So that** I can optimize it

**Acceptance Criteria:**
- [x] User views "Analytics" tab on listing
- [x] System shows: total views, unique views, favorites, inquiries (messages), views over time (chart), comparison to similar listings, suggested improvements
- [x] If performance is low, system suggests: lower price, better photos, add more details

**Technical Notes:**
- Track views with analytics_events table
- Generate daily aggregates
- Use chart library (Chart.js/Recharts)

---

### US-101: Get Market Insights
**As a** user  
**I want to** see market pricing data  
**So that** I can price my car competitively / make a fair offer

**Acceptance Criteria:**
- [x] User searches for make/model/year
- [x] System shows: average listing price, price range, number of listings, average days to sell, demand level (high/medium/low), price trend graph (last 6 months)
- [x] System factors: governorate, condition, mileage
- [x] Data updated weekly

**Technical Notes:**
- Aggregate data from all listings
- Cache results in Redis (1 week TTL)
- Exclude outliers (< 5th percentile, > 95th percentile)

---

## 🎯 EPIC 12: Dispute Resolution

### US-110: Open Dispute
**As a** buyer/seller  
**I want to** open a dispute if there's a problem  
**So that** it can be resolved fairly

**Acceptance Criteria:**
- [x] User clicks "Open Dispute" on transaction
- [x] User selects reason (vehicle mismatch, hidden damages, payment issue, etc.)
- [x] User describes issue (min 50 characters)
- [x] User uploads evidence (photos/videos/documents)
- [x] System creates dispute with unique code
- [x] System notifies other party
- [x] System assigns to admin
- [x] Funds remain in escrow
- [x] Both parties can add comments and evidence
- [x] Admin reviews within 48 hours
- [x] Admin makes decision: refund buyer, release to seller, partial refund
- [x] Decision is final and binding
- [x] Both parties notified of resolution

**Technical Notes:**
- Escalation path: auto-resolve simple cases, manual review for complex
- Use AI to detect patterns (e.g., seller with multiple disputes)
- Store all evidence permanently for legal purposes

---

## 🎯 EPIC 13: Admin Panel

### US-120: Moderate Listings
**As an** admin  
**I want to** review and approve listings  
**So that** only legitimate cars are published

**Acceptance Criteria:**
- [x] Admin sees queue of pending listings
- [x] Admin reviews: photos, description, price (not too good to be true)
- [x] Admin can: approve, reject (with reason), request changes
- [x] System uses AI to flag suspicious listings: duplicate photos (reverse image search), price 30%+ below market, suspicious keywords
- [x] Auto-approve verified sellers with good history
- [x] Rejected listings: seller notified with reason, can edit and resubmit

---

### US-121: Manage Users
**As an** admin  
**I want to** manage user accounts  
**So that** I can handle verification and issues

**Acceptance Criteria:**
- [x] Admin can search users by: name, phone, email, verification level
- [x] Admin can view: full profile, transaction history, reviews, disputes
- [x] Admin can: verify user manually, suspend user, unsuspend user, delete account (GDPR)
- [x] Admin can add notes visible only to other admins

---

### US-122: Dashboard & Reports
**As an** admin  
**I want to** see platform metrics  
**So that** I can monitor health and growth

**Acceptance Criteria:**
- [x] Dashboard shows: total users (new today/this week/this month), active listings, completed transactions (today/this week/this month), revenue (today/this month), pending inspections, open disputes
- [x] Charts: user growth, listing growth, transaction volume, revenue over time
- [x] Reports: top performing listings, most active users, popular makes/models, average time to sell, conversion rate (views → inquiries → sales)

---

## 🚀 MVP Priority

**Phase 1 (Month 1-2):** 
- Authentication ✅
- Listings (create, edit, search, view) ✅
- Basic messaging ✅
- Favorites ✅

**Phase 2 (Month 3):**
- Inspection system ✅
- Transactions & payments ✅
- Reviews ✅
- Admin panel ✅

**Phase 3 (Month 4+):**
- Financing ✅
- Trade-in ✅
- Barter ✅
- Advanced analytics ✅

---

**Total User Stories: 50+**  
**Ready for Development: ✅**
