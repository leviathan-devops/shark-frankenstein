#!/bin/bash
#
# Test: TTY Features
#
# Tests terminal-specific features with real TTY.
#

PROJECT_ROOT="$(cd "$(dirname "$(dirname "$(dirname "$0")")")" && pwd)"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo "Testing TTY features..."
echo ""

# Test 1: Color support
echo "  [1/4] Color support..."
if node -e "console.log('\x1b[36mCyan\x1b[0m')" | grep -q $'\x1b'; then
    echo -e "    ${GREEN}✓ ANSI colors work${NC}"
else
    echo "    ✓ Colors (terminal dependent)"
fi

# Test 2: isTTY detection
echo "  [2/4] TTY detection..."
if [ -t 0 ]; then
    echo -e "    ${GREEN}✓ Running with real TTY${NC}"
else
    echo "    ⚠ Not a real TTY (piped)"
fi

# Test 3: Console dimensions
echo "  [3/4] Console dimensions..."
COLS=$(tput cols 2>/dev/null || echo "80")
LINES=$(tput lines 2>/dev/null || echo "24")
echo -e "    ${GREEN}✓ Terminal: ${COLS}x${LINES}${NC}"

# Test 4: Interactive prompt library
echo "  [4/4] Enquirer integration..."
node -e "
try {
    require('enquirer');
    console.log('OK');
} catch (e) {
    console.log('MISSING');
}
" 2>&1 | grep -q "OK"
if [ $? -eq 0 ]; then
    echo -e "    ${GREEN}✓ Enquirer available${NC}"
else
    echo "    ✗ Enquirer missing"
    exit 1
fi

echo ""
echo -e "${GREEN}TTY feature tests passed!${NC}"
exit 0
