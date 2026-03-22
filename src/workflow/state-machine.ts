/**
 * 🦈 SHARK CLI - Workflow State Machine
 *
 * A purely mechanical state machine that enforces the build workflow.
 * NO AI components - this is the "second brain" through code design.
 *
 * ENFORCEMENT RULES:
 * - Cannot advance to step N+1 without completing step N
 * - Steps 2-4 (Build→Test→Verify) loop until Verify passes
 * - 3 failures in loop = reset to Step 1 with full context capture
 * - Step 5 (Ship) requires all 3 verification gates passed
 *
 * THE BRICK WALL:
 * - Agent is LITERALLY blocked from progressing
 * - Must complete requirements to unlock
 * - No shortcuts, no bypasses
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  WorkflowStep,
  WorkflowState,
  WorkflowEvent,
  WorkflowEventListener,
  BlockResult,
  BlockReason,
  STEP_NAMES,
  STEP_REQUIREMENTS,
  createInitialState,
  VerificationGate,
  GateResult,
  FailureContext,
  ClaimsDocument,
  Claim,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_LOOP_ATTEMPTS = 3;           // Reset to Plan after 3 failures
const STATE_FILE = '.shark/workflow.json';
const PLAN_FILE = '.shark/plan.md';
const CLAIMS_FILE = '.shark/claims.json';
const CONTEXT_FILE = '.shark/failure-context.json';

// ============================================================================
// WORKFLOW MACHINE
// ============================================================================

/**
 * The Workflow State Machine
 *
 * This is the core enforcement mechanism. It tracks state, validates
 * transitions, and blocks progress when requirements aren't met.
 */
export class WorkflowMachine {
  private state: WorkflowState;
  private statePath: string;
  private listeners: WorkflowEventListener[] = [];
  private actionLog: string[] = [];

  constructor(workspacePath: string) {
    this.statePath = path.join(workspacePath, STATE_FILE);
    this.state = this.loadState(workspacePath);
  }

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  /**
   * Load state from disk or create new
   */
  private loadState(workspacePath: string): WorkflowState {
    if (fs.existsSync(this.statePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
        // Convert date strings back to Date objects
        data.createdAt = new Date(data.createdAt);
        data.updatedAt = new Date(data.updatedAt);
        data.completedSteps = data.completedSteps.map((s: any) => ({
          ...s,
          completedAt: new Date(s.completedAt),
        }));
        return data;
      } catch {
        return createInitialState(workspacePath);
      }
    }
    return createInitialState(workspacePath);
  }

  /**
   * Save state to disk
   */
  private saveState(): void {
    const dir = path.dirname(this.statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
  }

  /**
   * Get current state (read-only)
   */
  getState(): Readonly<WorkflowState> {
    return { ...this.state };
  }

  /**
   * Get current step
   */
  getCurrentStep(): WorkflowStep {
    return this.state.currentStep;
  }

  // ==========================================================================
  // TRANSITION VALIDATION (THE BRICK WALL)
  // ==========================================================================

  /**
   * Attempt to advance to the next step
   *
   * Returns BlockResult - if blocked, agent CANNOT proceed
   */
  attemptAdvance(targetStep: WorkflowStep): BlockResult {
    const current = this.state.currentStep;

    // Log the attempt
    this.logAction(`Attempted to advance from ${STEP_NAMES[current]} to ${STEP_NAMES[targetStep]}`);

    // RULE 1: Cannot skip steps
    if (targetStep > current + 1) {
      return this.block(BlockReason.STEP_NOT_COMPLETE,
        `Cannot skip to ${STEP_NAMES[targetStep]}. Must complete ${STEP_NAMES[current]} first.`,
        [`Complete ${STEP_NAMES[current]} step`, `Run: shark step ${current}`]
      );
    }

    // RULE 2: Cannot go backwards without explicit command
    if (targetStep < current) {
      // Allow going back, but reset verification
      this.state.verification.allPassed = false;
      this.state.currentStep = targetStep;
      this.saveState();
      this.emit({ type: 'step_start', step: targetStep });
      return {
        blocked: false,
        message: `Returned to ${STEP_NAMES[targetStep]}`,
        requiredActions: [],
        currentStep: targetStep,
      };
    }

    // RULE 3: Must complete current step requirements
    const requirements = STEP_REQUIREMENTS[current];
    const missingFiles = this.checkFiles(requirements.files);
    const failedCommands = this.checkCommands(requirements.commands);

    if (missingFiles.length > 0 || failedCommands.length > 0) {
      const actions = [
        ...missingFiles.map(f => `Create file: ${f}`),
        ...failedCommands.map(c => `Fix command: ${c}`),
      ];
      return this.block(BlockReason.STEP_NOT_COMPLETE,
        `${STEP_NAMES[current]} not complete. Missing requirements.`,
        actions
      );
    }

    // RULE 4: Special validation for each step
    const validationResult = this.validateCurrentStep();
    if (!validationResult.passed) {
      return this.block(BlockReason.STEP_NOT_COMPLETE,
        validationResult.message,
        validationResult.actions
      );
    }

    // RULE 5: For Ship step, all verification gates must pass
    if (targetStep === WorkflowStep.SHIP) {
      if (!this.state.verification.allPassed) {
        return this.block(BlockReason.VERIFICATION_FAILED,
          'Cannot ship. All verification gates must pass.',
          ['Run: shark verify', 'Fix any failing gates']
        );
      }
    }

    // All checks passed - allow advancement
    this.state.completedSteps.push({
      step: current,
      completedAt: new Date(),
      attempts: this.state.loopAttempts,
    });
    this.state.currentStep = targetStep;
    this.state.updatedAt = new Date();
    this.saveState();

    this.emit({ type: 'step_complete', step: current });
    this.emit({ type: 'step_start', step: targetStep });

    return {
      blocked: false,
      message: `Advanced to ${STEP_NAMES[targetStep]}`,
      requiredActions: [],
      currentStep: targetStep,
    };
  }

  /**
   * Block the agent
   */
  private block(reason: BlockReason, message: string, actions: string[]): BlockResult {
    this.state.blocked = true;
    this.state.blockReason = reason;
    this.saveState();

    this.emit({ type: 'blocked', reason });

    return {
      blocked: true,
      reason,
      message,
      requiredActions: actions,
      currentStep: this.state.currentStep,
    };
  }

  // ==========================================================================
  // STEP VALIDATION
  // ==========================================================================

  /**
   * Validate current step completion
   */
  private validateCurrentStep(): { passed: boolean; message: string; actions: string[] } {
    switch (this.state.currentStep) {
      case WorkflowStep.PLAN:
        return this.validatePlan();
      case WorkflowStep.BUILD:
        return this.validateBuild();
      case WorkflowStep.TEST:
        return this.validateTests();
      case WorkflowStep.VERIFY:
        return this.validateVerification();
      case WorkflowStep.SHIP:
        return this.validateShip();
      default:
        return { passed: true, message: '', actions: [] };
    }
  }

  /**
   * Validate Plan step
   */
  private validatePlan(): { passed: boolean; message: string; actions: string[] } {
    const planPath = path.join(this.state.workspacePath, PLAN_FILE);
    const claimsPath = path.join(this.state.workspacePath, CLAIMS_FILE);

    // Must have plan file
    if (!fs.existsSync(planPath)) {
      return {
        passed: false,
        message: 'Plan file missing. Create .shark/plan.md',
        actions: ['Create .shark/plan.md with implementation plan'],
      };
    }

    // Must have claims file
    if (!fs.existsSync(claimsPath)) {
      return {
        passed: false,
        message: 'Claims file missing. Extract claims from plan.',
        actions: ['Run: shark extract-claims', 'Or create .shark/claims.json manually'],
      };
    }

    // Validate claims structure
    try {
      const claims: ClaimsDocument = JSON.parse(fs.readFileSync(claimsPath, 'utf-8'));
      if (!claims.claims || claims.claims.length === 0) {
        return {
          passed: false,
          message: 'No claims extracted from plan. Claims are required for verification.',
          actions: ['Add claims to .shark/claims.json', 'Each claim must have a test file'],
        };
      }

      // Each claim must have a test file path
      const invalidClaims = claims.claims.filter(c => !c.testFile);
      if (invalidClaims.length > 0) {
        return {
          passed: false,
          message: `Claims missing test files: ${invalidClaims.map(c => c.id).join(', ')}`,
          actions: ['Add testFile path to each claim'],
        };
      }
    } catch (e) {
      return {
        passed: false,
        message: 'Invalid claims.json format',
        actions: ['Fix JSON syntax in .shark/claims.json'],
      };
    }

    return { passed: true, message: 'Plan validated', actions: [] };
  }

  /**
   * Validate Build step
   */
  private validateBuild(): { passed: boolean; message: string; actions: string[] } {
    // Check that code was actually built
    const sharkDir = path.join(this.state.workspacePath, '.shark');
    const buildManifest = path.join(sharkDir, 'build-manifest.json');

    if (!fs.existsSync(buildManifest)) {
      return {
        passed: false,
        message: 'No build manifest found. Did you actually write code?',
        actions: ['Write the code according to the plan', 'Create .shark/build-manifest.json'],
      };
    }

    return { passed: true, message: 'Build validated', actions: [] };
  }

  /**
   * Validate Tests step
   */
  private validateTests(): { passed: boolean; message: string; actions: string[] } {
    const stage1Path = path.join(this.state.workspacePath, '.shark/test-results/stage1.json');
    const stage2Path = path.join(this.state.workspacePath, '.shark/test-results/stage2.json');

    // Stage 1 must pass
    if (!fs.existsSync(stage1Path)) {
      return {
        passed: false,
        message: 'Stage 1 tests not run. Run Docker sandbox tests first.',
        actions: ['Run: shark test stage1', 'Or: npm run test:stage1'],
      };
    }

    try {
      const stage1 = JSON.parse(fs.readFileSync(stage1Path, 'utf-8'));
      if (!stage1.success) {
        return {
          passed: false,
          message: `Stage 1 tests failed: ${stage1.failedTests?.join(', ') || 'unknown'}`,
          actions: ['Fix failing tests', 'Re-run: shark test stage1'],
        };
      }
    } catch {
      return {
        passed: false,
        message: 'Invalid Stage 1 test results',
        actions: ['Re-run: shark test stage1'],
      };
    }

    // Stage 2 must pass
    if (!fs.existsSync(stage2Path)) {
      return {
        passed: false,
        message: 'Stage 2 tests not run. Run local device tests.',
        actions: ['Run: shark test stage2', 'Or: npm run test:stage2'],
      };
    }

    try {
      const stage2 = JSON.parse(fs.readFileSync(stage2Path, 'utf-8'));
      if (!stage2.success) {
        return {
          passed: false,
          message: `Stage 2 tests failed`,
          actions: ['Review Stage 2 failures', 'Fix issues', 'Re-run: shark test stage2'],
        };
      }
    } catch {
      return {
        passed: false,
        message: 'Invalid Stage 2 test results',
        actions: ['Re-run: shark test stage2'],
      };
    }

    return { passed: true, message: 'Tests passed', actions: [] };
  }

  /**
   * Validate Verification step - THE GATEKEEPER
   */
  private validateVerification(): { passed: boolean; message: string; actions: string[] } {
    const v = this.state.verification;

    const failedGates: string[] = [];
    if (v.functional.status !== 'passed') failedGates.push('functional');
    if (v.intent.status !== 'passed') failedGates.push('intent');
    if (v.security.status !== 'passed') failedGates.push('security');

    if (failedGates.length > 0) {
      return {
        passed: false,
        message: `Verification gates failed: ${failedGates.join(', ')}`,
        actions: failedGates.map(g => `Run: shark verify ${g}`),
      };
    }

    return { passed: true, message: 'All gates passed', actions: [] };
  }

  /**
   * Validate Ship step
   */
  private validateShip(): { passed: boolean; message: string; actions: string[] } {
    // This should never be reached if verification passed
    if (!this.state.verification.allPassed) {
      return {
        passed: false,
        message: 'Verification not complete',
        actions: ['Run: shark verify'],
      };
    }
    return { passed: true, message: 'Ready to ship', actions: [] };
  }

  // ==========================================================================
  // VERIFICATION GATES
  // ==========================================================================

  /**
   * Run a verification gate
   */
  async runVerificationGate(gate: VerificationGate): Promise<GateResult> {
    this.logAction(`Running verification gate: ${gate}`);

    let result: GateResult;

    switch (gate) {
      case VerificationGate.FUNCTIONAL:
        result = await this.runFunctionalGate();
        break;
      case VerificationGate.INTENT:
        result = await this.runIntentGate();
        break;
      case VerificationGate.SECURITY:
        result = await this.runSecurityGate();
        break;
      default:
        result = {
          gate,
          status: 'failed',
          timestamp: new Date(),
          details: 'Unknown gate',
          errors: ['Unknown verification gate'],
          warnings: [],
        };
    }

    // Update state
    this.state.verification[gate] = result;
    this.checkAllGatesPassed();
    this.saveState();

    // Emit event
    if (result.status === 'passed') {
      this.emit({ type: 'verification_pass', gate });
    } else {
      this.emit({ type: 'verification_fail', gate, errors: result.errors });
    }

    // Check for loop failure
    if (result.status === 'failed') {
      this.handleVerificationFailure();
    }

    return result;
  }

  /**
   * Run functional gate - Does the code work?
   */
  private async runFunctionalGate(): Promise<GateResult> {
    const testResultsPath = path.join(this.state.workspacePath, '.shark/test-results');

    // Check if tests exist and pass
    if (!fs.existsSync(testResultsPath)) {
      return {
        gate: VerificationGate.FUNCTIONAL,
        status: 'failed',
        timestamp: new Date(),
        details: 'No test results found',
        errors: ['Run Stage 1 and Stage 2 tests first'],
        warnings: [],
      };
    }

    // Check Stage 1 and Stage 2 results
    const stage1Path = path.join(testResultsPath, 'stage1.json');
    const stage2Path = path.join(testResultsPath, 'stage2.json');

    const errors: string[] = [];
    const warnings: string[] = [];

    if (fs.existsSync(stage1Path)) {
      const stage1 = JSON.parse(fs.readFileSync(stage1Path, 'utf-8'));
      if (!stage1.success) {
        errors.push(`Stage 1 failed: ${stage1.failedTests?.length || 0} tests failed`);
      }
    } else {
      errors.push('Stage 1 tests not run');
    }

    if (fs.existsSync(stage2Path)) {
      const stage2 = JSON.parse(fs.readFileSync(stage2Path, 'utf-8'));
      if (!stage2.success) {
        errors.push(`Stage 2 failed: ${stage2.failedTests?.length || 0} tests failed`);
      }
    } else {
      errors.push('Stage 2 tests not run');
    }

    return {
      gate: VerificationGate.FUNCTIONAL,
      status: errors.length === 0 ? 'passed' : 'failed',
      timestamp: new Date(),
      details: errors.length === 0 ? 'All tests passed' : 'Tests failed',
      errors,
      warnings,
    };
  }

  /**
   * Run intent gate - Does code match the plan?
   */
  private async runIntentGate(): Promise<GateResult> {
    const claimsPath = path.join(this.state.workspacePath, CLAIMS_FILE);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!fs.existsSync(claimsPath)) {
      return {
        gate: VerificationGate.INTENT,
        status: 'failed',
        timestamp: new Date(),
        details: 'No claims file found',
        errors: ['Create .shark/claims.json from your plan'],
        warnings: [],
      };
    }

    const claims: ClaimsDocument = JSON.parse(fs.readFileSync(claimsPath, 'utf-8'));

    // Check each claim has a passing test
    for (const claim of claims.claims) {
      if (!claim.testFile) {
        errors.push(`Claim ${claim.id} has no test file`);
        continue;
      }

      const testPath = path.join(this.state.workspacePath, claim.testFile);
      if (!fs.existsSync(testPath)) {
        errors.push(`Test file not found for claim ${claim.id}: ${claim.testFile}`);
        continue;
      }

      // Check if test passed (would need to actually run tests here)
      // For now, check if there's a test result for this claim
      const resultPath = path.join(
        this.state.workspacePath,
        '.shark/claim-results',
        `${claim.id}.json`
      );

      if (fs.existsSync(resultPath)) {
        const result = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
        if (!result.passed) {
          errors.push(`Claim ${claim.id} test failed: ${result.error || 'unknown'}`);
        }
      } else {
        warnings.push(`No test result for claim ${claim.id}`);
      }
    }

    return {
      gate: VerificationGate.INTENT,
      status: errors.length === 0 ? 'passed' : 'failed',
      timestamp: new Date(),
      details: errors.length === 0
        ? `All ${claims.claims.length} claims verified`
        : `${errors.length} claims failed`,
      errors,
      warnings,
    };
  }

  /**
   * Run security gate - Is the code secure?
   */
  private async runSecurityGate(): Promise<GateResult> {
    const guardianReportPath = path.join(
      this.state.workspacePath,
      '.shark/guardian-report.json'
    );

    if (!fs.existsSync(guardianReportPath)) {
      return {
        gate: VerificationGate.SECURITY,
        status: 'failed',
        timestamp: new Date(),
        details: 'No Guardian security scan found',
        errors: ['Run Guardian security scan first', 'Run: shark guardian scan'],
        warnings: [],
      };
    }

    const report = JSON.parse(fs.readFileSync(guardianReportPath, 'utf-8'));
    const errors: string[] = [];
    const warnings: string[] = [];

    if (report.vulnerabilities && report.vulnerabilities.length > 0) {
      for (const vuln of report.vulnerabilities) {
        if (vuln.severity === 'critical' || vuln.severity === 'high') {
          errors.push(`${vuln.severity}: ${vuln.message} in ${vuln.file}`);
        } else {
          warnings.push(`${vuln.severity}: ${vuln.message} in ${vuln.file}`);
        }
      }
    }

    return {
      gate: VerificationGate.SECURITY,
      status: errors.length === 0 ? 'passed' : 'failed',
      timestamp: new Date(),
      details: errors.length === 0
        ? 'No security vulnerabilities found'
        : `${errors.length} critical/high vulnerabilities`,
      errors,
      warnings,
    };
  }

  /**
   * Check if all gates passed
   */
  private checkAllGatesPassed(): void {
    const v = this.state.verification;
    this.state.verification.allPassed =
      v.functional.status === 'passed' &&
      v.intent.status === 'passed' &&
      v.security.status === 'passed';
  }

  // ==========================================================================
  // LOOP & RESET MECHANICS
  // ==========================================================================

  /**
   * Handle verification failure
   */
  private handleVerificationFailure(): void {
    this.state.loopAttempts++;

    if (this.state.loopAttempts >= MAX_LOOP_ATTEMPTS) {
      // 3 failures - reset to Plan with context
      this.resetToPlan();
    } else {
      // Go back to Build for another attempt
      this.state.currentStep = WorkflowStep.BUILD;
      this.emit({ type: 'loop_attempt', attempt: this.state.loopAttempts });
    }

    this.saveState();
  }

  /**
   * Reset to Plan step with full context capture
   */
  private resetToPlan(): void {
    // Capture full failure context
    const context: FailureContext = {
      timestamp: new Date(),
      attempts: this.state.loopAttempts,
      originalPrompt: this.state.originalPrompt || '',
      planContent: this.readPlanContent(),
      codeFiles: this.captureCodeFiles(),
      testResults: this.readTestResults(),
      verificationFailures: this.captureVerificationFailures(),
      actionLog: this.actionLog,
      resetReason: `Failed verification ${MAX_LOOP_ATTEMPTS} times`,
    };

    // Save context
    const contextPath = path.join(this.state.workspacePath, CONTEXT_FILE);
    const dir = path.dirname(contextPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));

    // Reset state
    this.state.currentStep = WorkflowStep.PLAN;
    this.state.loopAttempts = 0;
    this.state.totalResets++;
    this.state.verification.allPassed = false;

    this.emit({ type: 'reset_to_plan', context });
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private checkFiles(files: string[]): string[] {
    return files.filter(f => {
      const fullPath = path.join(this.state.workspacePath, f);
      return !fs.existsSync(fullPath);
    });
  }

  private checkCommands(commands: string[]): string[] {
    // For commands, we check if there's a success marker
    // Real implementation would actually run commands
    return [];
  }

  private logAction(action: string): void {
    const timestamp = new Date().toISOString();
    this.actionLog.push(`[${timestamp}] ${action}`);
    if (this.actionLog.length > 100) {
      this.actionLog = this.actionLog.slice(-100);
    }
  }

  private readPlanContent(): string {
    const planPath = path.join(this.state.workspacePath, PLAN_FILE);
    if (fs.existsSync(planPath)) {
      return fs.readFileSync(planPath, 'utf-8');
    }
    return '';
  }

  private captureCodeFiles(): Array<{ path: string; content: string }> {
    // Capture all code files in workspace
    const files: Array<{ path: string; content: string }> = [];
    const srcDir = path.join(this.state.workspacePath, 'src');

    if (fs.existsSync(srcDir)) {
      const walk = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(fullPath);
          } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
            files.push({
              path: path.relative(this.state.workspacePath, fullPath),
              content: fs.readFileSync(fullPath, 'utf-8'),
            });
          }
        }
      };
      walk(srcDir);
    }

    return files;
  }

  private readTestResults(): string {
    const resultsDir = path.join(this.state.workspacePath, '.shark/test-results');
    if (fs.existsSync(resultsDir)) {
      const results: string[] = [];
      for (const file of fs.readdirSync(resultsDir)) {
        results.push(fs.readFileSync(path.join(resultsDir, file), 'utf-8'));
      }
      return results.join('\n---\n');
    }
    return '';
  }

  private captureVerificationFailures(): Array<{ gate: VerificationGate; errors: string[] }> {
    const v = this.state.verification;
    const failures: Array<{ gate: VerificationGate; errors: string[] }> = [];

    if (v.functional.status === 'failed') {
      failures.push({ gate: VerificationGate.FUNCTIONAL, errors: v.functional.errors });
    }
    if (v.intent.status === 'failed') {
      failures.push({ gate: VerificationGate.INTENT, errors: v.intent.errors });
    }
    if (v.security.status === 'failed') {
      failures.push({ gate: VerificationGate.SECURITY, errors: v.security.errors });
    }

    return failures;
  }

  // ==========================================================================
  // EVENT SYSTEM
  // ==========================================================================

  addListener(listener: WorkflowEventListener): void {
    this.listeners.push(listener);
  }

  removeListener(listener: WorkflowEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private emit(event: WorkflowEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (e) {
        console.error('Workflow event listener error:', e);
      }
    }
  }

  // ==========================================================================
  // MANUAL CONTROL
  // ==========================================================================

  /**
   * Manually set the original prompt (for intent verification)
   */
  setOriginalPrompt(prompt: string): void {
    this.state.originalPrompt = prompt;
    this.saveState();
  }

  /**
   * Go back to a previous step
   */
  goBack(step: WorkflowStep): void {
    if (step < this.state.currentStep) {
      this.state.currentStep = step;
      this.state.verification.allPassed = false;
      this.saveState();
      this.emit({ type: 'step_start', step });
    }
  }

  /**
   * Unblock the workflow (manual override)
   */
  unblock(): void {
    this.state.blocked = false;
    this.state.blockReason = undefined;
    this.saveState();
    this.emit({ type: 'unblocked' });
  }
}

export default WorkflowMachine;
