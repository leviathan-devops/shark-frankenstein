/**
 * 🦈 SHARK CLI - Test Suites
 * 
 * Pre-defined test suites for Shark Agent OS.
 */

import { TestCase, TestSuite, TestStage, TestPriority } from './types';

// ============================================================================
// MICRO ENGINEER TEST SUITE
// ============================================================================

export const MICRO_ENGINEER_SUITE: TestSuite = {
  id: 'micro-engineer',
  name: 'Micro Engineer Tests',
  description: 'Tests for DeepSeek R1 + Gemma 3 4B Micro Engineer mode',
  version: '1.0.0',
  tests: [
    {
      id: 'micro-init',
      name: 'Micro Mode Initialization',
      description: 'Verify Micro Engineer initializes correctly',
      stage: TestStage.DOCKER_SANDBOX,
      priority: TestPriority.CRITICAL,
      timeout: 30000,
      retries: 2,
      dependencies: [],
      tags: ['init', 'smoke'],
      guardianRequired: false,
    },
    {
      id: 'micro-plan',
      name: 'DeepSeek R1 Planning',
      description: 'Test planning phase with DeepSeek R1',
      stage: TestStage.DOCKER_SANDBOX,
      priority: TestPriority.HIGH,
      timeout: 60000,
      retries: 1,
      dependencies: ['micro-init'],
      tags: ['planning', 'deepseek'],
      guardianRequired: false,
    },
    {
      id: 'micro-execute',
      name: 'Gemma 3 4B Execution',
      description: 'Test execution phase with Gemma 3 4B (FREE)',
      stage: TestStage.DOCKER_SANDBOX,
      priority: TestPriority.HIGH,
      timeout: 45000,
      retries: 2,
      dependencies: ['micro-plan'],
      tags: ['execution', 'gemma', 'free'],
      guardianRequired: false,
    },
    {
      id: 'micro-file-ops',
      name: 'File Operations',
      description: 'Test file read/write operations within workspace',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.HIGH,
      timeout: 30000,
      retries: 1,
      dependencies: [],
      tags: ['filesystem', 'workspace'],
      guardianRequired: true,
    },
    {
      id: 'micro-refactor',
      name: 'Multi-file Refactoring',
      description: 'Test multi-file code refactoring capability',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.MEDIUM,
      timeout: 60000,
      retries: 1,
      dependencies: ['micro-file-ops'],
      tags: ['refactoring', 'multi-file'],
      guardianRequired: true,
    },
    {
      id: 'micro-bugfix',
      name: 'Bug Fix Workflow',
      description: 'Test bug identification and fix workflow',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.MEDIUM,
      timeout: 90000,
      retries: 1,
      dependencies: [],
      tags: ['bugfix', 'reasoning'],
      guardianRequired: true,
    },
  ],
};

// ============================================================================
// MACRO ENGINEER TEST SUITE
// ============================================================================

export const MACRO_ENGINEER_SUITE: TestSuite = {
  id: 'macro-engineer',
  name: 'Macro Engineer Tests',
  description: 'Tests for GLM 4.5 + DeepSeek R1 Macro Engineer mode',
  version: '1.0.0',
  tests: [
    {
      id: 'macro-init',
      name: 'Macro Mode Initialization',
      description: 'Verify Macro Engineer initializes correctly',
      stage: TestStage.DOCKER_SANDBOX,
      priority: TestPriority.CRITICAL,
      timeout: 30000,
      retries: 2,
      dependencies: [],
      tags: ['init', 'smoke'],
      guardianRequired: false,
    },
    {
      id: 'macro-glm',
      name: 'GLM 4.5 Flash Execution',
      description: 'Test primary execution with GLM 4.5-flash',
      stage: TestStage.DOCKER_SANDBOX,
      priority: TestPriority.HIGH,
      timeout: 120000, // GLM can take longer
      retries: 1,
      dependencies: ['macro-init'],
      tags: ['execution', 'glm'],
      guardianRequired: false,
    },
    {
      id: 'macro-advisory',
      name: 'DeepSeek Advisory',
      description: 'Test DeepSeek R1 advisory role',
      stage: TestStage.DOCKER_SANDBOX,
      priority: TestPriority.HIGH,
      timeout: 60000,
      retries: 1,
      dependencies: ['macro-glm'],
      tags: ['advisory', 'deepseek'],
      guardianRequired: false,
    },
    {
      id: 'macro-architecture',
      name: 'Architecture Design',
      description: 'Test system architecture design capability',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.HIGH,
      timeout: 180000,
      retries: 1,
      dependencies: [],
      tags: ['architecture', 'design'],
      guardianRequired: true,
    },
    {
      id: 'macro-devops',
      name: 'DevOps Pipeline',
      description: 'Test CI/CD pipeline creation',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.MEDIUM,
      timeout: 120000,
      retries: 1,
      dependencies: [],
      tags: ['devops', 'cicd'],
      guardianRequired: true,
    },
    {
      id: 'macro-autonomous',
      name: 'Autonomous Multi-step',
      description: 'Test autonomous multi-step execution',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.HIGH,
      timeout: 300000,
      retries: 0,
      dependencies: ['macro-architecture'],
      tags: ['autonomous', 'multi-step'],
      guardianRequired: true,
    },
  ],
};

// ============================================================================
// GUARDIAN PROTECTION TEST SUITE
// ============================================================================

export const GUARDIAN_SUITE: TestSuite = {
  id: 'guardian-protection',
  name: 'Guardian Protection Tests',
  description: 'Verify Guardian protects the local device during Stage 2 testing',
  version: '1.0.0',
  tests: [
    {
      id: 'guardian-init',
      name: 'Guardian Initialization',
      description: 'Verify Guardian initializes with correct protection level',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.CRITICAL,
      timeout: 10000,
      retries: 0,
      dependencies: [],
      tags: ['guardian', 'init'],
      guardianRequired: true,
    },
    {
      id: 'guardian-system-block',
      name: 'System File Protection',
      description: 'Verify Guardian blocks modifications to system files',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.CRITICAL,
      timeout: 15000,
      retries: 0,
      dependencies: ['guardian-init'],
      tags: ['guardian', 'system', 'block'],
      guardianRequired: true,
    },
    {
      id: 'guardian-personal-block',
      name: 'Personal File Protection',
      description: 'Verify Guardian blocks modifications to personal files',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.HIGH,
      timeout: 15000,
      retries: 0,
      dependencies: ['guardian-init'],
      tags: ['guardian', 'personal', 'block'],
      guardianRequired: true,
    },
    {
      id: 'guardian-workspace-allow',
      name: 'Workspace Access',
      description: 'Verify Guardian allows modifications within workspace',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.HIGH,
      timeout: 15000,
      retries: 0,
      dependencies: ['guardian-init'],
      tags: ['guardian', 'workspace', 'allow'],
      guardianRequired: true,
    },
    {
      id: 'guardian-sandbox-mode',
      name: 'Sandbox Mode',
      description: 'Verify sandbox mode redirects all writes',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.MEDIUM,
      timeout: 20000,
      retries: 0,
      dependencies: ['guardian-init'],
      tags: ['guardian', 'sandbox'],
      guardianRequired: true,
    },
    {
      id: 'guardian-audit-log',
      name: 'Audit Logging',
      description: 'Verify Guardian logs all file operations',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.MEDIUM,
      timeout: 15000,
      retries: 0,
      dependencies: ['guardian-init'],
      tags: ['guardian', 'audit', 'logging'],
      guardianRequired: true,
    },
    {
      id: 'guardian-backup',
      name: 'Auto Backup',
      description: 'Verify Guardian creates backups before modifications',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.LOW,
      timeout: 20000,
      retries: 0,
      dependencies: ['guardian-init'],
      tags: ['guardian', 'backup'],
      guardianRequired: true,
    },
  ],
};

// ============================================================================
// DUAL-BRAIN TEST SUITE
// ============================================================================

export const DUAL_BRAIN_SUITE: TestSuite = {
  id: 'dual-brain',
  name: 'Dual-Brain Architecture Tests',
  description: 'Test the dual-brain coordinator and mode switching',
  version: '1.0.0',
  tests: [
    {
      id: 'dual-init',
      name: 'Dual-Brain Initialization',
      description: 'Verify dual-brain coordinator initializes',
      stage: TestStage.DOCKER_SANDBOX,
      priority: TestPriority.CRITICAL,
      timeout: 30000,
      retries: 2,
      dependencies: [],
      tags: ['init', 'coordinator'],
      guardianRequired: false,
    },
    {
      id: 'dual-mode-switch',
      name: 'Mode Switching',
      description: 'Test switching between Micro and Macro modes',
      stage: TestStage.DOCKER_SANDBOX,
      priority: TestPriority.HIGH,
      timeout: 45000,
      retries: 1,
      dependencies: ['dual-init'],
      tags: ['mode', 'switch'],
      guardianRequired: false,
    },
    {
      id: 'dual-fallback',
      name: 'Model Fallback',
      description: 'Test fallback when primary model fails',
      stage: TestStage.DOCKER_SANDBOX,
      priority: TestPriority.HIGH,
      timeout: 60000,
      retries: 0,
      dependencies: ['dual-init'],
      tags: ['fallback', 'resilience'],
      guardianRequired: false,
    },
    {
      id: 'dual-coordination',
      name: 'Model Coordination',
      description: 'Test coordination between planning and execution models',
      stage: TestStage.LOCAL_DEVICE,
      priority: TestPriority.HIGH,
      timeout: 90000,
      retries: 1,
      dependencies: [],
      tags: ['coordination', 'multi-model'],
      guardianRequired: true,
    },
  ],
};

// ============================================================================
// ALL SUITES COMBINED
// ============================================================================

export const ALL_SUITES: TestSuite[] = [
  MICRO_ENGINEER_SUITE,
  MACRO_ENGINEER_SUITE,
  GUARDIAN_SUITE,
  DUAL_BRAIN_SUITE,
];

// ============================================================================
// SUITE SELECTORS
// ============================================================================

/**
 * Get test suites for Stage 1 (Docker)
 */
export function getDockerSuites(): TestSuite[] {
  return ALL_SUITES.map(suite => ({
    ...suite,
    tests: suite.tests.filter(t => t.stage === TestStage.DOCKER_SANDBOX),
  })).filter(suite => suite.tests.length > 0);
}

/**
 * Get test suites for Stage 2 (Local)
 */
export function getLocalSuites(): TestSuite[] {
  return ALL_SUITES.map(suite => ({
    ...suite,
    tests: suite.tests.filter(t => t.stage === TestStage.LOCAL_DEVICE),
  })).filter(suite => suite.tests.length > 0);
}

/**
 * Get suite by ID
 */
export function getSuiteById(id: string): TestSuite | undefined {
  return ALL_SUITES.find(s => s.id === id);
}

export default ALL_SUITES;
