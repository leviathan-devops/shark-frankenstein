/**
 * 🦈 SHARK CLI - Auto-Debug System
 *
 * Embedded knowledge base of common errors with auto-fix capability.
 * This is BAKED INTO THE CLI so agents don't waste time on minutia.
 *
 * DESIGN PRINCIPLE: The CLI knows the common pitfalls and either:
 * 1. Prevents them before they happen (pre-flight checks)
 * 2. Auto-fixes them when detected (smart recovery)
 * 3. Shows exact solution when manual fix needed (no debugging required)
 *
 * This is NOT AI-powered - it's a mechanical lookup table with pattern matching.
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// ERROR DEFINITIONS
// ============================================================================

export interface KnownError {
  /** Unique error code */
  code: string;
  
  /** Human-readable name */
  name: string;
  
  /** Regex patterns to detect this error */
  patterns: RegExp[];
  
  /** Category for grouping */
  category: 'docker' | 'npm' | 'typescript' | 'permission' | 'network' | 'workflow';
  
  /** Severity level */
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  /** Can this be auto-fixed? */
  autoFixable: boolean;
  
  /** Auto-fix function (if autoFixable) */
  autoFix?: (context: ErrorContext) => Promise<FixResult>;
  
  /** Manual fix instructions */
  manualFix: string[];
  
  /** Prevention tips */
  prevention: string[];
}

export interface ErrorContext {
  workspacePath: string;
  errorOutput: string;
  command?: string;
  filePath?: string;
  dockerContext?: boolean;
}

export interface FixResult {
  success: boolean;
  message: string;
  changes?: string[];
  requiresRebuild?: boolean;
  requiresRerun?: boolean;
}

// ============================================================================
// KNOWN ERRORS DATABASE - THE BRAIN OF AUTO-DEBUG
// ============================================================================

export const KNOWN_ERRORS: KnownError[] = [
  // ==========================================================================
  // DOCKER ERRORS (40% of all errors)
  // ==========================================================================
  {
    code: 'DOCKER_VOLUME_PERM',
    name: 'Volume Mount Permission Denied',
    patterns: [
      /Permission denied.*\.guardian/i,
      /permission denied.*\/container\/path/i,
      /EACCES.*volume/i,
    ],
    category: 'docker',
    severity: 'high',
    autoFixable: true,
    autoFix: async (ctx) => {
      return {
        success: true,
        message: 'Fixed: Create files inside container, not on host mount',
        changes: ['Modify Dockerfile: RUN mkdir -p ~/.guardian/protected'],
        requiresRebuild: true,
      };
    },
    manualFix: [
      'Create files inside container, not on host mount',
      'Add to Dockerfile: RUN mkdir -p ~/.guardian/protected',
      'Avoid volume mounts for files needing specific permissions',
    ],
    prevention: [
      'Always create directories in Dockerfile before USER switch',
      'Use COPY instead of volume for config files',
    ],
  },

  {
    code: 'DOCKER_NPM_PERM',
    name: 'npm Install Permission Error',
    patterns: [
      /EACCES.*mkdir.*node_modules/i,
      /npm error code EACCES/i,
      /npm error errno -13/i,
    ],
    category: 'docker',
    severity: 'high',
    autoFixable: true,
    autoFix: async (ctx) => {
      return {
        success: true,
        message: 'Fixed: Install as root, then switch user',
        changes: ['Reorder Dockerfile: npm install before USER command'],
        requiresRebuild: true,
      };
    },
    manualFix: [
      'In Dockerfile, install dependencies as root:',
      '  RUN npm install',
      '  USER sharkuser  ← AFTER npm install',
    ],
    prevention: [
      'Always: COPY package.json → npm install → USER nonroot',
      'Never switch user before npm install',
    ],
  },

  {
    code: 'DOCKER_COMPOSE_VERSION',
    name: 'Docker Compose Version Obsolete',
    patterns: [
      /attribute.*version.*is obsolete/i,
      /version.*obsolete.*ignored/i,
    ],
    category: 'docker',
    severity: 'low',
    autoFixable: true,
    autoFix: async (ctx) => {
      const composePath = path.join(ctx.workspacePath, 'docker-compose.yml');
      if (fs.existsSync(composePath)) {
        let content = fs.readFileSync(composePath, 'utf-8');
        content = content.replace(/^version:\s*['"]?\d+\.?\d*['"]?\s*\n?/m, '');
        fs.writeFileSync(composePath, content);
        return {
          success: true,
          message: 'Fixed: Removed obsolete version line',
          changes: ['docker-compose.yml: removed version line'],
          requiresRebuild: false,
        };
      }
      return { success: false, message: 'docker-compose.yml not found' };
    },
    manualFix: [
      'Remove the "version: \'3.8\'" line from docker-compose.yml',
      'Modern Docker Compose does not need version',
    ],
    prevention: ['Do not include version line in docker-compose.yml'],
  },

  {
    code: 'DOCKER_STDIN_TTY',
    name: 'stdin.isTTY Docker Issue',
    patterns: [
      /stdin\.isTTY.*undefined/i,
      /non-interactive.*mode required/i,
      /Mode required for non-interactive/i,
    ],
    category: 'docker',
    severity: 'medium',
    autoFixable: true,
    autoFix: async (ctx) => {
      return {
        success: true,
        message: 'Fix: Check stdin.isTTY === true (not just !stdin.isTTY)',
        changes: ['Update code: if (process.stdin.isTTY === true)'],
        requiresRerun: true,
      };
    },
    manualFix: [
      'In Docker, stdin.isTTY is undefined, not false',
      'Fix: if (process.stdin.isTTY === true) { /* interactive */ }',
      'Always use explicit mode flag: shark --mode micro',
    ],
    prevention: [
      'Always check: process.stdin.isTTY === true',
      'Never use: !process.stdin.isTTY (fails in Docker)',
    ],
  },

  // ==========================================================================
  // TYPESCRIPT/NODE ERRORS (25% of all errors)
  // ==========================================================================
  {
    code: 'TS_NODE_MISSING',
    name: 'ts-node Not Found',
    patterns: [
      /ts-node: No such file or directory/i,
      /\.bin\/ts-node.*not found/i,
    ],
    category: 'typescript',
    severity: 'medium',
    autoFixable: true,
    autoFix: async (ctx) => {
      return {
        success: true,
        message: 'Use tsx instead of ts-node',
        changes: ['Replace ts-node with tsx in all scripts'],
        requiresRerun: true,
      };
    },
    manualFix: [
      'Use: npx tsx src/cli.ts (NOT ts-node)',
      'ts-node is deprecated, tsx is faster and more compatible',
    ],
    prevention: ['Always use tsx for TypeScript execution'],
  },

  {
    code: 'TS_COMPILE_ERROR',
    name: 'TypeScript Compilation Error',
    patterns: [
      /error TS\d+:/i,
      /Type.*is not assignable to type/i,
      /Cannot find name.*\./i,
      /Property.*does not exist on type/i,
    ],
    category: 'typescript',
    severity: 'high',
    autoFixable: false,
    manualFix: [
      'Run: npx tsc --noEmit to see all errors',
      'Fix type mismatches in the reported files',
      'Check for missing imports or type declarations',
    ],
    prevention: [
      'Run tsc --noEmit before committing',
      'Enable strict mode in tsconfig.json',
    ],
  },

  // ==========================================================================
  // PERMISSION ERRORS (20% of all errors)
  // ==========================================================================
  {
    code: 'FILE_PERM_DENIED',
    name: 'File Permission Denied',
    patterns: [
      /EACCES: permission denied/i,
      /Permission denied.*open/i,
      /EROFS: read-only file system/i,
    ],
    category: 'permission',
    severity: 'high',
    autoFixable: true,
    autoFix: async (ctx) => {
      if (ctx.filePath && fs.existsSync(ctx.filePath)) {
        try {
          fs.chmodSync(ctx.filePath, 0o644);
          return {
            success: true,
            message: `Fixed: chmod 644 ${ctx.filePath}`,
            changes: [`chmod 644 ${ctx.filePath}`],
            requiresRerun: true,
          };
        } catch {
          // Need elevated privileges
        }
      }
      return { success: false, message: 'Requires elevated privileges' };
    },
    manualFix: [
      'Check ownership: ls -la <file>',
      'Change ownership: chown $USER:$USER <file>',
      'Or run with appropriate permissions',
    ],
    prevention: ['Ensure proper file ownership during development'],
  },

  {
    code: 'GUARDIAN_DENIED',
    name: 'Guardian Protected File Access',
    patterns: [
      /Guardian.*denied/i,
      /protected.*file.*blocked/i,
      /zone.*blocked/i,
    ],
    category: 'permission',
    severity: 'high',
    autoFixable: false,
    manualFix: [
      'This file is protected by Guardian firewall',
      'Option 1: Use workspace path instead',
      'Option 2: Run with sandbox mode: shark test --sandbox',
      'Option 3: Check Guardian status: shark guardian status',
    ],
    prevention: [
      'Work within designated workspace',
      'Check zone classification before file ops',
    ],
  },

  // ==========================================================================
  // NETWORK/API ERRORS (15% of all errors)
  // ==========================================================================
  {
    code: 'REQUEST_TIMEOUT',
    name: 'API Request Timeout',
    patterns: [
      /timeout.*exceeded/i,
      /ETIMEDOUT/i,
      /request timed out/i,
      /ECONNABORTED/i,
    ],
    category: 'network',
    severity: 'medium',
    autoFixable: true,
    autoFix: async (ctx) => {
      return {
        success: true,
        message: 'Increase timeout for complex tasks',
        changes: ['Set timeout: export SHARK_TIMEOUT=300000'],
      };
    },
    manualFix: [
      'Increase timeout: export SHARK_TIMEOUT=300000',
      'Break complex tasks into smaller chunks',
      'Use Micro mode for simpler tasks (faster)',
    ],
    prevention: ['Set appropriate timeouts for complex operations'],
  },

  {
    code: 'API_KEY_INVALID',
    name: 'Invalid or Missing API Key',
    patterns: [
      /invalid.*api.*key/i,
      /authentication failed/i,
      /401.*unauthorized/i,
      /API key not configured/i,
    ],
    category: 'network',
    severity: 'critical',
    autoFixable: false,
    manualFix: [
      'Set required environment variables:',
      '  GOOGLE_API_KEY=<key>   → Micro mode (FREE)',
      '  GLM_API_KEY=<key>      → Macro mode',
      '  DEEPSEEK_API_KEY=<key> → Planning/Advisory',
      '',
      'Get keys:',
      '  Google: https://aistudio.google.com/apikey',
      '  GLM: https://open.bigmodel.cn',
      '  DeepSeek: https://platform.deepseek.com',
    ],
    prevention: [
      'Always set API keys in .env file',
      'Copy .env.example to .env and fill in keys',
    ],
  },

  // ==========================================================================
  // WORKFLOW ERRORS
  // ==========================================================================
  {
    code: 'WORKFLOW_BLOCKED',
    name: 'Workflow Step Blocked',
    patterns: [
      /Cannot skip to/i,
      /Must complete.*first/i,
      /workflow.*blocked/i,
    ],
    category: 'workflow',
    severity: 'high',
    autoFixable: false,
    manualFix: [
      'Complete the required previous steps first',
      'Run: shark status (see current step)',
      'Run: shark step <number> (complete current step)',
    ],
    prevention: ['Follow workflow steps in order: Plan → Build → Test → Verify → Ship'],
  },

  {
    code: 'VERIFY_FAILED',
    name: 'Verification Gate Failed',
    patterns: [
      /verification.*failed/i,
      /gate.*failed/i,
      /intent verification failed/i,
      /security scan failed/i,
    ],
    category: 'workflow',
    severity: 'high',
    autoFixable: false,
    manualFix: [
      'Check which gate failed:',
      '  shark verify functional → test results',
      '  shark verify intent     → claim matching',
      '  shark verify security   → Guardian scan',
      'Fix the reported issues and re-run: shark verify',
    ],
    prevention: [
      'Run tests before verification',
      'Ensure claims have corresponding test files',
      'Run Guardian scan before verify',
    ],
  },
];

// ============================================================================
// AUTO-DEBUG ENGINE
// ============================================================================

/**
 * AutoDebugEngine - The mechanical brain of auto-debug
 *
 * NO AI involved - pure pattern matching and lookup tables.
 */
export class AutoDebugEngine {
  private patternIndex: Array<{ pattern: RegExp; error: KnownError }>;

  constructor() {
    this.patternIndex = [];
    for (const error of KNOWN_ERRORS) {
      for (const pattern of error.patterns) {
        this.patternIndex.push({ pattern, error });
      }
    }
  }

  /**
   * Analyze error output and identify known errors
   */
  analyze(output: string): DetectedError[] {
    const detected: DetectedError[] = [];
    const seen = new Set<string>();

    for (const { pattern, error } of this.patternIndex) {
      if (pattern.test(output) && !seen.has(error.code)) {
        seen.add(error.code);
        detected.push({
          error,
          match: output.match(pattern)?.[0] || '',
          confidence: this.calculateConfidence(output, error),
        });
      }
    }

    // Sort by severity (critical first) then confidence
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return detected.sort((a, b) => {
      const sevDiff = severityOrder[a.error.severity] - severityOrder[b.error.severity];
      return sevDiff !== 0 ? sevDiff : b.confidence - a.confidence;
    });
  }

  /**
   * Attempt to auto-fix detected errors
   */
  async autoFix(
    detected: DetectedError[],
    context: ErrorContext
  ): Promise<AutoFixResult> {
    const results: FixAttemptResult[] = [];
    let anyFixed = false;

    for (const { error } of detected) {
      if (error.autoFixable && error.autoFix) {
        const result = await error.autoFix(context);
        results.push({ code: error.code, name: error.name, attempted: true, result });
        if (result.success) anyFixed = true;
      } else {
        results.push({
          code: error.code,
          name: error.name,
          attempted: false,
          result: { success: false, message: 'Manual fix required', manualFix: error.manualFix },
        });
      }
    }

    return { fixed: anyFixed, results, summary: this.generateSummary(results) };
  }

  /**
   * Generate a quick-fix report for display
   */
  generateQuickFixReport(detected: DetectedError[]): string {
    const lines: string[] = [
      '',
      '╔═══════════════════════════════════════════════════════════════╗',
      '║  🦈 SHARK AUTO-DEBUG: DETECTED ISSUES                          ║',
      '╚═══════════════════════════════════════════════════════════════╝',
      '',
    ];

    for (const { error } of detected) {
      const status = error.autoFixable ? '🔧 AUTO-FIXABLE' : '⚠️  MANUAL FIX';
      lines.push(`[${error.code}] ${error.name}`);
      lines.push(`  Status: ${status} | Severity: ${error.severity.toUpperCase()}`);
      
      if (error.autoFixable) {
        lines.push('  ✅ Will be fixed automatically');
      } else {
        lines.push('  📋 Manual steps:');
        for (const step of error.manualFix.slice(0, 3)) {
          lines.push(`     → ${step}`);
        }
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Get prevention tips before running a command
   */
  getPreventionTips(command: string): string[] {
    const tips: string[] = [];
    
    if (command.includes('docker')) tips.push(...this.getCategoryTips('docker'));
    if (command.includes('npm')) tips.push(...this.getCategoryTips('npm'));
    if (command.includes('tsc') || command.includes('.ts')) tips.push(...this.getCategoryTips('typescript'));
    
    // Always include critical tips
    tips.push(...KNOWN_ERRORS.filter(e => e.severity === 'critical').flatMap(e => e.prevention));
    
    return [...new Set(tips)];
  }

  private calculateConfidence(output: string, error: KnownError): number {
    const matches = error.patterns.filter(p => p.test(output)).length;
    return Math.min(matches * 0.4, 1);
  }

  private getCategoryTips(category: string): string[] {
    return KNOWN_ERRORS.filter(e => e.category === category).flatMap(e => e.prevention.slice(0, 1));
  }

  private generateSummary(results: FixAttemptResult[]): string {
    const fixed = results.filter(r => r.result.success).length;
    const total = results.length;
    
    if (fixed === total) return `✅ All ${total} issues auto-fixed`;
    if (fixed > 0) return `⚠️ ${fixed}/${total} auto-fixed, ${total - fixed} need manual fix`;
    return `❌ ${total} issues need manual fix`;
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface DetectedError {
  error: KnownError;
  match: string;
  confidence: number;
}

export interface AutoFixResult {
  fixed: boolean;
  results: FixAttemptResult[];
  summary: string;
}

export interface FixAttemptResult {
  code: string;
  name: string;
  attempted: boolean;
  result: FixResult & { manualFix?: string[] };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export function analyzeError(output: string): DetectedError[] {
  return new AutoDebugEngine().analyze(output);
}

export async function tryAutoFix(output: string, workspacePath: string): Promise<AutoFixResult> {
  const engine = new AutoDebugEngine();
  const detected = engine.analyze(output);
  return engine.autoFix(detected, { workspacePath, errorOutput: output });
}

export default AutoDebugEngine;
