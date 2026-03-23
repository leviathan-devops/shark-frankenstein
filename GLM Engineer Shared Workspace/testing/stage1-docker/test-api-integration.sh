#!/bin/bash
#
# Test: API Integration
#
# Tests API client implementations (without real API keys in Stage 1).
# Stage 1 tests the CLIENT CODE, not actual API calls.
#

APP_DIR="/app"

echo "Testing API integration (mock mode)..."

# Test 1: DeepSeek client loads
echo "  [1/4] DeepSeek client..."
if node -e "
const { DeepSeekClient } = require('$APP_DIR/dist/brain/deepseek');
const client = new DeepSeekClient({ apiKey: 'test-key' });
console.log('OK');
" 2>&1 | grep -q "OK"; then
    echo "    ✓ DeepSeek client instantiates"
else
    echo "    ✗ DeepSeek client failed"
    exit 1
fi

# Test 2: GLM client loads
echo "  [2/4] GLM client..."
if node -e "
const { GLMClient } = require('$APP_DIR/dist/brain/glm');
const client = new GLMClient({ apiKey: 'test-key' });
console.log('OK');
" 2>&1 | grep -q "OK"; then
    echo "    ✓ GLM client instantiates"
else
    echo "    ✗ GLM client failed"
    exit 1
fi

# Test 3: Gemma client loads
echo "  [3/4] Gemma client..."
if node -e "
const { GemmaClient } = require('$APP_DIR/dist/brain/gemma');
const client = new GemmaClient({ apiKey: 'test-key' });
console.log('OK');
" 2>&1 | grep -q "OK"; then
    echo "    ✓ Gemma client instantiates"
else
    echo "    ✗ Gemma client failed"
    exit 1
fi

# Test 4: Brain coordinator loads
echo "  [4/4] Brain coordinator..."
if node -e "
const { BrainCoordinator, BrainMode } = require('$APP_DIR/dist/brain/coordinator');
const coordinator = new BrainCoordinator({ mode: BrainMode.MICRO });
console.log('OK');
" 2>&1 | grep -q "OK"; then
    echo "    ✓ Brain coordinator instantiates"
else
    echo "    ✗ Brain coordinator failed"
    exit 1
fi

echo ""
echo "  API integration tests passed!"
exit 0
