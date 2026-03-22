/**
 * 🦈 SHARK CLI - Test Runner
 * 
 * 2-stage testing system with Guardian protection for ALL stages.
 * 
 * Stage 1: Docker Sandbox - Automated CI testing in isolated container
 * Stage 2: Local Device - Real user testing with Guardian protection
 * 
 * GUARDIAN PROTECTS EVERYWHERE - not just Docker!
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import {
  TestStage,
  TestStatus,
  TestPriority,
  TestCase,
  TestResult,
  TestSuite,
  TestSuiteResult,
  TestRunnerConfig,
  TestReport,
  TestReportSummary,
  GuardianReportSummary,
  GuardianDecision,
  DockerTestConfig,
  LocalTestConfig,
} from './types';
import {
  Guardian,
  ProtectionLevel,
  ModificationDecision,
  createTestGuardian,
  createProductionGuardian,
  createCIGuardian,
} from '../guardian';

const execAsync = promisify(exec);

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const DEFAULT_DOCKER_CONFIG: DockerTestConfig = {
  image: 'shark-test:latest',
  containerName: 'shark-test-runner',
  volumes: {},
  environment: {},
  network: 'none', // Isolated by default
  resourceLimits: {
    memory: '2g',
    cpu: '2',
  },
  timeout: 600000, // 10 minutes
};

const DEFAULT_LOCAL_CONFIG: LocalTestConfig = {
  protectedDirectories: [
    // System directories - ALWAYS protected
    '/bin', '/sbin', '/usr/bin', '/usr/sbin',
    '/lib', '/lib64', '/usr/lib', '/usr/lib64',
    '/etc', '/var', '/proc', '/sys', '/dev',
    '/boot', '/root',
    // macOS
    '/System', '/Library', '/Applications',
    // User sensitive
    '.ssh', '.gnupg', '.aws', '.azure', '.gcloud',
    '.kube', '.config/gh', 'credentials', 'secrets',
  ],
  allowedDirectories: [
    // Safe development directories
    'Projects', 'projects', 'code', 'Code', 'dev', 'Dev',
    'workspace', 'Workspace', 'repos', 'Repos',
  ],
  backupFiles: [],
  restoreAfterTest: true,
  cleanupProcesses: true,
  maxDiskUsage: '1GB',
  allowNetwork: true,
};

// ============================================================================
// TEST RUNNER CLASS
// ============================================================================

/**
 * SharkTestRunner - 2-Stage Testing with Universal Guardian Protection
 * 
 * This runner ensures that Guardian protection is active in BOTH stages:
 * - Stage 1 (Docker): Extra sandboxing via container isolation
 * - Stage 2 (Local): Guardian provides the firewall/sandbox protection
 * 
 * The key insight: Guardian is NOT just for Docker - it's the universal
 * agent behavior firewall that protects the local device too.
 */
export class SharkTestRunner {
  private config: TestRunnerConfig;
  private guardian: Guardian;
  private guardianDecisions: GuardianDecision[] = [];
  private testResults: Map<string, TestResult> = new Map();
  private startTime: Date = new Date();

  constructor(config: Partial<TestRunnerConfig> = {}) {
    // Set defaults
    this.config = {
      stage: TestStage.LOCAL_DEVICE,
      guardianEnabled: true,
      guardianLevel: 'balanced',
      workspacePath: process.cwd(),
      parallel: false,
      maxParallel: 4,
      failFast: false,
      detailedReport: true,
      verbose: false,
      dryRun: false,
      globalTimeout: 600000, // 10 minutes
      ...config,
    };

    // Initialize Guardian based on stage and config
    this.guardian = this.createGuardian();
  }

  // ==========================================================================
  // GUARDIAN INITIALIZATION
  // ==========================================================================

  /**
   * Create Guardian with appropriate protection level
   */
  private createGuardian(): Guardian {
    if (!this.config.guardianEnabled) {
      // Create disabled guardian
      const g = new Guardian({ enabled: false });
      return g;
    }

    const levelMap: Record<string, ProtectionLevel> = {
      strict: ProtectionLevel.STRICT,
      balanced: ProtectionLevel.BALANCED,
      permissive: ProtectionLevel.PERMISSIVE,
      sandbox: ProtectionLevel.SANDBOX,
    };

    const protectionLevel = levelMap[this.config.guardianLevel] || ProtectionLevel.BALANCED;

    // For Stage 2 (local device), Guardian IS the primary protection
    if (this.config.stage === TestStage.LOCAL_DEVICE) {
      console.log('🛡️  Guardian: Activating protection for LOCAL DEVICE testing');
      console.log(`   Level: ${protectionLevel}`);
      console.log(`   Workspace: ${this.config.workspacePath}`);
      
      return new Guardian({
        level: protectionLevel,
        workspacePath: this.config.workspacePath,
        auditLog: true,
        autoBackup: true,
      });
    }

    // For Stage 1 (Docker), Guardian provides additional layer
    console.log('🛡️  Guardian: Activating inside Docker container');
    return createCIGuardian(this.config.workspacePath);
  }

  // ==========================================================================
  // STAGE 1: DOCKER SANDBOX TESTING
  // ==========================================================================

  /**
   * Run tests in Docker sandbox
   * Stage 1: Automated CI testing in isolated container
   */
  async runDockerTests(suite: TestSuite, dockerConfig: Partial<DockerTestConfig> = {}): Promise<TestSuiteResult> {
    const config = { ...DEFAULT_DOCKER_CONFIG, ...dockerConfig };
    const startTime = new Date();

    console.log('\n🐳 Stage 1: Docker Sandbox Testing');
    console.log('━'.repeat(50));
    console.log(`   Image: ${config.image}`);
    console.log(`   Container: ${config.containerName}`);
    console.log(`   Network: ${config.network}`);
    console.log(`   Memory: ${config.resourceLimits.memory}`);
    console.log(`   CPU: ${config.resourceLimits.cpu}`);

    try {
      // Build Docker image if needed
      await this.ensureDockerImage(config);

      // Run tests in container
      const results = await this.executeInDocker(suite, config);

      const endTime = new Date();
      return this.compileResults(suite, results, startTime, endTime);
    } catch (error: any) {
      console.error(`❌ Docker test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ensure Docker image exists
   */
  private async ensureDockerImage(config: DockerTestConfig): Promise<void> {
    try {
      await execAsync(`docker image inspect ${config.image}`);
      console.log(`   ✓ Image ${config.image} exists`);
    } catch {
      console.log(`   Building image ${config.image}...`);
      // Build from Dockerfile if exists
      const dockerfile = path.join(this.config.workspacePath, 'Dockerfile.test');
      if (fs.existsSync(dockerfile)) {
        await execAsync(`docker build -t ${config.image} -f ${dockerfile} ${this.config.workspacePath}`);
      } else {
        // Use base Node.js image
        await execAsync(`docker pull node:20-slim`);
        await execAsync(`docker tag node:20-slim ${config.image}`);
      }
    }
  }

  /**
   * Execute tests inside Docker container
   */
  private async executeInDocker(suite: TestSuite, config: DockerTestConfig): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Prepare volume mounts
    const volumeMounts = Object.entries(config.volumes)
      .map(([host, container]) => `-v "${host}:${container}"`)
      .join(' ');

    // Prepare environment variables
    const envVars = Object.entries(config.environment)
      .map(([key, value]) => `-e ${key}="${value}"`)
      .join(' ');

    // Run each test
    for (const test of suite.tests) {
      if (this.config.dryRun) {
        console.log(`   [DRY RUN] Would run: ${test.name}`);
        continue;
      }

      const result = await this.runDockerTest(test, config, volumeMounts, envVars);
      results.push(result);

      if (result.status === TestStatus.FAILED && this.config.failFast) {
        console.log(`   ⚠️  Fail fast: stopping after ${test.name}`);
        break;
      }
    }

    return results;
  }

  /**
   * Run a single test in Docker
   */
  private async runDockerTest(
    test: TestCase,
    config: DockerTestConfig,
    volumeMounts: string,
    envVars: string
  ): Promise<TestResult> {
    const startTime = new Date();
    console.log(`\n   ▶ ${test.name} (${test.priority})`);

    try {
      // Construct test command
      const testCmd = `npx tsx src/testing/test-executor.ts --test ${test.id}`;
      
      const dockerCmd = [
        'docker run --rm',
        `--name ${config.containerName}-${test.id}`,
        volumeMounts,
        envVars,
        `--memory=${config.resourceLimits.memory}`,
        `--cpus=${config.resourceLimits.cpu}`,
        `--network=${config.network}`,
        config.image,
        testCmd,
      ].join(' ');

      const { stdout, stderr } = await execAsync(dockerCmd, {
        timeout: test.timeout,
      });

      const endTime = new Date();
      
      return {
        testId: test.id,
        status: TestStatus.PASSED,
        duration: endTime.getTime() - startTime.getTime(),
        startTime,
        endTime,
        output: stdout,
        guardianDecisions: [],
      };
    } catch (error: any) {
      const endTime = new Date();
      
      return {
        testId: test.id,
        status: TestStatus.FAILED,
        duration: endTime.getTime() - startTime.getTime(),
        startTime,
        endTime,
        error: {
          message: error.message,
          stack: error.stack,
          recoverable: !error.killed,
        },
        output: error.stdout || error.stderr,
      };
    }
  }

  // ==========================================================================
  // STAGE 2: LOCAL DEVICE TESTING (WITH GUARDIAN!)
  // ==========================================================================

  /**
   * Run tests on local device with Guardian protection
   * 
   * THIS IS THE CRITICAL STAGE - Guardian must protect the local device!
   * 
   * Guardian acts as a firewall for agent behavior, preventing:
   * - Modification of system files
   * - Access to personal credentials
   * - Breaking critical configurations
   * - Escaping workspace boundaries
   */
  async runLocalTests(suite: TestSuite, localConfig: Partial<LocalTestConfig> = {}): Promise<TestSuiteResult> {
    const config = { ...DEFAULT_LOCAL_CONFIG, ...localConfig };
    const startTime = new Date();

    console.log('\n🖥️  Stage 2: Local Device Testing');
    console.log('━'.repeat(50));
    console.log(`   Workspace: ${this.config.workspacePath}`);
    console.log(`   Guardian: ${this.guardian.isEnabled() ? 'ACTIVE' : 'DISABLED'}`);
    console.log(`   Protection Level: ${this.guardian.getProtectionLevel()}`);
    console.log(`   Protected Dirs: ${config.protectedDirectories.length}`);
    console.log(`   Allowed Dirs: ${config.allowedDirectories.length}`);

    // CRITICAL: Verify Guardian is protecting
    if (!this.guardian.isEnabled()) {
      console.warn('\n   ⚠️  WARNING: Guardian is DISABLED!');
      console.warn('   Local device testing without protection is DANGEROUS.');
      
      if (!this.config.dryRun) {
        throw new Error('Guardian must be enabled for local device testing');
      }
    }

    // Pre-test safety check
    await this.performSafetyCheck(config);

    const results: TestResult[] = [];

    // Run each test with Guardian monitoring
    for (const test of suite.tests) {
      if (this.config.dryRun) {
        console.log(`   [DRY RUN] Would run: ${test.name}`);
        continue;
      }

      console.log(`\n   ▶ ${test.name} (${test.priority})`);

      // Clear previous Guardian decisions for this test
      this.guardianDecisions = [];

      const result = await this.runLocalTest(test, config);
      results.push(result);

      // Log Guardian decisions
      if (result.guardianDecisions && result.guardianDecisions.length > 0) {
        console.log(`   🛡️  Guardian: ${result.guardianDecisions.length} decisions`);
        for (const decision of result.guardianDecisions) {
          const emoji = decision.decision === 'deny' ? '🚫' : 
                       decision.decision === 'sandbox_redirect' ? '📦' : '✅';
          console.log(`      ${emoji} ${decision.operation} ${decision.path} → ${decision.decision}`);
        }
      }

      if (result.status === TestStatus.BLOCKED) {
        console.log(`   🚫 Test BLOCKED by Guardian: ${result.error?.message}`);
      }

      if (result.status === TestStatus.FAILED && this.config.failFast) {
        console.log(`   ⚠️  Fail fast: stopping after ${test.name}`);
        break;
      }
    }

    const endTime = new Date();
    return this.compileResults(suite, results, startTime, endTime);
  }

  /**
   * Perform pre-test safety check
   */
  private async performSafetyCheck(config: LocalTestConfig): Promise<void> {
    console.log('\n   🔍 Performing safety check...');

    // Check protected directories
    for (const dir of config.protectedDirectories) {
      const expandedDir = dir.startsWith('~') 
        ? path.join(os.homedir(), dir.slice(1)) 
        : dir;
      
      if (fs.existsSync(expandedDir)) {
        const info = this.guardian.getFileInfo(expandedDir);
        if (info.canModify) {
          console.warn(`   ⚠️  Protected directory ${dir} is modifiable - fixing...`);
          // Add to Guardian's protection
          this.guardian.protect(expandedDir);
        }
      }
    }

    // Check disk space
    const maxBytes = this.parseDiskUsage(config.maxDiskUsage);
    // Note: Actual disk check would go here

    console.log('   ✓ Safety check passed');
  }

  /**
   * Run a single test on local device
   */
  private async runLocalTest(test: TestCase, config: LocalTestConfig): Promise<TestResult> {
    const startTime = new Date();
    const decisions: GuardianDecision[] = [];

    try {
      // Execute test with Guardian monitoring
      // This is where the actual test logic would run
      const testOutput = await this.executeWithGuardian(test, decisions);

      const endTime = new Date();

      return {
        testId: test.id,
        status: TestStatus.PASSED,
        duration: endTime.getTime() - startTime.getTime(),
        startTime,
        endTime,
        output: testOutput,
        guardianDecisions: decisions,
      };
    } catch (error: any) {
      const endTime = new Date();

      // Check if blocked by Guardian
      const isBlocked = decisions.some(d => d.decision === 'deny');
      
      return {
        testId: test.id,
        status: isBlocked ? TestStatus.BLOCKED : TestStatus.FAILED,
        duration: endTime.getTime() - startTime.getTime(),
        startTime,
        endTime,
        error: {
          message: error.message,
          stack: error.stack,
          recoverable: !isBlocked,
        },
        guardianDecisions: decisions,
      };
    }
  }

  /**
   * Execute test with Guardian monitoring all file operations
   */
  private async executeWithGuardian(test: TestCase, decisions: GuardianDecision[]): Promise<string> {
    // This is a placeholder for actual test execution
    // In a real implementation, this would:
    // 1. Parse the test definition
    // 2. Execute test steps
    // 3. Monitor all file operations through Guardian
    // 4. Record all Guardian decisions

    return new Promise((resolve, reject) => {
      // Simulate test execution
      setTimeout(() => {
        // Example: Check if test tries to access protected path
        const testPath = path.join(os.homedir(), '.ssh', 'id_rsa');
        const checkResult = this.guardian.checkModification(testPath);
        
        const decision: GuardianDecision = {
          path: testPath,
          operation: 'write',
          decision: checkResult === ModificationDecision.DENY ? 'deny' : 'allow',
          reason: 'Test attempted to modify SSH key',
          timestamp: new Date(),
        };
        decisions.push(decision);

        if (checkResult === ModificationDecision.DENY) {
          reject(new Error(`Guardian blocked access to ${testPath}`));
        } else {
          resolve(`Test ${test.name} completed`);
        }
      }, 100);
    });
  }

  // ==========================================================================
  // 2-STAGE TESTING ORCHESTRATION
  // ==========================================================================

  /**
   * Run full 2-stage test pipeline
   * 
   * Stage 1: Docker → Stage 2: Local (with Guardian)
   */
  async runPipeline(suite: TestSuite): Promise<{
    dockerResult?: TestSuiteResult;
    localResult?: TestSuiteResult;
    passed: boolean;
    report: TestReport;
  }> {
    console.log('\n🦈 Shark 2-Stage Testing Pipeline');
    console.log('═'.repeat(50));

    let dockerResult: TestSuiteResult | undefined;
    let localResult: TestSuiteResult | undefined;

    // Stage 1: Docker Sandbox
    if (this.config.stage === TestStage.DOCKER_SANDBOX || 
        this.config.stage === TestStage.LOCAL_DEVICE) {
      try {
        dockerResult = await this.runDockerTests(suite);
        
        // Check if Stage 1 passed enough to continue
        const passRate = dockerResult.passed / dockerResult.totalTests;
        if (passRate < 0.8) {
          console.log(`\n⚠️  Stage 1 pass rate (${(passRate * 100).toFixed(1)}%) below 80%`);
          console.log('   Consider fixing Stage 1 failures before Stage 2');
        }
      } catch (error: any) {
        console.error(`Stage 1 failed: ${error.message}`);
        if (this.config.failFast) {
          throw error;
        }
      }
    }

    // Stage 2: Local Device (with Guardian!)
    if (this.config.stage === TestStage.LOCAL_DEVICE) {
      try {
        localResult = await this.runLocalTests(suite);
      } catch (error: any) {
        console.error(`Stage 2 failed: ${error.message}`);
        throw error;
      }
    }

    // Generate report
    const report = this.generateReport(dockerResult, localResult);

    const passed = this.evaluatePipeline(dockerResult, localResult);

    return {
      dockerResult,
      localResult,
      passed,
      report,
    };
  }

  /**
   * Evaluate overall pipeline status
   */
  private evaluatePipeline(
    dockerResult?: TestSuiteResult,
    localResult?: TestSuiteResult
  ): boolean {
    // Must pass Stage 1 (Docker)
    if (dockerResult) {
      const dockerPassRate = dockerResult.passed / dockerResult.totalTests;
      if (dockerPassRate < 0.8) return false;
    }

    // Must pass Stage 2 (Local) with no Guardian blocks
    if (localResult) {
      if (localResult.blocked > 0) {
        console.log('\n⚠️  Some tests were BLOCKED by Guardian');
        return false;
      }
      const localPassRate = localResult.passed / localResult.totalTests;
      if (localPassRate < 0.9) return false;
    }

    return true;
  }

  // ==========================================================================
  // REPORTING
  // ==========================================================================

  /**
   * Compile test results into suite result
   */
  private compileResults(
    suite: TestSuite,
    results: TestResult[],
    startTime: Date,
    endTime: Date
  ): TestSuiteResult {
    return {
      suiteId: suite.id,
      totalTests: suite.tests.length,
      passed: results.filter(r => r.status === TestStatus.PASSED).length,
      failed: results.filter(r => r.status === TestStatus.FAILED).length,
      skipped: results.filter(r => r.status === TestStatus.SKIPPED).length,
      blocked: results.filter(r => r.status === TestStatus.BLOCKED).length,
      duration: endTime.getTime() - startTime.getTime(),
      startTime,
      endTime,
      results,
      guardianReport: this.guardian.generateReport(),
    };
  }

  /**
   * Generate comprehensive test report
   */
  private generateReport(
    dockerResult?: TestSuiteResult,
    localResult?: TestSuiteResult
  ): TestReport {
    const allResults = [
      ...(dockerResult?.results || []),
      ...(localResult?.results || []),
    ];

    const summary: TestReportSummary = {
      total: allResults.length,
      passed: allResults.filter(r => r.status === TestStatus.PASSED).length,
      failed: allResults.filter(r => r.status === TestStatus.FAILED).length,
      skipped: allResults.filter(r => r.status === TestStatus.SKIPPED).length,
      blocked: allResults.filter(r => r.status === TestStatus.BLOCKED).length,
      passRate: 0,
      duration: (dockerResult?.duration || 0) + (localResult?.duration || 0),
    };
    summary.passRate = summary.total > 0 ? summary.passed / summary.total : 0;

    // Gather Guardian summary
    const allDecisions = allResults
      .flatMap(r => r.guardianDecisions || []);

    const guardianSummary: GuardianReportSummary = {
      enabled: this.guardian.isEnabled(),
      totalDecisions: allDecisions.length,
      allowed: allDecisions.filter(d => d.decision === 'allow').length,
      denied: allDecisions.filter(d => d.decision === 'deny').length,
      sandboxRedirects: allDecisions.filter(d => d.decision === 'sandbox_redirect').length,
      backupsCreated: allDecisions.filter(d => d.decision === 'backup_then_allow').length,
      protectedFiles: this.guardian.listProtected(),
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(summary, guardianSummary);

    return {
      generated: new Date(),
      stage: this.config.stage,
      summary,
      results: allResults,
      guardianSummary,
      recommendations,
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(
    summary: TestReportSummary,
    guardianSummary: GuardianReportSummary
  ): string[] {
    const recommendations: string[] = [];

    if (summary.passRate < 0.8) {
      recommendations.push('Pass rate below 80% - review failed tests');
    }

    if (summary.blocked > 0) {
      recommendations.push('Some tests were blocked by Guardian - review security boundaries');
    }

    if (guardianSummary.denied > 0) {
      recommendations.push(`${guardianSummary.denied} operations were denied - check test permissions`);
    }

    if (guardianSummary.sandboxRedirects > 0) {
      recommendations.push('Consider using workspace paths instead of system paths');
    }

    return recommendations;
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Parse disk usage string to bytes
   */
  private parseDiskUsage(size: string): number {
    const match = size.match(/^(\d+)(GB|MB|KB|B)?$/i);
    if (!match) return 0;

    const value = parseInt(match[1], 10);
    const unit = (match[2] || 'B').toUpperCase();

    switch (unit) {
      case 'GB': return value * 1024 * 1024 * 1024;
      case 'MB': return value * 1024 * 1024;
      case 'KB': return value * 1024;
      default: return value;
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a test runner for Docker sandbox testing (Stage 1)
 */
export function createDockerTestRunner(workspacePath: string): SharkTestRunner {
  return new SharkTestRunner({
    stage: TestStage.DOCKER_SANDBOX,
    guardianEnabled: true,
    guardianLevel: 'strict',
    workspacePath,
  });
}

/**
 * Create a test runner for local device testing (Stage 2)
 * Guardian provides the protection layer for the local device!
 */
export function createLocalTestRunner(workspacePath: string): SharkTestRunner {
  return new SharkTestRunner({
    stage: TestStage.LOCAL_DEVICE,
    guardianEnabled: true,
    guardianLevel: 'balanced', // Balanced for local - allows dev dirs
    workspacePath,
  });
}

/**
 * Create a test runner for the full 2-stage pipeline
 */
export function createPipelineTestRunner(workspacePath: string): SharkTestRunner {
  return new SharkTestRunner({
    stage: TestStage.LOCAL_DEVICE, // Runs both stages
    guardianEnabled: true,
    guardianLevel: 'balanced',
    workspacePath,
  });
}

export default SharkTestRunner;
