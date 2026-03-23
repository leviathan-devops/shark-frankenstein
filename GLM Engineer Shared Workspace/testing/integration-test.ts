#!/usr/bin/env node
/**
 * 🦈 Integration Test - Verify Guardian, Workflow, and AutoDebug
 */

import * as path from 'path';
import { Guardian, ProtectionLevel, createProductionGuardian } from '../src/guardian';
import { WorkflowMachine } from '../src/workflow/state-machine';
import { WorkflowStep } from '../src/workflow/types';

console.log('🦈 Integration Test - Verifying Module Integration\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e: any) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${e.message}`);
    failed++;
  }
}

// Test 1: Guardian can be instantiated
test('Guardian can be instantiated', () => {
  const guardian = new Guardian({ level: ProtectionLevel.BALANCED, workspacePath: process.cwd() });
  if (!guardian) throw new Error('Guardian is undefined');
  if (!guardian.isEnabled()) throw new Error('Guardian is not enabled');
});

// Test 2: Guardian blocks system files
test('Guardian blocks system files', () => {
  const guardian = createProductionGuardian(process.cwd());
  const decision = guardian.checkModification('/etc/passwd');
  // Should deny system files - check the decision
  const decisionStr = String(decision);
  if (!decisionStr.includes('DENY') && decisionStr !== 'deny') {
    throw new Error(`Expected DENY, got: ${decisionStr}`);
  }
});

// Test 3: WorkflowMachine can be instantiated
test('WorkflowMachine can be instantiated', () => {
  const workflow = new WorkflowMachine(process.cwd());
  if (!workflow) throw new Error('WorkflowMachine is undefined');
});

// Test 4: Workflow starts at PLAN step
test('Workflow starts at PLAN step', () => {
  const workflow = new WorkflowMachine(process.cwd());
  const step = workflow.getCurrentStep();
  if (step !== WorkflowStep.PLAN) {
    throw new Error(`Expected PLAN (${WorkflowStep.PLAN}), got: ${step}`);
  }
});

// Test 5: Workflow setOriginalPrompt works
test('Workflow setOriginalPrompt works', () => {
  const workflow = new WorkflowMachine(process.cwd());
  workflow.setOriginalPrompt('test prompt');
  const state = workflow.getState();
  if (state.originalPrompt !== 'test prompt') {
    throw new Error(`Expected 'test prompt', got: ${state.originalPrompt}`);
  }
});

// Test 6: Guardian generates report
test('Guardian generates report', () => {
  const guardian = createProductionGuardian(process.cwd());
  const report = guardian.generateReport();
  if (!report.includes('Guardian')) {
    throw new Error('Report does not contain Guardian');
  }
});

// Test 7: Guardian audit log works
test('Guardian audit log works', () => {
  const guardian = createProductionGuardian(process.cwd());
  const log = guardian.getAuditLog();
  if (!Array.isArray(log)) {
    throw new Error('Audit log is not an array');
  }
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
