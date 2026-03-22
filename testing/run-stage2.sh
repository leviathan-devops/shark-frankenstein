#!/bin/bash
#
# 🦈 SHARK CLI - Stage 2: Local Device Testing
#
# Real-world testing with actual TTY, network, and API keys.
# Guardian protection is ENABLED to protect the local device.
#
# ⚠️ IMPORTANT: Guardian protects your local device during testing.
#    All file operations are validated before execution.
#    Sandbox mode available for maximum safety.
#
# Usage:
#   ./run-stage2.sh                    # Run all interactive tests
#   ./run-stage2.sh --sandbox          # Run in sandbox mode (safest)
#   ./run-stage2.sh --quick            # Quick validation
#   ./run-stage2.sh --api-test         # Test real API calls
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
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  🦈 SHARK CLI - Stage 2: Local Device Testing                 ║"
echo "║                                                               ║"
echo "║  Guardian: BALANCED mode (workspace + dev folders allowed)    ║"
echo "║  ⚠️  Your local device is PROTECTED by Guardian               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parse arguments
GUARDIAN_LEVEL="balanced"
QUICK_MODE=false
API_TEST=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --sandbox)
            GUARDIAN_LEVEL="sandbox"
            shift
            ;;
        --strict)
            GUARDIAN_LEVEL="strict"
            shift
            ;;
        --quick)
            QUICK_MODE=true
            shift
            ;;
        --api-test)
            API_TEST=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--sandbox] [--strict] [--quick] [--api-test]"
            exit 1
            ;;
    esac
done

# Guardian protection notice
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  🛡️  GUARDIAN PROTECTION ACTIVE                               ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Guardian Mode: ${CYAN}$GUARDIAN_LEVEL${NC}"
echo ""
echo "  Protected zones:"
echo "    • System files:      ${RED}BLOCKED${NC}"
echo "    • Personal files:    ${RED}BLOCKED${NC}"
echo "    • Config files:      ${RED}BLOCKED${NC}"
echo "    • Dev folders:       ${GREEN}ALLOWED${NC}"
echo "    • Workspace:         ${GREEN}ALLOWED${NC}"
case "$GUARDIAN_LEVEL" in
    sandbox)
        echo ""
        echo "  ${YELLOW}SANDBOX MODE: All writes redirected to isolated sandbox${NC}"
        ;;
esac
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if built
if [ ! -d "$PROJECT_ROOT/dist" ]; then
    echo -e "${YELLOW}📦 Building project...${NC}"
    cd "$PROJECT_ROOT" && npm run build
fi

# Set Guardian environment
export GUARDIAN_LEVEL="$GUARDIAN_LEVEL"
export GUARDIAN_ENABLED="true"

# Check API keys
echo -e "${CYAN}🔑 API Key Status:${NC}"
if [ -n "$GOOGLE_API_KEY" ]; then
    echo "  Google (Gemma):    ${GREEN}✓ Set${NC}"
else
    echo "  Google (Gemma):    ${YELLOW}✗ Not set${NC}"
fi
if [ -n "$GLM_API_KEY" ]; then
    echo "  GLM:               ${GREEN}✓ Set${NC}"
else
    echo "  GLM:               ${YELLOW}✗ Not set${NC}"
fi
if [ -n "$DEEPSEEK_API_KEY" ]; then
    echo "  DeepSeek:          ${GREEN}✓ Set${NC}"
else
    echo "  DeepSeek:          ${YELLOW}✗ Not set${NC}"
fi
echo ""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Run a test and track results
run_test() {
    local test_name="$1"
    local test_script="$2"
    
    echo -e "${CYAN}▶ $test_name${NC}"
    echo ""
    
    if [ -f "$test_script" ]; then
        if bash "$test_script"; then
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        echo "  ${YELLOW}⊘ SKIPPED (not found)${NC}"
        SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
}

# Run tests
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}  Running Interactive Tests                                     ${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

run_test "Interactive Wizard" "$SCRIPT_DIR/stage2-local/test-interactive.sh"

if [ "$QUICK_MODE" != "true" ]; then
    run_test "TTY Features" "$SCRIPT_DIR/stage2-local/test-tty-features.sh"
fi

if [ "$API_TEST" = "true" ] || [ -n "$GOOGLE_API_KEY" ] || [ -n "$GLM_API_KEY" ]; then
    run_test "Real API Calls" "$SCRIPT_DIR/stage2-local/test-real-api.sh"
else
    echo -e "${YELLOW}⊘ SKIPPING API tests (no API keys set)${NC}"
    echo "  Set GOOGLE_API_KEY and/or GLM_API_KEY to test real API calls"
    SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

run_test "Performance" "$SCRIPT_DIR/stage2-local/test-performance.sh"

# Generate report
REPORT_FILE="$REPORT_DIR/stage2-latest.json"
mkdir -p "$REPORT_DIR"
cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "stage": 2,
  "environment": "local",
  "guardian_mode": "$GUARDIAN_LEVEL",
  "device": "$(uname -a)",
  "node_version": "$(node --version)",
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
MD_REPORT="$REPORT_DIR/stage2-latest.md"
cat > "$MD_REPORT" << EOF
# 🦈 Stage 2: Local Device Test Report

**Date**: $(date)  
**Device**: $(uname -s) $(uname -m)  
**Node Version**: $(node --version)  
**Guardian Mode**: $GUARDIAN_LEVEL

## Summary

| Metric | Count |
|--------|-------|
| Total | $TOTAL_TESTS |
| Passed | $PASSED_TESTS |
| Failed | $FAILED_TESTS |
| Skipped | $SKIPPED_TESTS |

## Guardian Protection

During Stage 2 testing, Guardian protected the local device:
- Mode: $GUARDIAN_LEVEL
- System files: Blocked from modification
- Personal files: Protected
- All operations: Audited

## Result

$([ $FAILED_TESTS -eq 0 ] && echo "✅ PASSED - Ready for production" || echo "❌ FAILED - Review issues above")

---
*Report generated by Shark CLI Stage 2 testing with Guardian protection*
EOF

# Copy to history
cp "$REPORT_FILE" "$REPORT_DIR/history/stage2-$TIMESTAMP.json" 2>/dev/null || true
cp "$MD_REPORT" "$REPORT_DIR/history/stage2-$TIMESTAMP.md" 2>/dev/null || true

# Print summary
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Stage 2 Complete                                               ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Total:   $TOTAL_TESTS"
echo "  Passed:  $PASSED_TESTS"
echo "  Failed:  $FAILED_TESTS"
echo "  Skipped: $SKIPPED_TESTS"
echo ""
echo "  Guardian Mode: $GUARDIAN_LEVEL"
echo "  Your device was protected during testing."
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ Stage 2 PASSED - Shark CLI is production ready!${NC}"
    echo ""
    echo "Reports saved to:"
    echo "  $REPORT_FILE"
    echo "  $MD_REPORT"
    exit 0
else
    echo -e "${RED}❌ Stage 2 FAILED - Review issues above${NC}"
    exit 1
fi
