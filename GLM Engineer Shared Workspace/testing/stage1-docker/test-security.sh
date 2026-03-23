#!/bin/bash
#
# Test: Guardian Security
#
# Tests that Guardian properly protects the system in all modes.
# This is CRITICAL - Guardian must work in Docker AND on local devices.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/app"

echo "Testing Guardian security module..."

# Create test file
TEST_FILE="/tmp/guardian-test-file.txt"
echo "test content" > "$TEST_FILE"

# Test 1: Guardian module loads correctly
echo "  [1/6] Guardian module import..."
if node -e "const { Guardian } = require('$APP_DIR/dist/guardian'); console.log('OK')" 2>&1 | grep -q "OK"; then
    echo "    ✓ Guardian module loads"
else
    echo "    ✗ Guardian module failed to load"
    exit 1
fi

# Test 2: Guardian creates sandbox directory
echo "  [2/6] Sandbox creation..."
SANDBOX_DIR="/tmp/shark-sandbox-test"
rm -rf "$SANDBOX_DIR" 2>/dev/null || true
node -e "
const { Guardian, ProtectionLevel } = require('$APP_DIR/dist/guardian');
const g = new Guardian({ 
    level: ProtectionLevel.SANDBOX, 
    sandboxPath: '$SANDBOX_DIR' 
});
const fs = require('fs');
if (fs.existsSync('$SANDBOX_DIR')) {
    console.log('OK');
}
" 2>&1 | grep -q "OK"
if [ $? -eq 0 ]; then
    echo "    ✓ Sandbox directory created"
else
    echo "    ✗ Sandbox creation failed"
    exit 1
fi

# Test 3: System path detection
echo "  [3/6] System path detection..."
node -e "
const { Guardian, ZoneType } = require('$APP_DIR/dist/guardian');
const g = new Guardian();
const { zone } = g.classifyPath('/etc/passwd');
if (zone === ZoneType.SYSTEM) {
    console.log('OK');
}
" 2>&1 | grep -q "OK"
if [ $? -eq 0 ]; then
    echo "    ✓ System paths correctly classified"
else
    echo "    ✗ System path detection failed"
    exit 1
fi

# Test 4: Write denial for system paths
echo "  [4/6] System path write denial..."
node -e "
const { Guardian, ModificationDecision } = require('$APP_DIR/dist/guardian');
const g = new Guardian();
const decision = g.checkPermission('/etc/passwd', 'write');
if (decision === ModificationDecision.DENY) {
    console.log('OK');
}
" 2>&1 | grep -q "OK"
if [ $? -eq 0 ]; then
    echo "    ✓ System writes correctly denied"
else
    echo "    ✗ System write denial failed"
    exit 1
fi

# Test 5: Sandbox redirect in SANDBOX mode
echo "  [5/6] Sandbox redirect..."
node -e "
const { Guardian, ProtectionLevel, ModificationDecision } = require('$APP_DIR/dist/guardian');
const g = new Guardian({ level: ProtectionLevel.SANDBOX });
const decision = g.checkPermission('/tmp/test.txt', 'write');
if (decision === ModificationDecision.SANDBOX_REDIRECT) {
    console.log('OK');
}
" 2>&1 | grep -q "OK"
if [ $? -eq 0 ]; then
    echo "    ✓ Sandbox redirect works"
else
    echo "    ✗ Sandbox redirect failed"
    exit 1
fi

# Test 6: Audit logging
echo "  [6/6] Audit logging..."
AUDIT_LOG="/tmp/guardian-audit-test.log"
node -e "
const { Guardian } = require('$APP_DIR/dist/guardian');
const g = new Guardian({ auditLog: true, auditLogPath: '$AUDIT_LOG' });
g.checkPermission('/etc/passwd', 'write');
const log = g.getAuditLog();
if (log.length > 0) {
    console.log('OK');
}
" 2>&1 | grep -q "OK"
if [ $? -eq 0 ]; then
    echo "    ✓ Audit logging works"
else
    echo "    ✗ Audit logging failed"
    exit 1
fi

# Cleanup
rm -f "$TEST_FILE" "$AUDIT_LOG" 2>/dev/null || true
rm -rf "$SANDBOX_DIR" 2>/dev/null || true

echo ""
echo "  Guardian security tests passed!"
exit 0
