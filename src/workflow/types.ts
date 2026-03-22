/**
 * 🦈 SHARK CLI - Workflow Enforcement Types
 *
 * Purely mechanical enforcement of the build workflow.
 * NO AI components - this is the check and balance to AI autonomy.
 *
 * DESIGN PRINCIPLE: The CLI is the second brain, but not by calling an AI model.
 * It enforces through code, state machines, and verification gates.
 */

// ============================================================================
// WORKFLOW STEPS
// ============================================================================

/**
 * The 5-step build workflow
 *
 * Step 1: PLAN - Define what to build
 * Step 2: BUILD - Write the code
 * Step 3: TEST - 2-stage testing (Docker → Local)
 * Step 4: VERIFY - Gatekeeper (functional + intent + security)
 * Step 5: SHIP - Push to production
 */
export enum WorkflowStep {
  PLAN = 1,
  BUILD = 2,
  TEST = 3,
  VERIFY = 4,
  SHIP = 5,
}

/**
 * Human-readable step names
 */
export const STEP_NAMES: Record<WorkflowStep, string> = {
  [WorkflowStep.PLAN]: 'Plan',
  [WorkflowStep.BUILD]: 'Build',
  [WorkflowStep.TEST]: 'Test',
  [WorkflowStep.VERIFY]: 'Verify',
  [WorkflowStep.SHIP]: 'Ship',
};

/**
 * Step requirements - what must exist before advancing
 */
export interface StepRequirement {
  /** Files that must exist */
  files: string[];
  /** Commands that must pass (exit code 0) */
  commands: string[];
  /** Custom validation function name */
  validator?: string;
}

/**
 * Step requirements by workflow step
 */
export const STEP_REQUIREMENTS: Record<WorkflowStep, StepRequirement> = {
  [WorkflowStep.PLAN]: {
    files: ['.shark/plan.md', '.shark/claims.json'],
    commands: [],
    validator: 'validatePlan',
  },
  [WorkflowStep.BUILD]: {
    files: [], // Determined by plan
    commands: ['npm run build'],
    validator: 'validateBuild',
  },
  [WorkflowStep.TEST]: {
    files: ['.shark/test-results/stage1.json'],
    commands: ['npm run test:stage1'],
    validator: 'validateTests',
  },
  [WorkflowStep.VERIFY]: {
    files: [
      '.shark/verification/functional.json',
      '.shark/verification/intent.json',
      '.shark/verification/security.json',
    ],
    commands: [],
    validator: 'validateVerification',
  },
  [WorkflowStep.SHIP]: {
    files: [],
    commands: [],
    validator: 'validateShip',
  },
};

// ============================================================================
// VERIFICATION GATES
// ============================================================================

/**
 * The three verification gates for Step 4
 */
export enum VerificationGate {
  FUNCTIONAL = 'functional',  // Does the code work?
  INTENT = 'intent',          // Does it match the plan?
  SECURITY = 'security',      // Is it secure?
}

/**
 * Verification status for each gate
 */
export type VerificationStatus = 'pending' | 'passed' | 'failed' | 'skipped';

/**
 * Verification result for a single gate
 */
export interface GateResult {
  gate: VerificationGate;
  status: VerificationStatus;
  timestamp: Date;
  details: string;
  errors: string[];
  warnings: string[];
}

/**
 * Complete verification state
 */
export interface VerificationState {
  functional: GateResult;
  intent: GateResult;
  security: GateResult;
  allPassed: boolean;
  timestamp: Date;
}

// ============================================================================
// WORKFLOW STATE
// ============================================================================

/**
 * State of the workflow machine
 */
export interface WorkflowState {
  /** Current step */
  currentStep: WorkflowStep;

  /** Completed steps with timestamps */
  completedSteps: Array<{
    step: WorkflowStep;
    completedAt: Date;
    attempts: number;
  }>;

  /** Current verification state */
  verification: VerificationState;

  /** Attempt counter for current loop (Build→Test→Verify) */
  loopAttempts: number;

  /** Total failures that triggered reset to Plan */
  totalResets: number;

  /** Whether the agent is blocked */
  blocked: boolean;

  /** Reason for blocking */
  blockReason?: string;

  /** Original user prompt/task */
  originalPrompt?: string;

  /** Path to plan file */
  planPath?: string;

  /** Working directory */
  workspacePath: string;

  /** Created at */
  createdAt: Date;

  /** Last updated */
  updatedAt: Date;
}

/**
 * Default initial state
 */
export function createInitialState(workspacePath: string): WorkflowState {
  const now = new Date();
  const pendingGate: GateResult = {
    gate: VerificationGate.FUNCTIONAL,
    status: 'pending',
    timestamp: now,
    details: 'Not yet verified',
    errors: [],
    warnings: [],
  };

  return {
    currentStep: WorkflowStep.PLAN,
    completedSteps: [],
    verification: {
      functional: { ...pendingGate, gate: VerificationGate.FUNCTIONAL },
      intent: { ...pendingGate, gate: VerificationGate.INTENT },
      security: { ...pendingGate, gate: VerificationGate.SECURITY },
      allPassed: false,
      timestamp: now,
    },
    loopAttempts: 0,
    totalResets: 0,
    blocked: false,
    workspacePath,
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================================
// BLOCKING
// ============================================================================

/**
 * Block reasons
 */
export enum BlockReason {
  STEP_NOT_COMPLETE = 'step_not_complete',
  VERIFICATION_FAILED = 'verification_failed',
  TESTS_FAILED = 'tests_failed',
  MISSING_PLAN = 'missing_plan',
  MAX_ATTEMPTS_REACHED = 'max_attempts_reached',
  GUARDIAN_DENIED = 'guardian_denied',
  MISSING_CLAIMS = 'missing_claims',
}

/**
 * Block result with details
 */
export interface BlockResult {
  blocked: boolean;
  reason?: BlockReason;
  message: string;
  requiredActions: string[];
  currentStep: WorkflowStep;
  attemptedStep?: WorkflowStep;
}

// ============================================================================
// CLAIMS (Intent Verification)
// ============================================================================

/**
 * A claim made in the plan that must be verified
 */
export interface Claim {
  id: string;
  description: string;
  type: 'feature' | 'behavior' | 'output' | 'constraint';
  testFile: string;  // Test file that verifies this claim
  verified: boolean;
}

/**
 * Claims extracted from the plan
 */
export interface ClaimsDocument {
  version: string;
  extractedAt: Date;
  originalPrompt: string;
  claims: Claim[];
  summary: string;
}

// ============================================================================
// CONTEXT CAPTURE (for 3-failure reset)
// ============================================================================

/**
 * Full context captured when resetting to Plan
 */
export interface FailureContext {
  /** Timestamp of failure */
  timestamp: Date;

  /** Number of attempts before reset */
  attempts: number;

  /** Original prompt */
  originalPrompt: string;

  /** Plan content */
  planContent: string;

  /** Code that was built */
  codeFiles: Array<{
    path: string;
    content: string;
  }>;

  /** Test results */
  testResults: string;

  /** Verification failures */
  verificationFailures: Array<{
    gate: VerificationGate;
    errors: string[];
  }>;

  /** Agent's last actions */
  actionLog: string[];

  /** Reason for reset */
  resetReason: string;
}

// ============================================================================
// EVENTS
// ============================================================================

/**
 * Workflow events that can be emitted
 */
export type WorkflowEvent =
  | { type: 'step_complete'; step: WorkflowStep }
  | { type: 'step_start'; step: WorkflowStep }
  | { type: 'verification_pass'; gate: VerificationGate }
  | { type: 'verification_fail'; gate: VerificationGate; errors: string[] }
  | { type: 'blocked'; reason: BlockReason }
  | { type: 'unblocked' }
  | { type: 'reset_to_plan'; context: FailureContext }
  | { type: 'loop_attempt'; attempt: number }
  | { type: 'workflow_complete' };

/**
 * Event listener
 */
export type WorkflowEventListener = (event: WorkflowEvent) => void;
