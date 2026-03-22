/**
 * 🦈 SHARK CLI - Testing Types
 * 
 * Type definitions for the 2-stage testing system.
 */

// ============================================================================
// TEST STAGES
// ============================================================================

export enum TestStage {
  /** Stage 1: Docker sandbox - automated CI testing */
  DOCKER_SANDBOX = 'docker_sandbox',
  /** Stage 2: Local device - real user testing with Guardian protection */
  LOCAL_DEVICE = 'local_device',
}

export enum TestStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  BLOCKED = 'blocked', // Blocked by Guardian
}

export enum TestPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// ============================================================================
// TEST DEFINITIONS
// ============================================================================

export interface TestCase {
  id: string;
  name: string;
  description: string;
  stage: TestStage;
  priority: TestPriority;
  timeout: number; // ms
  retries: number;
  dependencies: string[]; // Test IDs that must pass first
  tags: string[];
  guardianRequired: boolean; // Requires Guardian protection
}

export interface TestResult {
  testId: string;
  status: TestStatus;
  duration: number; // ms
  startTime: Date;
  endTime: Date;
  error?: TestError;
  guardianDecisions?: GuardianDecision[];
  output?: string;
  artifacts?: string[]; // File paths to artifacts
}

export interface TestError {
  message: string;
  stack?: string;
  code?: string;
  recoverable: boolean;
}

export interface GuardianDecision {
  path: string;
  operation: 'read' | 'write' | 'delete' | 'execute';
  decision: 'allow' | 'deny' | 'sandbox_redirect' | 'backup_then_allow';
  reason: string;
  timestamp: Date;
}

// ============================================================================
// TEST SUITE
// ============================================================================

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  version: string;
  tests: TestCase[];
  setup?: TestHook;
  teardown?: TestHook;
  beforeAll?: TestHook;
  afterAll?: TestHook;
}

export interface TestHook {
  name: string;
  action: () => Promise<void>;
  timeout: number;
}

export interface TestSuiteResult {
  suiteId: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  blocked: number;
  duration: number;
  startTime: Date;
  endTime: Date;
  results: TestResult[];
  guardianReport?: string;
}

// ============================================================================
// TEST RUNNER CONFIG
// ============================================================================

export interface TestRunnerConfig {
  /** Stage to run tests for */
  stage: TestStage;
  /** Enable Guardian protection */
  guardianEnabled: boolean;
  /** Guardian protection level */
  guardianLevel: 'strict' | 'balanced' | 'permissive' | 'sandbox';
  /** Workspace path for tests */
  workspacePath: string;
  /** Sandbox path for isolated testing */
  sandboxPath?: string;
  /** Parallel test execution */
  parallel: boolean;
  /** Max parallel tests */
  maxParallel: number;
  /** Fail fast on first failure */
  failFast: boolean;
  /** Generate detailed report */
  detailedReport: boolean;
  /** Output path for reports */
  reportPath?: string;
  /** Verbose logging */
  verbose: boolean;
  /** Dry run - don't execute, just plan */
  dryRun: boolean;
  /** Timeout for entire test run */
  globalTimeout: number;
}

// ============================================================================
// TEST REGISTRY
// ============================================================================

export interface TestRegistry {
  suites: Map<string, TestSuite>;
  results: Map<string, TestResult>;
  currentStage: TestStage;
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

export type TestLifecycleHook = 
  | 'beforeAll'
  | 'afterAll'
  | 'beforeEach'
  | 'afterEach'
  | 'onPass'
  | 'onFail'
  | 'onBlock';

export interface LifecycleCallback {
  hook: TestLifecycleHook;
  callback: (result: TestResult) => Promise<void>;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface TestReport {
  generated: Date;
  stage: TestStage;
  summary: TestReportSummary;
  results: TestResult[];
  guardianSummary: GuardianReportSummary;
  recommendations: string[];
}

export interface TestReportSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  blocked: number;
  passRate: number;
  duration: number;
}

export interface GuardianReportSummary {
  enabled: boolean;
  totalDecisions: number;
  allowed: number;
  denied: number;
  sandboxRedirects: number;
  backupsCreated: number;
  protectedFiles: string[];
}

// ============================================================================
// DOCKER SPECIFIC
// ============================================================================

export interface DockerTestConfig {
  image: string;
  containerName: string;
  volumes: Record<string, string>;
  environment: Record<string, string>;
  network: string;
  resourceLimits: {
    memory: string;
    cpu: string;
  };
  timeout: number;
}

// ============================================================================
// LOCAL DEVICE SPECIFIC
// ============================================================================

export interface LocalTestConfig {
  /** Protected directories - agent CANNOT modify */
  protectedDirectories: string[];
  /** Allowed directories - agent CAN modify */
  allowedDirectories: string[];
  /** Files to backup before testing */
  backupFiles: string[];
  /** Restore files after testing */
  restoreAfterTest: boolean;
  /** Kill processes spawned by tests */
  cleanupProcesses: boolean;
  /** Maximum disk space tests can use */
  maxDiskUsage: string;
  /** Network access for tests */
  allowNetwork: boolean;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  TestStage,
  TestStatus,
  TestPriority,
};
