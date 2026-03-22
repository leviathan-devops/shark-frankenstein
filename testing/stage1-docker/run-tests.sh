#!/bin/bash
#
# 🦈 Stage 1 Test Runner
#
# Runs inside Docker container with Guardian SANDBOX mode
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_DIR="/app/testing/reports"

# Colors (limited in Docker)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Stage 1: Docker Sandbox Tests                                  ${NC}"
echo -e "${CYAN}  Guardian Mode: SANDBOX (all writes redirected)                 ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Run a test file and track results
run_test() {
    local test_name="$1"
    local test_script="$2"
    
    echo -e "${YELLOW}▶ Running: $test_name${NC}"
    
    if [ -f "$test_script" ]; then
        if bash "$test_script"; then
            echo -e "  ${GREEN}✓ PASSED${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "  ${RED}✗ FAILED${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        echo -e "  ${YELLOW}⊘ SKIPPED (not found)${NC}"
        SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
}

# Determine which suites to run
SUITE="${TEST_SUITE:-all}"
QUICK="${QUICK_MODE:-false}"

echo "Test Suite: $SUITE"
echo "Quick Mode: $QUICK"
echo ""

# Run test suites
case "$SUITE" in
    all|non-interactive)
        run_test "Non-Interactive Mode" "$SCRIPT_DIR/test-non-interactive.sh"
        if [ "$SUITE" != "all" ]; then break; fi
        ;&  # fallthrough
    api|all)
        run_test "API Integration" "$SCRIPT_DIR/test-api-integration.sh"
        if [ "$SUITE" != "all" ]; then break; fi
        ;&
    error|all)
        run_test "Error Handling" "$SCRIPT_DIR/test-error-handling.sh"
        if [ "$SUITE" != "all" ]; then break; fi
        ;&
    security|all)
        run_test "Guardian Security" "$SCRIPT_DIR/test-security.sh"
        if [ "$SUITE" != "all" ]; then break; fi
        ;&
    edge|all)
        if [ "$QUICK" != "true" ]; then
            run_test "Edge Cases" "$SCRIPT_DIR/test-edge-cases.sh"
        fi
        ;;
esac

# Write JSON report
REPORT_FILE="$REPORT_DIR/stage1-latest.json"
cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "stage": 1,
  "environment": "docker",
  "guardian_mode": "sandbox",
  "summary": {
    "total": $TOTAL_TESTS,
    "passed": $PASSED_TESTS,
    "failed": $FAILED_TESTS,
    "skipped": $SKIPPED_TESTS
  },
  "success": $([ $FAILED_TESTS -eq 0 ] && echo "true" || echo "false")
}
EOF

# Write markdown report
MD_REPORT="$REPORT_DIR/stage1-latest.md"
cat > "$MD_REPORT" << EOF
# 🦈 Stage 1: Docker Sandbox Test Report

**Date**: $(date)  
**Environment**: Docker (node:18-alpine)  
**Guardian Mode**: SANDBOX

## Summary

| Metric | Count |
|--------|-------|
| Total | $TOTAL_TESTS |
| Passed | $PASSED_TESTS |
| Failed | $FAILED_TESTS |
| Skipped | $SKIPPED_TESTS |

## Result

$([ $FAILED_TESTS -eq 0 ] && echo "✅ PASSED - Ready for Stage 2" || echo "❌ FAILED - Fix issues before Stage 2")

---
*Report generated automatically by Shark CLI Stage 1 testing*
EOF

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Stage 1 Complete                                               ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Total:   $TOTAL_TESTS"
echo "  Passed:  $PASSED_TESTS"
echo "  Failed:  $FAILED_TESTS"
echo "  Skipped: $SKIPPED_TESTS"
echo ""

# Exit with proper code
if [ $FAILED_TESTS -gt 0 ]; then
    exit 1
fi

exit 0
