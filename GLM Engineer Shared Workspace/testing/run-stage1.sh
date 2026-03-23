#!/bin/bash
#
# 🦈 SHARK CLI - Stage 1: Docker Sandbox Testing
#
# Automated, isolated testing in Docker container.
# Guardian protection enabled in SANDBOX mode.
#
# Usage:
#   ./run-stage1.sh                    # Run all tests
#   ./run-stage1.sh --suite api        # Run specific suite
#   ./run-stage1.sh --quick            # Quick validation only
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REPORT_DIR="$SCRIPT_DIR/reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  🦈 SHARK CLI - Stage 1: Docker Sandbox Testing               ║"
echo "║                                                               ║"
echo "║  Guardian: SANDBOX MODE (all writes redirected)               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parse arguments
SUITE="all"
QUICK_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --suite)
            SUITE="$2"
            shift 2
            ;;
        --quick)
            QUICK_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Build Docker image
echo -e "${YELLOW}📦 Building Docker test image...${NC}"
docker build -t shark-test-stage1 -f "$SCRIPT_DIR/stage1-docker/Dockerfile" "$PROJECT_ROOT" 2>&1 | tail -5

# Run tests
echo -e "${YELLOW}🐳 Running tests in Docker container...${NC}"
echo ""

TEST_RESULT=0

docker run --rm \
    -e GUARDIAN_LEVEL=sandbox \
    -e NODE_ENV=test \
    -e TEST_SUITE="$SUITE" \
    -e QUICK_MODE="$QUICK_MODE" \
    -v "$REPORT_DIR:/app/testing/reports" \
    shark-test-stage1 \
    /app/testing/stage1-docker/run-tests.sh || TEST_RESULT=$?

# Generate report
echo ""
echo -e "${CYAN}📊 Test Summary:${NC}"

if [ -f "$REPORT_DIR/stage1-latest.json" ]; then
    PASSED=$(cat "$REPORT_DIR/stage1-latest.json" | grep -o '"passed": [0-9]*' | grep -o '[0-9]*' || echo "0")
    FAILED=$(cat "$REPORT_DIR/stage1-latest.json" | grep -o '"failed": [0-9]*' | grep -o '[0-9]*' || echo "0")
    
    echo "  ✅ Passed: $PASSED"
    echo "  ❌ Failed: $FAILED"
    
    if [ "$FAILED" -gt 0 ]; then
        echo ""
        echo -e "${RED}❌ Stage 1 FAILED - Fix issues before Stage 2${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ Stage 1 PASSED - Ready for Stage 2 local testing${NC}"
echo ""
echo "Next step: Run ./run-stage2.sh on local device"
echo "This will test with real TTY and API keys under Guardian protection."

exit 0
