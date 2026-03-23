#!/bin/bash
#
# Test: Real API Calls
#
# Tests actual API calls with real API keys.
# This is where we validate the full pipeline works end-to-end.
#
# ⚠️ Requires actual API keys to be set.
#

PROJECT_ROOT="$(cd "$(dirname "$(dirname "$(dirname "$0")")")" && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "Testing real API calls..."
echo ""

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Test Gemma if key available
if [ -n "$GOOGLE_API_KEY" ]; then
    echo "  [1/3] Gemma 3 4B (Google AI Studio)..."
    START_TIME=$(date +%s%3N)
    
    RESULT=$(node -e "
const { GemmaClient } = require('$PROJECT_ROOT/dist/brain/gemma');
const client = new GemmaClient();

async function test() {
    try {
        const response = await client.chat('Say \"test ok\" and nothing else.');
        console.log('SUCCESS:', response.substring(0, 50));
    } catch (error) {
        console.log('ERROR:', error.message);
    }
}
test();
" 2>&1)
    
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    if echo "$RESULT" | grep -q "SUCCESS"; then
        echo -e "    ${GREEN}✓ Gemma responded in ${DURATION}ms${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "    ${RED}✗ Gemma failed: $(echo "$RESULT" | head -1)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo "  [1/3] Gemma: ${YELLOW}SKIPPED (no GOOGLE_API_KEY)${NC}"
fi

# Test GLM if key available
if [ -n "$GLM_API_KEY" ]; then
    echo "  [2/3] GLM 4.5-flash..."
    START_TIME=$(date +%s%3N)
    
    RESULT=$(node -e "
const { GLMClient } = require('$PROJECT_ROOT/dist/brain/glm');
const client = new GLMClient();

async function test() {
    try {
        const response = await client.chat('Say \"test ok\" and nothing else.');
        console.log('SUCCESS:', response.substring(0, 50));
    } catch (error) {
        console.log('ERROR:', error.message);
    }
}
test();
" 2>&1)
    
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    if echo "$RESULT" | grep -q "SUCCESS"; then
        echo -e "    ${GREEN}✓ GLM responded in ${DURATION}ms${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "    ${RED}✗ GLM failed: $(echo "$RESULT" | head -1)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo "  [2/3] GLM: ${YELLOW}SKIPPED (no GLM_API_KEY)${NC}"
fi

# Test DeepSeek if key available
if [ -n "$DEEPSEEK_API_KEY" ]; then
    echo "  [3/3] DeepSeek R1..."
    START_TIME=$(date +%s%3N)
    
    RESULT=$(node -e "
const { DeepSeekClient } = require('$PROJECT_ROOT/dist/brain/deepseek');
const client = new DeepSeekClient();

async function test() {
    try {
        const response = await client.chat('Say \"test ok\" and nothing else.');
        console.log('SUCCESS:', response.substring(0, 50));
    } catch (error) {
        console.log('ERROR:', error.message);
    }
}
test();
" 2>&1)
    
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    if echo "$RESULT" | grep -q "SUCCESS"; then
        echo -e "    ${GREEN}✓ DeepSeek responded in ${DURATION}ms${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "    ${RED}✗ DeepSeek failed: $(echo "$RESULT" | head -1)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo "  [3/3] DeepSeek: ${YELLOW}SKIPPED (no DEEPSEEK_API_KEY)${NC}"
fi

echo ""
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}API tests: $TESTS_PASSED passed, $TESTS_FAILED failed${NC}"
    exit 1
else
    echo -e "${GREEN}API tests: $TESTS_PASSED passed${NC}"
    exit 0
fi
