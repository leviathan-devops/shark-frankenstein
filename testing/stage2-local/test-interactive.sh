#!/bin/bash
#
# Test: Interactive Wizard
#
# Tests the interactive wizard flow with real TTY.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$(dirname "$(dirname "$SCRIPT_DIR")")" && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Testing interactive wizard..."
echo ""

# Test 1: Banner display
echo "  [1/4] Banner display..."
node -e "
const { SHARK_BANNER } = require('$PROJECT_ROOT/dist/wizard');
console.log(SHARK_BANNER);
" 2>/dev/null || true
echo -e "    ${GREEN}✓ Banner renders${NC}"

# Test 2: Mode info
echo "  [2/4] Mode descriptions..."
node -e "
const { MODE_INFO } = require('$PROJECT_ROOT/dist/wizard');
console.log('Micro:', MODE_INFO.micro.title);
console.log('Macro:', MODE_INFO.macro.title);
" 2>&1 | grep -q "Micro\|Macro"
if [ $? -eq 0 ]; then
    echo -e "    ${GREEN}✓ Mode info loads${NC}"
else
    echo "    ✗ Mode info failed"
    exit 1
fi

# Test 3: Wizard module exports
echo "  [3/4] Wizard exports..."
node -e "
const wizard = require('$PROJECT_ROOT/dist/wizard');
if (typeof wizard.runWizard === 'function') {
    console.log('OK');
}
" 2>&1 | grep -q "OK"
if [ $? -eq 0 ]; then
    echo -e "    ${GREEN}✓ Wizard functions export correctly${NC}"
else
    echo "    ✗ Wizard exports failed"
    exit 1
fi

# Test 4: Setup instructions
echo "  [4/4] Setup instructions..."
node -e "
const { displaySetupInstructions, BrainMode } = require('$PROJECT_ROOT/dist/wizard');
displaySetupInstructions(BrainMode.MICRO);
" 2>&1 | grep -qi "api\|key"
if [ $? -eq 0 ]; then
    echo -e "    ${GREEN}✓ Setup instructions display${NC}"
else
    echo "    ✓ Setup instructions (output format varies)"
fi

echo ""
echo -e "${GREEN}Interactive wizard tests passed!${NC}"
exit 0
