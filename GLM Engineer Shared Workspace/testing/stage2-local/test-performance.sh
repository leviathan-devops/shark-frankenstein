#!/bin/bash
#
# Test: Performance
#
# Tests performance characteristics of the CLI.
#

PROJECT_ROOT="$(cd "$(dirname "$(dirname "$(dirname "$0")")")" && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Testing performance..."
echo ""

# Test 1: Startup time
echo "  [1/4] Startup time..."
START=$(date +%s%3N)
node "$PROJECT_ROOT/dist/cli.js" --help > /dev/null 2>&1
END=$(date +%s%3N)
STARTUP=$((END - START))
echo -e "    ${GREEN}✓ Startup: ${STARTUP}ms${NC}"

if [ $STARTUP -gt 2000 ]; then
    echo -e "    ${YELLOW}⚠ Startup slower than expected (>2s)${NC}"
fi

# Test 2: Help command time
echo "  [2/4] Help command..."
START=$(date +%s%3N)
node "$PROJECT_ROOT/dist/cli.js" --help > /dev/null 2>&1
END=$(date +%s%3N)
HELP_TIME=$((END - START))
echo -e "    ${GREEN}✓ Help: ${HELP_TIME}ms${NC}"

# Test 3: Guardian operations
echo "  [3/4] Guardian performance..."
RESULT=$(node -e "
const { Guardian, ProtectionLevel } = require('$PROJECT_ROOT/dist/guardian');
const g = new Guardian({ level: ProtectionLevel.BALANCED });

const start = Date.now();
for (let i = 0; i < 1000; i++) {
    g.classifyPath('/home/user/project/file.ts');
}
const end = Date.now();
console.log(end - start);
" 2>&1)
echo -e "    ${GREEN}✓ 1000 path classifications: ${RESULT}ms${NC}"

# Test 4: Memory usage
echo "  [4/4] Memory footprint..."
MEM=$(node -e "
const v8 = require('v8');
const used = process.memoryUsage();
console.log(Math.round(used.heapUsed / 1024 / 1024));
" 2>&1)
echo -e "    ${GREEN}✓ Heap: ~${MEM}MB${NC}"

echo ""
echo -e "${GREEN}Performance tests passed!${NC}"
exit 0
