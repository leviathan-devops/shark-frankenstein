/**
 * 🦈 SHARK CLI - Workflow Blocker
 *
 * THE BRICK WALL.
 *
 * This module provides the blocking mechanism that literally prevents
 * agents from progressing when they haven't completed the required steps.
 *
 * BLOCKING MECHANISMS:
 * 1. Git pre-push hook - Blocks `git push` if workflow not complete
 * 2. State check - Any shark command checks workflow state first
 * 3. File protection - Guardian blocks writes to protected paths
 *
 * BYPASS: NONE. The only way through is to complete the requirements.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';
import { WorkflowMachine } from './state-machine';
import { WorkflowStep, BlockReason, STEP_NAMES } from './types';

// ============================================================================
// BLOCKER
// ============================================================================

/**
 * Workflow Blocker
 *
 * Enforces the brick wall. Call before any critical operation.
 */
export class WorkflowBlocker {
  private machine: WorkflowMachine;
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.machine = new WorkflowMachine(workspacePath);
  }

  // ==========================================================================
  // BLOCKING CHECKS
  // ==========================================================================

  /**
   * Check if an operation is allowed
   *
   * Returns { allowed: false } if blocked, with reason and required actions
   */
  checkOperation(operation: 'push' | 'build' | 'test' | 'verify' | 'ship'): {
    allowed: boolean;
    reason?: string;
    requiredActions: string[];
    currentStep: WorkflowStep;
  } {
    const state = this.machine.getState();

    // If not blocked, allow
    if (!state.blocked) {
      return {
        allowed: true,
        requiredActions: [],
        currentStep: state.currentStep,
      };
    }

    // Map operation to required step
    const requiredSteps: Record<string, WorkflowStep> = {
      push: WorkflowStep.SHIP,
      ship: WorkflowStep.SHIP,
      verify: WorkflowStep.VERIFY,
      test: WorkflowStep.TEST,
      build: WorkflowStep.BUILD,
    };

    const required = requiredSteps[operation];

    // Check if agent is on the right step
    if (state.currentStep < required) {
      return {
        allowed: false,
        reason: `Cannot ${operation}. Must complete ${STEP_NAMES[state.currentStep]} first.`,
        requiredActions: [
          `Complete step ${state.currentStep}: ${STEP_NAMES[state.currentStep]}`,
          `Run: shark step ${state.currentStep}`,
        ],
        currentStep: state.currentStep,
      };
    }

    // Check step requirements
    return {
      allowed: false,
      reason: `Blocked: ${state.blockReason || 'requirements not met'}`,
      requiredActions: this.getRequiredActions(state.currentStep),
      currentStep: state.currentStep,
    };
  }

  /**
   * Block a git push operation
   *
   * This is the main gatekeeper for shipping code.
   */
  blockPush(): { blocked: boolean; message: string; actions: string[] } {
    const state = this.machine.getState();

    // Step 1: Must be on SHIP step
    if (state.currentStep !== WorkflowStep.SHIP) {
      return {
        blocked: true,
        message: `
╔═══════════════════════════════════════════════════════════════╗
║  🦈 SHARK CLI: PUSH BLOCKED                                    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Current Step: ${STEP_NAMES[state.currentStep].padEnd(46)}║
║  Required:     Ship (Step 5)                                  ║
║                                                               ║
║  You cannot push until you complete the workflow.             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`,
        actions: [
          'Complete all workflow steps',
          'Run: shark status',
          'Run: shark step ' + state.currentStep,
        ],
      };
    }

    // Step 2: All verification gates must pass
    if (!state.verification.allPassed) {
      const failedGates = this.getFailedGates(state);
      return {
        blocked: true,
        message: `
╔═══════════════════════════════════════════════════════════════╗
║  🦈 SHARK CLI: VERIFICATION REQUIRED                           ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Failed Gates: ${failedGates.join(', ').padEnd(45)}║
║                                                               ║
║  All verification gates MUST pass before shipping.            ║
║  This ensures:                                                ║
║    1. Code works (functional)                                 ║
║    2. Code matches plan (intent)                              ║
║    3. Code is secure (security)                               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`,
        actions: [
          'Run: shark verify',
          ...failedGates.map(g => `Run: shark verify ${g}`),
        ],
      };
    }

    // All checks passed
    return {
      blocked: false,
      message: 'Workflow complete. Push allowed.',
      actions: [],
    };
  }

  /**
   * Block if agent tries to write to protected paths
   */
  blockWrite(filePath: string): { blocked: boolean; reason?: string } {
    const state = this.machine.getState();

    // During PLAN step, only allow .shark/ writes
    if (state.currentStep === WorkflowStep.PLAN) {
      if (!filePath.includes('.shark/')) {
        return {
          blocked: true,
          reason: 'During PLAN step, can only write to .shark/ directory',
        };
      }
    }

    // During BUILD step, allow src/ and .shark/ writes
    if (state.currentStep === WorkflowStep.BUILD) {
      if (!filePath.includes('src/') && !filePath.includes('.shark/')) {
        return {
          blocked: true,
          reason: 'During BUILD step, can only write to src/ and .shark/',
        };
      }
    }

    return { blocked: false };
  }

  // ==========================================================================
  // GIT HOOK INSTALLATION
  // ==========================================================================

  /**
   * Install git pre-push hook
   *
   * This creates a hook that blocks pushes if workflow is incomplete
   */
  installGitHook(): boolean {
    const gitDir = path.join(this.workspacePath, '.git');
    const hooksDir = path.join(gitDir, 'hooks');
    const hookPath = path.join(hooksDir, 'pre-push');

    if (!fs.existsSync(gitDir)) {
      console.error('Not a git repository');
      return false;
    }

    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    const hookContent = `#!/bin/bash
# 🦈 SHARK CLI - Pre-push Hook
# This hook enforces the workflow before allowing pushes

set -e

# Check workflow state
WORKFLOW_STATE=".shark/workflow.json"

if [ ! -f "$WORKFLOW_STATE" ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║  🦈 SHARK CLI: NO WORKFLOW FOUND                              ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║                                                               ║"
    echo "║  Start a workflow first:                                      ║"
    echo "║    shark start                                                ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    exit 1
fi

# Parse workflow state
CURRENT_STEP=$(cat "$WORKFLOW_STATE" | grep -o '"currentStep": [0-9]*' | grep -o '[0-9]*')
ALL_PASSED=$(cat "$WORKFLOW_STATE" | grep -o '"allPassed": [a-z]*' | grep -o '[a-z]*')

# Check if on SHIP step
if [ "$CURRENT_STEP" != "5" ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║  🦈 SHARK CLI: PUSH BLOCKED                                    ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║                                                               ║"
    echo "║  Current Step: $CURRENT_STEP - Must be on Step 5 (Ship)       ║"
    echo "║                                                               ║"
    echo "║  Complete the workflow first:                                 ║"
    echo "║    shark status                                               ║"
    echo "║    shark verify                                               ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    exit 1
fi

# Check if all verification passed
if [ "$ALL_PASSED" != "true" ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║  🦈 SHARK CLI: VERIFICATION REQUIRED                           ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║                                                               ║"
    echo "║  All verification gates must pass before shipping.            ║"
    echo "║                                                               ║"
    echo "║  Run: shark verify                                            ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    exit 1
fi

echo "🦈 Workflow verified. Push allowed."
exit 0
`;

    fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
    console.log('✅ Git pre-push hook installed');

    return true;
  }

  /**
   * Uninstall git pre-push hook
   */
  uninstallGitHook(): boolean {
    const hookPath = path.join(this.workspacePath, '.git/hooks/pre-push');

    if (fs.existsSync(hookPath)) {
      fs.unlinkSync(hookPath);
      console.log('✅ Git pre-push hook removed');
      return true;
    }

    return false;
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private getRequiredActions(step: WorkflowStep): string[] {
    const actions: string[] = [];

    switch (step) {
      case WorkflowStep.PLAN:
        actions.push('Create .shark/plan.md with your implementation plan');
        actions.push('Create .shark/claims.json with verifiable claims');
        break;
      case WorkflowStep.BUILD:
        actions.push('Write the code according to your plan');
        actions.push('Create .shark/build-manifest.json');
        break;
      case WorkflowStep.TEST:
        actions.push('Run: shark test stage1');
        actions.push('Run: shark test stage2');
        break;
      case WorkflowStep.VERIFY:
        actions.push('Run: shark verify functional');
        actions.push('Run: shark verify intent');
        actions.push('Run: shark verify security');
        break;
      case WorkflowStep.SHIP:
        actions.push('All verification gates must pass');
        break;
    }

    return actions;
  }

  private getFailedGates(state: any): string[] {
    const gates: string[] = [];
    if (state.verification.functional.status !== 'passed') gates.push('functional');
    if (state.verification.intent.status !== 'passed') gates.push('intent');
    if (state.verification.security.status !== 'passed') gates.push('security');
    return gates;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default WorkflowBlocker;
