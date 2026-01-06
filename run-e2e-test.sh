#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  🔍 سكريبت اختبار شامل لمنصة Xchange Egypt
#  Comprehensive E2E Test Script
# ═══════════════════════════════════════════════════════════════

FRONTEND_URL="https://xchange-egypt.vercel.app"
BACKEND_URL="https://xchange-egypt-production.up.railway.app"
API_URL="${BACKEND_URL}/api/v1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Arrays for results
declare -a FAILED_TESTS
declare -a PASSED_TESTS

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║${BOLD}     🧪 اختبار شامل لمنصة Xchange Egypt                       ${NC}${BLUE}║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📡 Backend URL: ${BACKEND_URL}${NC}"
echo -e "${YELLOW}🌐 Frontend URL: ${FRONTEND_URL}${NC}"
echo -e "${YELLOW}⏰ Time: $(date)${NC}"
echo ""

# Test function
test_url() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}

    TOTAL=$((TOTAL + 1))

    response=$(curl -s -w "%{http_code}" -o /tmp/test_response.txt --max-time 15 "$url" 2>/dev/null)
    status=$response

    if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
        PASSED=$((PASSED + 1))
        PASSED_TESTS+=("$name")
        echo -e "  ${GREEN}✅${NC} $name (HTTP $status)"
        return 0
    else
        FAILED=$((FAILED + 1))
        FAILED_TESTS+=("$name (HTTP $status)")
        echo -e "  ${RED}❌${NC} $name (HTTP $status)"
        return 1
    fi
}

# Test frontend page with content check
test_page() {
    local path=$1
    local name=$2

    TOTAL=$((TOTAL + 1))

    response=$(curl -s -w "\n%{http_code}" --max-time 15 "${FRONTEND_URL}${path}" 2>/dev/null)
    status=$(echo "$response" | tail -1)
    content=$(echo "$response" | head -n -1)

    # Check for error patterns in content
    if echo "$content" | grep -q "Application error\|Unhandled Runtime Error\|500"; then
        FAILED=$((FAILED + 1))
        FAILED_TESTS+=("$name - Content Error")
        echo -e "  ${RED}❌${NC} $name - خطأ في المحتوى"
        return 1
    elif [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
        PASSED=$((PASSED + 1))
        PASSED_TESTS+=("$name")
        echo -e "  ${GREEN}✅${NC} $name (HTTP $status)"
        return 0
    else
        FAILED=$((FAILED + 1))
        FAILED_TESTS+=("$name (HTTP $status)")
        echo -e "  ${RED}❌${NC} $name (HTTP $status)"
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════════
# Test 1: Backend Health
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}━━━ 🏥 فحص صحة الخادم ━━━${NC}"
echo ""
test_url "${BACKEND_URL}/health" "Health Check"
test_url "${API_URL}" "API Root"
test_url "${API_URL}/categories" "Categories API"
echo ""

# ═══════════════════════════════════════════════════════════════
# Test 2: Frontend Pages (Public)
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}━━━ 🌐 فحص الصفحات العامة ━━━${NC}"
echo ""

test_page "/" "الصفحة الرئيسية"
test_page "/login" "تسجيل الدخول"
test_page "/register" "إنشاء حساب"
test_page "/forgot-password" "نسيت كلمة المرور"
test_page "/marketplace" "السوق"
test_page "/barter" "المقايضة"
test_page "/barter/guide" "دليل المقايضة"
test_page "/barter/open-offers" "عروض المقايضة"
test_page "/auctions" "المزادات"
test_page "/auctions/live" "المزادات الحية"
test_page "/cars" "سوق السيارات"
test_page "/cars/calculator" "حاسبة السيارات"
test_page "/cars/sell" "بيع سيارة"
test_page "/gold" "سوق الذهب"
test_page "/gold/calculator" "حاسبة الذهب"
test_page "/gold/sell" "بيع ذهب"
test_page "/properties" "العقارات"
test_page "/donations" "التبرعات"
test_page "/deals" "العروض"
test_page "/pricing" "الأسعار"
test_page "/premium" "العضوية المميزة"
test_page "/facilitators" "الميسرين"
test_page "/delivery" "التوصيل"
test_page "/escrow" "الضمان"
test_page "/installments" "التقسيط"
test_page "/exchange-points" "نقاط التبادل"
test_page "/price-predictor" "توقع الأسعار"
test_page "/assistant" "المساعد الذكي"
test_page "/rides" "الرحلات"
test_page "/pools" "مجمعات التداول"
test_page "/barter-chains" "سلاسل المقايضة"
test_page "/reverse-auctions" "المزادات العكسية"
echo ""

# ═══════════════════════════════════════════════════════════════
# Test 3: Authenticated Pages (should redirect to login)
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}━━━ 🔐 فحص صفحات تتطلب تسجيل الدخول ━━━${NC}"
echo ""

test_page "/dashboard" "لوحة التحكم"
test_page "/dashboard/profile" "الملف الشخصي"
test_page "/dashboard/orders" "الطلبات"
test_page "/items/new" "إضافة منتج"
test_page "/barter/my-offers" "عروضي"
test_page "/messages" "الرسائل"
test_page "/notifications" "الإشعارات"
test_page "/cart" "السلة"
test_page "/checkout" "الدفع"
test_page "/alerts" "التنبيهات"
echo ""

# ═══════════════════════════════════════════════════════════════
# Test 4: Admin Pages
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}━━━ ⚙️ فحص صفحات الإدارة ━━━${NC}"
echo ""

test_page "/admin/login" "دخول الإدارة"
test_page "/admin" "لوحة الإدارة"
echo ""

# ═══════════════════════════════════════════════════════════════
# Test 5: API Endpoints
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}━━━ 🔌 فحص APIs ━━━${NC}"
echo ""

test_url "${API_URL}/items" "Items API"
test_url "${API_URL}/items?limit=10" "Items with Limit"
test_url "${API_URL}/auctions" "Auctions API"
test_url "${API_URL}/ai/status" "AI Status"
echo ""

# ═══════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                       📊 ملخص النتائج                         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}📈 إجمالي الاختبارات: ${TOTAL}${NC}"
echo -e "  ${GREEN}✅ نجح: ${PASSED}${NC}"
echo -e "  ${RED}❌ فشل: ${FAILED}${NC}"

PASS_RATE=$(echo "scale=1; ${PASSED} * 100 / ${TOTAL}" | bc)
if [ $(echo "$PASS_RATE >= 80" | bc) -eq 1 ]; then
    echo -e "  ${GREEN}📊 نسبة النجاح: ${PASS_RATE}%${NC}"
else
    echo -e "  ${YELLOW}📊 نسبة النجاح: ${PASS_RATE}%${NC}"
fi
echo ""

# List failed tests
if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    echo -e "${RED}━━━ الاختبارات الفاشلة ━━━${NC}"
    echo ""
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}❌${NC} $test"
    done
    echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
if [ $(echo "$PASS_RATE >= 80" | bc) -eq 1 ]; then
    echo -e "  ${GREEN}🎉 المنصة تعمل بشكل جيد!${NC}"
elif [ $(echo "$PASS_RATE >= 60" | bc) -eq 1 ]; then
    echo -e "  ${YELLOW}⚠️  المنصة تحتاج بعض الإصلاحات${NC}"
else
    echo -e "  ${RED}❌ المنصة تحتاج مراجعة شاملة${NC}"
fi
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Exit code based on results
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
