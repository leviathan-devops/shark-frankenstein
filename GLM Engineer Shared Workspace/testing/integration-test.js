#!/usr/bin/env node
/**
 * 🦈 Integration Test - Verify Guardian, Workflow, and AutoDebug
 * 
 * This test verifies that the previously theatrical modules are now properly integrated.
 */

const assert = require('assert');
const path = require('path');

// Import the CLI class
const { SharkCLI } = require('../dist/cli');
const { Guardian, ProtectionLevel, createProductionGuardian } = require('../dist/guardian');
const { WorkflowMachine } = require('../dist/workflow/state-machine');
const { WorkflowStep } = require('../dist/workflow/types');
const { AutoDebugEngine } = require('../dist/debug/autodebug');
const { BrainMode } = require('../dist/brain/types');

console.log('🦈 Integration Test - Verifying Module Integration\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${e.message}`);
    failed++;
  }
}

// Test 1: Guardian can be instantiated
test('Guardian can be instantiated', () => {
  const guardian = new Guardian({ level: ProtectionLevel.BALANCED });
  assert(guardian !== undefined);
  assert(guardian.isEnabled());
});

// Test 2: Guardian blocks system files
test('Guardian blocks system files', () => {
  const guardian = createProductionGuardian(process.cwd());
  const decision = guardian.checkModification('/etc/passwd');
  // Should not allow modification of system files
  assert(decision.includes('DENY') || decision.includes('deny'));
});

// Test 3: WorkflowMachine can be instantiated
test('WorkflowMachine can be instantiated', () => {
  const workflow = new WorkflowMachine(process.cwd());
  assert(workflow !== undefined);
});

// Test 4: Workflow starts at PLAN step
test('Workflow starts at PLAN step', () => {
  const workflow = new WorkflowMachine(process.cwd());
  const step = workflow.getCurrentStep();
  assert(step === WorkflowStep.PLAN);
});

// Test 5: AutoDebugEngine can be instantiated
test('AutoDebugEngine can be instantiated', () => {
  const autoDebug = new AutoDebugEngine();
  assert(autoDebug !== undefined);
});

// Test 6: AutoDebugEngine can analyze errors
test('AutoDebugEngine can analyze errors', () => {
  const autoDebug = new AutoDebugEngine();
  const issues = autoDebug.analyze('npm ERR! missing script: build');
  assert(Array.isArray(issues));
});

// Test 7: SharkCLI integrates all three
test('SharkCLI integrates Guardian, Workflow, and AutoDebug', () => {
  const cli = new SharkCLI(process.cwd(), BrainMode.MICRO, { verbose: true });
  
  // Verify all components are accessible
  const step = cli.getWorkflowStep();
  assert(step !== undefined);
  
  const report = cli.getGuardianReport();
  assert(report.includes('Guardian'));
  
  const auditLog = cli.getGuardianAuditLog();
  assert(Array.isArray(auditLog));
});

// Test 8: SharkCLI method signature is correct
test('SharkCLI execute method exists', () => {
  const cli = new SharkCLI(process.cwd(), BrainMode.MICRO);
  assert(typeof cli.execute === 'function');
  assert(typeof cli.getWorkflowStep === 'function');
  assert(typeof cli.checkGuardian === 'function');
  assert(typeof cli.runVerificationGate === 'function');
});

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✅ All integration tests passed!');
  process.exit(0);
}
