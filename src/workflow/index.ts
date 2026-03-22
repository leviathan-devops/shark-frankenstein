/**
 * 🦈 SHARK CLI - Workflow Enforcement System
 *
 * This is the core "second brain" of Shark CLI. It enforces the build
 * workflow mechanically - no AI involved.
 *
 * THE WORKFLOW:
 *
 *   Step 1: PLAN     → Define what to build, extract claims
 *   Step 2: BUILD    → Write code according to plan
 *   Step 3: TEST     → 2-stage testing (Docker → Local)
 *   Step 4: VERIFY   → Three gates: Functional, Intent, Security
 *   Step 5: SHIP     → Push to production
 *
 * THE LOOP:
 *   Steps 2-4 repeat until VERIFY passes.
 *   After 3 failures, reset to Step 1 with full context capture.
 *
 * THE BRICK WALL:
 *   Agent CANNOT progress without completing requirements.
 *   Git push is BLOCKED until workflow is complete.
 *
 * USAGE:
 *
 *   import { Workflow } from './workflow';
 *
 *   const workflow = new Workspace('./my-project');
 *
 *   // Check current step
 *   const step = workflow.getCurrentStep();
 *
 *   // Try to advance
 *   const result = workflow.advance();
 *   if (result.blocked) {
 *     console.log(result.message);
 *     // Agent must complete requirements
 *   }
 *
 *   // Run verification
 *   const gate = await workflow.verify('intent');
 *   if (gate.status === 'failed') {
 *     // Fix issues
 *   }
 */

export * from './types';
export * from './state-machine';
export * from './blocker';

import { WorkflowMachine } from './state-machine';
import { WorkflowBlocker } from './blocker';
import { WorkflowStep, WorkflowState, VerificationGate, BlockResult } from './types';

// ============================================================================
// WORKFLOW FACADE
// ============================================================================

/**
 * Workflow - Main interface for the workflow enforcement system
 *
 * This provides a simplified API for the complex machinery underneath.
 */
export class Workflow {
  private machine: WorkflowMachine;
  private blocker: WorkflowBlocker;
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.machine = new WorkflowMachine(workspacePath);
    this.blocker = new WorkflowBlocker(workspacePath);
  }

  // ==========================================================================
  // STATUS & INFO
  // ==========================================================================

  /**
   * Get current workflow step
   */
  getCurrentStep(): WorkflowStep {
    return this.machine.getCurrentStep();
  }

  /**
   * Get full workflow state
   */
  getState(): Readonly<WorkflowState> {
    return this.machine.getState();
  }

  /**
   * Check if agent is blocked
   */
  isBlocked(): boolean {
    return this.machine.getState().blocked;
  }

  /**
   * Get a human-readable status report
   */
  getStatusReport(): string {
    const state = this.machine.getState();
    const stepName = ['Plan', 'Build', 'Test', 'Verify', 'Ship'][state.currentStep - 1];
    const verification = state.verification;

    const lines = [
      '╔═══════════════════════════════════════════════════════════════╗',
      '║  🦈 SHARK WORKFLOW STATUS                                     ║',
      '╠═══════════════════════════════════════════════════════════════╣',
      `║  Current Step: ${stepName.padEnd(46)}║`,
      `║  Loop Attempts: ${String(state.loopAttempts).padEnd(45)}║`,
      `║  Total Resets: ${String(state.totalResets).padEnd(46)}║`,
      '╠═══════════════════════════════════════════════════════════════╣',
      '║  VERIFICATION GATES                                           ║',
      `║    Functional: ${verification.functional.status.padEnd(46)}║`,
      `║    Intent:     ${verification.intent.status.padEnd(46)}║`,
      `║    Security:   ${verification.security.status.padEnd(46)}║`,
      '╠═══════════════════════════════════════════════════════════════╣',
    ];

    if (state.blocked) {
      lines.push(`║  Status: BLOCKED                                              ║`);
      lines.push(`║  Reason: ${String(state.blockReason || 'unknown').substring(0, 53).padEnd(53)}║`);
    } else {
      lines.push(`║  Status: ACTIVE                                               ║`);
    }

    lines.push('╚═══════════════════════════════════════════════════════════════╝');

    return lines.join('\n');
  }

  // ==========================================================================
  // WORKFLOW CONTROL
  // ==========================================================================

  /**
   * Start a new workflow
   */
  start(prompt: string): { success: boolean; message: string } {
    this.machine.setOriginalPrompt(prompt);
    return {
      success: true,
      message: `Workflow started. Current step: ${this.getCurrentStepName()}`,
    };
  }

  /**
   * Attempt to advance to the next step
   *
   * Returns block result if requirements not met
   */
  advance(): BlockResult {
    const current = this.getCurrentStep();
    const next = current + 1;
    return this.machine.attemptAdvance(next as WorkflowStep);
  }

  /**
   * Go back to a previous step
   */
  goBack(step: WorkflowStep): void {
    this.machine.goBack(step);
  }

  /**
   * Run a verification gate
   */
  async verify(gate: 'functional' | 'intent' | 'security'): Promise<{
    status: 'passed' | 'failed';
    errors: string[];
    warnings: string[];
  }> {
    const gateMap: Record<string, VerificationGate> = {
      functional: VerificationGate.FUNCTIONAL,
      intent: VerificationGate.INTENT,
      security: VerificationGate.SECURITY,
    };

    const result = await this.machine.runVerificationGate(gateMap[gate]);

    return {
      status: result.status === 'passed' ? 'passed' : 'failed',
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  /**
   * Run all verification gates
   */
  async verifyAll(): Promise<{
    allPassed: boolean;
    results: Record<string, { status: string; errors: string[] }>;
  }> {
    const [functional, intent, security] = await Promise.all([
      this.verify('functional'),
      this.verify('intent'),
      this.verify('security'),
    ]);

    return {
      allPassed:
        functional.status === 'passed' &&
        intent.status === 'passed' &&
        security.status === 'passed',
      results: {
        functional: { status: functional.status, errors: functional.errors },
        intent: { status: intent.status, errors: intent.errors },
        security: { status: security.status, errors: security.errors },
      },
    };
  }

  // ==========================================================================
  // BLOCKING
  // ==========================================================================

  /**
   * Check if an operation is allowed
   */
  checkOperation(operation: 'push' | 'build' | 'test' | 'verify' | 'ship'): {
    allowed: boolean;
    reason?: string;
    requiredActions: string[];
  } {
    const result = this.blocker.checkOperation(operation);
    return {
      allowed: result.allowed,
      reason: result.reason,
      requiredActions: result.requiredActions,
    };
  }

  /**
   * Block a git push (used by pre-push hook)
   */
  blockPush(): { blocked: boolean; message: string; actions: string[] } {
    return this.blocker.blockPush();
  }

  /**
   * Install git hooks
   */
  installHooks(): boolean {
    return this.blocker.installGitHook();
  }

  /**
   * Uninstall git hooks
   */
  uninstallHooks(): boolean {
    return this.blocker.uninstallGitHook();
  }

  /**
   * Unblock manually (emergency override)
   */
  unblock(): void {
    this.machine.unblock();
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private getCurrentStepName(): string {
    const step = this.getCurrentStep();
    return ['Plan', 'Build', 'Test', 'Verify', 'Ship'][step - 1];
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Create a workflow for a workspace
 */
export function createWorkflow(workspacePath: string): Workflow {
  return new Workflow(workspacePath);
}

/**
 * Quick check if a push is allowed
 */
export function canPush(workspacePath: string): boolean {
  const blocker = new WorkflowBlocker(workspacePath);
  const result = blocker.blockPush();
  return !result.blocked;
}

export default Workflow;
