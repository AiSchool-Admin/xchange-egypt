#!/bin/bash

# =====================================================
# XChange Egypt - UAT Scenario 1: Direct Sale Journey
# سيناريو البيع المباشر - اختبار قبول المستخدم
# =====================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-https://xchange-egypt-production.up.railway.app/api/v1}"
SELLER_EMAIL="${SELLER_EMAIL:-ahmed@test.com}"
SELLER_PASSWORD="${SELLER_PASSWORD:-Test123!}"
BUYER_EMAIL="${BUYER_EMAIL:-fatma@test.com}"
BUYER_PASSWORD="${BUYER_PASSWORD:-Test123!}"

# Variables to store tokens and IDs
SELLER_TOKEN=""
BUYER_TOKEN=""
SELLER_ID=""
BUYER_ID=""
ITEM_ID=""
LISTING_ID=""
CART_ID=""
ORDER_ID=""
CATEGORY_ID=""

# Helper functions
print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📌 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if jq is installed
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install it first:"
        echo "  Ubuntu/Debian: sudo apt-get install jq"
        echo "  MacOS: brew install jq"
        exit 1
    fi

    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed."
        exit 1
    fi
}

# API call helper
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4

    local headers="-H 'Content-Type: application/json'"
    if [ -n "$token" ]; then
        headers="$headers -H 'Authorization: Bearer $token'"
    fi

    if [ -n "$data" ]; then
        eval "curl -s -X $method '$API_URL$endpoint' $headers -d '$data'"
    else
        eval "curl -s -X $method '$API_URL$endpoint' $headers"
    fi
}

# =====================================================
# SCENARIO STEPS
# =====================================================

step_0_check_server() {
    print_step "الخطوة 0: التحقق من اتصال الخادم"

    local response=$(curl -s -w "%{http_code}" -o /dev/null --connect-timeout 10 "$API_URL")

    if [ "$response" = "000" ]; then
        print_error "الخادم غير متاح: $API_URL"
        print_info "تأكد من أن الخادم يعمل أو قم بتغيير API_URL"
        exit 1
    else
        print_success "الخادم متاح (HTTP $response)"
    fi
}

step_1_1_seller_login() {
    print_step "الخطوة 1.1: تسجيل دخول البائع (أحمد)"

    local response=$(api_call "POST" "/auth/login" "{\"email\":\"$SELLER_EMAIL\",\"password\":\"$SELLER_PASSWORD\"}")

    # Check for success
    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        SELLER_TOKEN=$(echo $response | jq -r '.data.accessToken')
        SELLER_ID=$(echo $response | jq -r '.data.user.id')
        print_success "تسجيل دخول البائع بنجاح"
        print_info "Seller ID: $SELLER_ID"
        print_info "Token: ${SELLER_TOKEN:0:50}..."
    else
        local message=$(echo $response | jq -r '.message // "Unknown error"')
        print_error "فشل تسجيل الدخول: $message"

        # Try to register the seller
        print_warning "محاولة تسجيل البائع..."
        register_seller
    fi
}

register_seller() {
    local response=$(api_call "POST" "/auth/register/individual" "{
        \"email\":\"$SELLER_EMAIL\",
        \"password\":\"$SELLER_PASSWORD\",
        \"name\":\"أحمد محمد\",
        \"phone\":\"01012345678\",
        \"governorate\":\"القاهرة\",
        \"city\":\"مدينة نصر\"
    }")

    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        print_success "تم تسجيل البائع بنجاح"
        # Now login
        step_1_1_seller_login
    else
        local message=$(echo $response | jq -r '.message // "Unknown error"')
        print_error "فشل تسجيل البائع: $message"
        echo "Response: $response"
    fi
}

step_1_2_get_category() {
    print_step "الخطوة 1.2أ: الحصول على فئة الإلكترونيات"

    local response=$(api_call "GET" "/categories" "" "$SELLER_TOKEN")

    # Find electronics category
    CATEGORY_ID=$(echo $response | jq -r '.data[] | select(.name | test("إلكترونيات|electronics|phones"; "i")) | .id' | head -1)

    if [ -n "$CATEGORY_ID" ] && [ "$CATEGORY_ID" != "null" ]; then
        print_success "تم العثور على فئة الإلكترونيات: $CATEGORY_ID"
    else
        # Use first category
        CATEGORY_ID=$(echo $response | jq -r '.data[0].id // empty')
        if [ -n "$CATEGORY_ID" ]; then
            print_warning "استخدام أول فئة متاحة: $CATEGORY_ID"
        else
            print_error "لم يتم العثور على أي فئات"
            echo "Response: $response"
        fi
    fi
}

step_1_2_create_item() {
    print_step "الخطوة 1.2ب: إنشاء منتج جديد (iPhone 14 Pro Max)"

    local response=$(api_call "POST" "/items" "{
        \"title\":\"iPhone 14 Pro Max 256GB - UAT Test\",
        \"description\":\"آيفون 14 برو ماكس، استخدام شهرين فقط، مع جميع الملحقات والضمان. اختبار UAT.\",
        \"categoryId\":\"$CATEGORY_ID\",
        \"estimatedValue\":45000,
        \"condition\":\"LIKE_NEW\",
        \"images\":[\"https://example.com/iphone1.jpg\",\"https://example.com/iphone2.jpg\"],
        \"governorate\":\"القاهرة\",
        \"city\":\"مدينة نصر\",
        \"openToExchange\":false
    }" "$SELLER_TOKEN")

    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        ITEM_ID=$(echo $response | jq -r '.data.id')
        local status=$(echo $response | jq -r '.data.status')
        print_success "تم إنشاء المنتج بنجاح"
        print_info "Item ID: $ITEM_ID"
        print_info "Status: $status"
    else
        local message=$(echo $response | jq -r '.message // "Unknown error"')
        print_error "فشل إنشاء المنتج: $message"
        echo "Response: $response"
    fi
}

step_1_3_create_listing() {
    print_step "الخطوة 1.3: إنشاء قائمة للبيع (Listing)"

    local response=$(api_call "POST" "/listings" "{
        \"itemId\":\"$ITEM_ID\",
        \"price\":45000,
        \"allowBarter\":false,
        \"allowNegotiation\":true,
        \"minimumPrice\":40000
    }" "$SELLER_TOKEN")

    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        LISTING_ID=$(echo $response | jq -r '.data.id')
        print_success "تم إنشاء القائمة بنجاح"
        print_info "Listing ID: $LISTING_ID"
        print_info "Price: 45,000 EGP"
    else
        local message=$(echo $response | jq -r '.message // "Unknown error"')
        print_error "فشل إنشاء القائمة: $message"
        echo "Response: $response"
    fi
}

step_1_4_buyer_login() {
    print_step "الخطوة 1.4أ: تسجيل دخول المشتري (فاطمة)"

    local response=$(api_call "POST" "/auth/login" "{\"email\":\"$BUYER_EMAIL\",\"password\":\"$BUYER_PASSWORD\"}")

    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        BUYER_TOKEN=$(echo $response | jq -r '.data.accessToken')
        BUYER_ID=$(echo $response | jq -r '.data.user.id')
        print_success "تسجيل دخول المشتري بنجاح"
        print_info "Buyer ID: $BUYER_ID"
    else
        print_warning "محاولة تسجيل المشتري..."
        register_buyer
    fi
}

register_buyer() {
    local response=$(api_call "POST" "/auth/register/individual" "{
        \"email\":\"$BUYER_EMAIL\",
        \"password\":\"$BUYER_PASSWORD\",
        \"name\":\"فاطمة علي\",
        \"phone\":\"01098765432\",
        \"governorate\":\"الجيزة\",
        \"city\":\"الدقي\"
    }")

    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        print_success "تم تسجيل المشتري بنجاح"
        step_1_4_buyer_login
    else
        local message=$(echo $response | jq -r '.message // "Unknown error"')
        print_error "فشل تسجيل المشتري: $message"
    fi
}

step_1_4_search() {
    print_step "الخطوة 1.4ب: بحث المشتري عن المنتج"

    local response=$(api_call "GET" "/search?q=iPhone%2014&minPrice=30000&maxPrice=50000" "" "$BUYER_TOKEN")

    local count=$(echo $response | jq -r '.data | length // 0')

    if [ "$count" -gt 0 ]; then
        print_success "تم العثور على $count نتيجة"
        echo $response | jq '.data[0] | {title, price, governorate}'
    else
        print_warning "لم يتم العثور على نتائج، محاولة البحث بالـ listing ID"

        # Try to get listing directly
        local listing_response=$(api_call "GET" "/listings/$LISTING_ID" "" "$BUYER_TOKEN")
        echo $listing_response | jq '.data | {title: .item.title, price, status}'
    fi
}

step_1_5_add_to_cart() {
    print_step "الخطوة 1.5: إضافة للسلة"

    local response=$(api_call "POST" "/cart/items" "{
        \"listingId\":\"$LISTING_ID\",
        \"quantity\":1
    }" "$BUYER_TOKEN")

    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        CART_ID=$(echo $response | jq -r '.data.cartId // .data.id')
        local total=$(echo $response | jq -r '.data.total // .data.totalAmount // 0')
        print_success "تم إضافة المنتج للسلة"
        print_info "Cart ID: $CART_ID"
        print_info "Total: $total EGP"
    else
        local message=$(echo $response | jq -r '.message // "Unknown error"')
        print_error "فشل إضافة للسلة: $message"
        echo "Response: $response"
    fi
}

step_1_6_create_order() {
    print_step "الخطوة 1.6: إنشاء الطلب"

    local response=$(api_call "POST" "/orders" "{
        \"listingId\":\"$LISTING_ID\",
        \"shippingAddress\":{
            \"governorate\":\"الجيزة\",
            \"city\":\"الدقي\",
            \"street\":\"شارع التحرير\",
            \"building\":\"15\",
            \"floor\":\"3\",
            \"phone\":\"01012345678\"
        },
        \"paymentMethod\":\"WALLET\"
    }" "$BUYER_TOKEN")

    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        ORDER_ID=$(echo $response | jq -r '.data.id')
        local status=$(echo $response | jq -r '.data.status')
        print_success "تم إنشاء الطلب بنجاح"
        print_info "Order ID: $ORDER_ID"
        print_info "Status: $status"
    else
        local message=$(echo $response | jq -r '.message // "Unknown error"')
        print_error "فشل إنشاء الطلب: $message"
        echo "Response: $response"

        # Try alternative endpoint
        print_warning "محاولة إنشاء طلب مباشر..."
        local alt_response=$(api_call "POST" "/orders/direct" "{
            \"listingId\":\"$LISTING_ID\",
            \"quantity\":1
        }" "$BUYER_TOKEN")

        ORDER_ID=$(echo $alt_response | jq -r '.data.id // empty')
        if [ -n "$ORDER_ID" ]; then
            print_success "تم إنشاء الطلب بالطريقة البديلة"
            print_info "Order ID: $ORDER_ID"
        fi
    fi
}

step_1_7_confirm_order() {
    print_step "الخطوة 1.7: تأكيد الطلب من البائع"

    local response=$(api_call "PUT" "/orders/$ORDER_ID/confirm" "{
        \"estimatedDelivery\":\"2025-01-20\"
    }" "$SELLER_TOKEN")

    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        local status=$(echo $response | jq -r '.data.status')
        print_success "تم تأكيد الطلب"
        print_info "New Status: $status"
    else
        local message=$(echo $response | jq -r '.message // "Unknown error"')
        print_error "فشل تأكيد الطلب: $message"
        echo "Response: $response"
    fi
}

step_1_8_ship_order() {
    print_step "الخطوة 1.8: شحن الطلب"

    local response=$(api_call "PUT" "/orders/$ORDER_ID/ship" "{
        \"trackingNumber\":\"EGY123456789\",
        \"shippingCompany\":\"Aramex\"
    }" "$SELLER_TOKEN")

    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        local status=$(echo $response | jq -r '.data.status')
        print_success "تم شحن الطلب"
        print_info "Tracking: EGY123456789"
        print_info "Status: $status"
    else
        local message=$(echo $response | jq -r '.message // "Unknown error"')
        print_error "فشل تحديث حالة الشحن: $message"
    fi
}

step_1_9_deliver_order() {
    print_step "الخطوة 1.9: استلام الطلب والتقييم"

    local response=$(api_call "PUT" "/orders/$ORDER_ID/deliver" "{
        \"deliveryConfirmed\":true
    }" "$BUYER_TOKEN")

    local success=$(echo $response | jq -r '.success // false')

    if [ "$success" = "true" ]; then
        local status=$(echo $response | jq -r '.data.status')
        print_success "تم تأكيد الاستلام"
        print_info "Final Status: $status"

        # Add review
        print_info "إضافة تقييم..."
        local review_response=$(api_call "POST" "/reviews" "{
            \"orderId\":\"$ORDER_ID\",
            \"rating\":5,
            \"review\":\"منتج ممتاز والبائع متعاون جداً - UAT Test\"
        }" "$BUYER_TOKEN")

        local review_success=$(echo $review_response | jq -r '.success // false')
        if [ "$review_success" = "true" ]; then
            print_success "تم إضافة التقييم بنجاح"
        fi
    else
        local message=$(echo $response | jq -r '.message // "Unknown error"')
        print_error "فشل تأكيد الاستلام: $message"
    fi
}

print_summary() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║            📊 ملخص نتائج الاختبار                    ║${NC}"
    echo -e "${BLUE}╠══════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC} API URL: $API_URL"
    echo -e "${BLUE}║${NC} Seller ID: $SELLER_ID"
    echo -e "${BLUE}║${NC} Buyer ID: $BUYER_ID"
    echo -e "${BLUE}║${NC} Item ID: $ITEM_ID"
    echo -e "${BLUE}║${NC} Listing ID: $LISTING_ID"
    echo -e "${BLUE}║${NC} Order ID: $ORDER_ID"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
}

# =====================================================
# MAIN EXECUTION
# =====================================================

main() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     🧪 XChange Egypt - UAT Scenario 1                ║${NC}"
    echo -e "${GREEN}║        رحلة البيع المباشر                            ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "API URL: $API_URL"
    echo "Seller: $SELLER_EMAIL"
    echo "Buyer: $BUYER_EMAIL"
    echo ""

    check_dependencies

    step_0_check_server
    step_1_1_seller_login

    if [ -n "$SELLER_TOKEN" ]; then
        step_1_2_get_category
        step_1_2_create_item

        if [ -n "$ITEM_ID" ]; then
            step_1_3_create_listing

            if [ -n "$LISTING_ID" ]; then
                step_1_4_buyer_login

                if [ -n "$BUYER_TOKEN" ]; then
                    step_1_4_search
                    step_1_5_add_to_cart
                    step_1_6_create_order

                    if [ -n "$ORDER_ID" ]; then
                        step_1_7_confirm_order
                        step_1_8_ship_order
                        step_1_9_deliver_order
                    fi
                fi
            fi
        fi
    fi

    print_summary

    echo ""
    echo -e "${GREEN}✅ اكتمل تنفيذ السيناريو!${NC}"
}

# Run main function
main "$@"
