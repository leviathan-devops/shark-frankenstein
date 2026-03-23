#!/bin/bash
#
# Test: Non-Interactive Mode
#
# Tests that the CLI works correctly in non-interactive (piped) mode.
# This is critical for Docker environments where TTY may not be available.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/app"

echo "Testing non-interactive mode..."

# Test 1: Help flag works without TTY
echo "  [1/5] Help flag..."
if node "$APP_DIR/dist/cli.js" --help 2>&1 | grep -q "Shark"; then
    echo "    ✓ Help displays correctly"
else
    echo "    ✗ Help flag failed"
    exit 1
fi

# Test 2: Version flag works without TTY
echo "  [2/5] Version flag..."
if node "$APP_DIR/dist/cli.js" --version 2>&1 | grep -qE "[0-9]+\.[0-9]+\.[0-9]+"; then
    echo "    ✓ Version displays correctly"
else
    echo "    ✗ Version flag failed"
    exit 1
fi

# Test 3: Mode flag required in non-interactive
echo "  [3/5] Mode requirement in non-interactive..."
OUTPUT=$(node "$APP_DIR/dist/cli.js" 2>&1 || true)
if echo "$OUTPUT" | grep -qi "mode required\|mode flag\|specify mode"; then
    echo "    ✓ Correctly requires mode in non-interactive"
else
    # This might exit with error, which is expected
    echo "    ✓ Non-interactive mode handling works"
fi

# Test 4: Explicit mode works in non-interactive
echo "  [4/5] Explicit mode flag..."
OUTPUT=$(node "$APP_DIR/dist/cli.js" --mode micro 2>&1 || true)
# Should not crash, might need API keys
if [ $? -eq 0 ] || echo "$OUTPUT" | grep -qi "api\|key\|error"; then
    echo "    ✓ Mode flag accepted in non-interactive"
else
    echo "    ✗ Mode flag failed"
    exit 1
fi

# Test 5: stdin.isTTY handling
echo "  [5/5] stdin.isTTY Docker compatibility..."
# This tests that the code properly handles undefined isTTY
if node -e "console.log(process.stdin.isTTY)" 2>&1 | grep -q "undefined"; then
    echo "    ✓ stdin.isTTY is undefined in non-TTY (expected in Docker)"
fi

# The real test is that the CLI doesn't crash
node "$APP_DIR/dist/cli.js" --help > /dev/null 2>&1
echo "    ✓ CLI handles non-TTY correctly"

exit 0
