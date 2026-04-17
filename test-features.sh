#!/bin/bash

echo "🧪 EarnSure Feature Test Suite"
echo "================================"
echo ""

API_BASE="http://localhost:5000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$url" -H "Content-Type: application/json" -d '{}')
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        ((FAILED++))
    fi
}

echo "📡 Testing Backend APIs"
echo "----------------------"

# Real-time APIs
test_endpoint "Weather API" "$API_BASE/realtime/weather?lat=28.6139&lon=77.2090"
test_endpoint "Traffic API" "$API_BASE/realtime/traffic?lat=28.6139&lon=77.2090"
test_endpoint "Geocoding API" "$API_BASE/realtime/geocode?lat=28.6139&lon=77.2090"
test_endpoint "Forecast API" "$API_BASE/realtime/forecast?lat=28.6139&lon=77.2090"
test_endpoint "Monitor Status" "$API_BASE/realtime/monitor/status"

echo ""
echo "🤖 Testing AI Chatbot"
echo "---------------------"

test_endpoint "Chatbot Status" "$API_BASE/chatbot/status"

# Test chatbot message
echo -n "Testing Chatbot Message... "
response=$(curl -s -X POST "$API_BASE/chatbot/message" \
    -H "Content-Type: application/json" \
    -d '{
        "userId": "test123",
        "message": "What is the weather?",
        "context": {
            "lat": 28.6139,
            "lon": 77.2090,
            "starRating": 4,
            "walletBalance": 1000
        }
    }')

if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

echo ""
echo "👥 Testing Admin APIs"
echo "--------------------"

test_endpoint "Get Users" "$API_BASE/admin/users"
test_endpoint "Get Policies" "$API_BASE/admin/policies"
test_endpoint "Get Claims" "$API_BASE/admin/claims"

echo ""
echo "💳 Testing Payment APIs"
echo "----------------------"

test_endpoint "Payment Initiate" "$API_BASE/payment/initiate" "POST"

echo ""
echo "📊 Test Summary"
echo "==============="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! System is ready for demo.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check backend logs.${NC}"
    exit 1
fi
