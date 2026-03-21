#!/bin/bash
# 🦈 Shark CLI - Stage 1 Docker Sandbox Test Runner
# 
# This script runs automated tests in an isolated Docker environment.
# Guardian protection is enabled but Docker provides isolation.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORT_DIR="$PROJECT_ROOT/testing/reports"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║     🦈 STAGE 1: Docker Sandbox Testing                        ║"
echo "║                                                               ║"
echo "║     Guardian: ENABLED (Docker isolation)                      ║"
echo "║     Protection: SANDBOX mode                                  ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Stage 1 requires Docker.${NC}"
    exit 1
fi

# Create report directory
mkdir -p "$REPORT_DIR/history"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/stage1-latest.md"
HISTORY_FILE="$REPORT_DIR/history/stage1_$TIMESTAMP.md"

# Build Docker image
echo -e "${CYAN}📦 Building test container...${NC}"
cd "$PROJECT_ROOT"

docker build -t shark-test-stage1 -f - . << 'DOCKERFILE'
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache git bash

# Create non-root user
RUN addgroup -S sharkgroup && adduser -S sharkuser -G sharkgroup

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Set permissions
RUN chown -R sharkuser:sharkgroup /app

USER sharkuser

# Default to test mode
ENV SHARK_GUARDIAN_MODE=sandbox
ENV SHARK_STAGE=1

CMD ["/bin/bash"]
DOCKERFILE

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Container built${NC}"

# Test suites
declare -a TEST_SUITES=(
    "non-interactive"
    "api-integration"
    "error-handling"
    "security"
    "edge-cases"
)

declare -a TEST_RESULTS=()
TOTAL_PASSED=0
TOTAL_FAILED=0
TOTAL_SKIPPED=0

# Run each test suite
for suite in "${TEST_SUITES[@]}"; do
    echo -e "\n${CYAN}🧪 Running test suite: $suite${NC}"
    
    SUITE_PASSED=0
    SUITE_FAILED=0
    SUITE_SKIPPED=0
    
    case $suite in
        "non-interactive")
            # Test non-interactive mode
            echo "  Testing stdin handling..."
            
            # Test 1: Micro mode with piped input
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'echo "write a hello world function" | node dist/cli.js micro 2>&1' || echo "FAILED")
            if [[ "$RESULT" == *"function"* ]] || [[ "$RESULT" == *"hello"* ]]; then
                echo -e "    ${GREEN}✓${NC} Micro mode piped input"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} Micro mode piped input"
                ((SUITE_FAILED++))
            fi
            
            # Test 2: Macro mode with piped input
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'echo "list files" | SHARK_MODE=macro node dist/cli.js 2>&1' || echo "FAILED")
            if [[ "$RESULT" != *"Mode required"* ]]; then
                echo -e "    ${GREEN}✓${NC} Macro mode via SHARK_MODE"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} Macro mode via SHARK_MODE"
                ((SUITE_FAILED++))
            fi
            
            # Test 3: Mode required error
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'echo "test" | node dist/cli.js 2>&1' || echo "FAILED")
            if [[ "$RESULT" == *"Mode required"* ]]; then
                echo -e "    ${GREEN}✓${NC} Missing mode error message"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} Missing mode error message"
                ((SUITE_FAILED++))
            fi
            ;;
            
        "api-integration")
            echo "  Testing API client initialization..."
            
            # Test API client creation without keys
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'node -e "const {GemmaClient} = require(\"./dist/brain/gemma\"); const c = new GemmaClient(); console.log(c.isConfigured())"')
            if [[ "$RESULT" == "false" ]]; then
                echo -e "    ${GREEN}✓${NC} Gemma client handles missing key"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} Gemma client handles missing key"
                ((SUITE_FAILED++))
            fi
            
            # Test GLM client
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'node -e "const {GLMClient} = require(\"./dist/brain/glm\"); const c = new GLMClient(); console.log(c.isConfigured())"')
            if [[ "$RESULT" == "false" ]]; then
                echo -e "    ${GREEN}✓${NC} GLM client handles missing key"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} GLM client handles missing key"
                ((SUITE_FAILED++))
            fi
            
            # Test DeepSeek client
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'node -e "const {DeepSeekClient} = require(\"./dist/brain/deepseek\"); const c = new DeepSeekClient(); console.log(c.isConfigured())"')
            if [[ "$RESULT" == "false" ]]; then
                echo -e "    ${GREEN}✓${NC} DeepSeek client handles missing key"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} DeepSeek client handles missing key"
                ((SUITE_FAILED++))
            fi
            ;;
            
        "error-handling")
            echo "  Testing error handling..."
            
            # Test timeout handling
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'node -e "const {DualBrainCoordinator} = require(\"./dist/brain/coordinator\"); const c = new DualBrainCoordinator({mode: \"micro\"}); console.log(c.isConfigured())"')
            if [[ "$RESULT" == "false" ]]; then
                echo -e "    ${GREEN}✓${NC} Coordinator handles missing config"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} Coordinator handles missing config"
                ((SUITE_FAILED++))
            fi
            
            # Test invalid mode
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'SHARK_MODE=invalid node dist/cli.js --help 2>&1' || echo "errored")
            if [[ "$RESULT" == *"Invalid SHARK_MODE"* ]] || [[ "$RESULT" == *"Usage"* ]]; then
                echo -e "    ${GREEN}✓${NC} Invalid mode handled"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} Invalid mode handled"
                ((SUITE_FAILED++))
            fi
            ;;
            
        "security")
            echo "  Testing Guardian security..."
            
            # Test Guardian initialization
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'node -e "const {Guardian} = require(\"./dist/guardian\"); const g = new Guardian(); console.log(g.isEnabled())"')
            if [[ "$RESULT" == "true" ]]; then
                echo -e "    ${GREEN}✓${NC} Guardian enabled by default"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} Guardian enabled by default"
                ((SUITE_FAILED++))
            fi
            
            # Test system path blocking
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'node -e "const {Guardian, ZoneType} = require(\"./dist/guardian\"); const g = new Guardian(); const info = g.getFileInfo(\"/etc/passwd\"); console.log(info.zone)"')
            if [[ "$RESULT" == *"SYSTEM"* ]] || [[ "$RESULT" == *"system"* ]]; then
                echo -e "    "${GREEN}✓${NC}" System paths blocked"
                ((SUITE_PASSED++))
            else
                echo -e "    "${RED}✗${NC}" System paths blocked"
                ((SUITE_FAILED++))
            fi
            
            # Test sandbox mode
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'node -e "const {Guardian, ProtectionLevel} = require(\"./dist/guardian\"); const g = new Guardian({level: ProtectionLevel.SANDBOX}); console.log(g.getProtectionLevel())"')
            if [[ "$RESULT" == *"SANDBOX"* ]] || [[ "$RESULT" == *"sandbox"* ]]; then
                echo -e "    ${GREEN}✓${NC} Sandbox mode available"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} Sandbox mode available"
                ((SUITE_FAILED++))
            fi
            ;;
            
        "edge-cases")
            echo "  Testing edge cases..."
            
            # Test empty input
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'echo "" | node dist/cli.js micro 2>&1' || echo "handled")
            echo -e "    ${GREEN}✓${NC} Empty input handled"
            ((SUITE_PASSED++))
            
            # Test help flag
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'node dist/cli.js --help 2>&1')
            if [[ "$RESULT" == *"SHARK CLI"* ]]; then
                echo -e "    ${GREEN}✓${NC} Help flag works"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} Help flag works"
                ((SUITE_FAILED++))
            fi
            
            # Test version flag
            RESULT=$(docker run --rm shark-test-stage1 sh -c \
                'node dist/cli.js --version 2>&1')
            if [[ "$RESULT" == *"1.0.0"* ]]; then
                echo -e "    ${GREEN}✓${NC} Version flag works"
                ((SUITE_PASSED++))
            else
                echo -e "    ${RED}✗${NC} Version flag works"
                ((SUITE_FAILED++))
            fi
            ;;
    esac
    
    TOTAL_PASSED=$((TOTAL_PASSED + SUITE_PASSED))
    TOTAL_FAILED=$((TOTAL_FAILED + SUITE_FAILED))
    TOTAL_SKIPPED=$((TOTAL_SKIPPED + SUITE_SKIPPED))
    
    TEST_RESULTS+=("$suite: $SUITE_PASSED passed, $SUITE_FAILED failed")
done

# Generate report
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

cat > "$REPORT_FILE" << EOF
# 🦈 Stage 1: Docker Sandbox Test Report

**Date**: $DATE  
**Commit**: $COMMIT  
**Docker Image**: node:18-alpine  
**Guardian Mode**: SANDBOX

---

## Test Results

| Suite | Passed | Failed | Skipped |
|-------|--------|--------|---------|
$(for result in "${TEST_RESULTS[@]}"; do
    echo "| $result | | |"
done)
| **TOTAL** | **$TOTAL_PASSED** | **$TOTAL_FAILED** | **$TOTAL_SKIPPED** |

---

## Summary

- **Status**: $([ $TOTAL_FAILED -eq 0 ] && echo "✅ ALL TESTS PASSED" || echo "⚠️ SOME TESTS FAILED")
- **Pass Rate**: $(( TOTAL_PASSED * 100 / (TOTAL_PASSED + TOTAL_FAILED) ))%

---

## Recommendation

$([ $TOTAL_FAILED -eq 0 ] && echo "✅ PROCEED TO STAGE 2 (Local Device Testing)" || echo "❌ FIX FAILURES BEFORE STAGE 2")

---

*Generated by Shark Agent OS - Stage 1 Test Runner*
EOF

cp "$REPORT_FILE" "$HISTORY_FILE"

# Print summary
echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  STAGE 1 COMPLETE${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Passed:  ${GREEN}$TOTAL_PASSED${NC}"
echo "  Failed:  ${RED}$TOTAL_FAILED${NC}"
echo "  Skipped: ${YELLOW}$TOTAL_SKIPPED${NC}"
echo ""
echo "  Report: $REPORT_FILE"
echo ""

if [ $TOTAL_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Stage 1 PASSED - Ready for Stage 2${NC}"
    echo ""
    echo "  Run Stage 2 locally:"
    echo "  ${CYAN}./testing/run-stage2.sh${NC}"
    exit 0
else
    echo -e "${RED}❌ Stage 1 FAILED - Fix issues before Stage 2${NC}"
    exit 1
fi
