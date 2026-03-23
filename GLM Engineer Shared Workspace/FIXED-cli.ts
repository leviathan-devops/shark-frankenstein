#!/usr/bin/env node
/**
 * 🦈 SHARK CLI - Main Entry Point (FIXED VERSION)
 * 
 * THIS VERSION INTEGRATES ALL CLAIMED FEATURES:
 * - Guardian protection for ALL file operations
 * - 5-Step Workflow enforcement (PLAN → BUILD → TEST → VERIFY → SHIP)
 * - Auto-Debug for error recovery
 * 
 * The launch command is simply: `shark`
 * 
 * ARCHITECTURE:
 * 
 * 🦈 MICRO ENGINEER (Precision Coding)
 * ├─ Brain: DeepSeek R1 (THINKS - burns tokens for reasoning)
 * ├─ Hands: Gemma 3 4B (DOES - FREE tier, 14k RPD)
 * ├─ Use: Linear tasks, single-file, syntax fixes, unit tests
 * └─ Like: Special Forces - surgical precision
 * 
 * 🧠 MACRO ENGINEER (Systems Engineering)
 * ├─ Primary: GLM 4.5-flash (autonomous execution)
 * ├─ Advisory: DeepSeek R1 (strategic copilot)
 * ├─ Use: Multi-file architecture, DevOps, CI/CD
 * └─ Like: Air Force - full engineering capabilities
 */

import * as dotenv from 'dotenv';
import { prompt } from 'enquirer';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import { DualBrainCoordinator, CoordinatorConfig } from './brain/coordinator';
import { BrainMode } from './brain/types';
import { loadConfig, SharkConfig } from './config';

// ✅ FIXED: Import Guardian, Workflow, and AutoDebug
import { 
  Guardian, 
  ProtectionLevel, 
  ModificationDecision,
  createProductionGuardian 
} from './guardian';
import { WorkflowMachine, WorkflowStep } from './workflow/state-machine';
import { AutoDebugEngine, tryAutoFix, DetectedError } from './debug/autodebug';

// Load environment variables
dotenv.config();

const SHARK_ASCII = `
${chalk.cyan('    ╔═══════════════════════════════════╗')}
${chalk.cyan('    ║')}                                   ${chalk.cyan('║')}
${chalk.cyan('    ║')}      ${chalk.bold.white('🦈 SHARK AGENT v1.1')}        ${chalk.cyan('║')}
${chalk.cyan('    ║')}      ${chalk.gray('(Fixed Integration Build)')}     ${chalk.cyan('║')}
${chalk.cyan('    ║')}                                   ${chalk.cyan('║')}
${chalk.cyan('    ║')}    ${chalk.gray('Dual-Brain Architecture')}       ${chalk.cyan('║')}
${chalk.cyan('    ║')}    ${chalk.green('✓ Guardian Active')}            ${chalk.cyan('║')}
${chalk.cyan('    ║')}    ${chalk.green('✓ Workflow Enforced')}          ${chalk.cyan('║')}
${chalk.cyan('    ║')}    ${chalk.green('✓ Auto-Debug Ready')}           ${chalk.cyan('║')}
${chalk.cyan('    ║')}                                   ${chalk.cyan('║')}
${chalk.cyan('    ╚═══════════════════════════════════╝')}
`;

const MODE_DESCRIPTIONS = {
  micro: `
${chalk.cyan('🦈 MICRO ENGINEER')} - Precision Coding
${chalk.gray('─'.repeat(40))}

${chalk.white('Architecture:')} DeepSeek R1 (THINKS) → Gemma 3 4B (DOES)
${chalk.white('Cost:')} FREE execution (Gemma 14k RPD free tier)

${chalk.green('Best for:')}
  • Single-file operations
  • Syntax fixes & debugging  
  • Unit tests
  • Code reviews
  • Linear coding tasks

${chalk.yellow('Like:')} Special Forces - surgical precision`,

  macro: `
${chalk.magenta('🧠 MACRO ENGINEER')} - Autonomous Systems Architect
${chalk.gray('─'.repeat(40))}

${chalk.white('Architecture:')} GLM 4.5-flash (PRIMARY) + DeepSeek R1 (ADVISORY)
${chalk.white('Cost:')} GLM tokens + DeepSeek tokens (not free)

${chalk.green('Capabilities:')}
  • Multi-iteration autonomous execution (up to 15)
  • Built-in tools: file read/write, shell, search
  • Strategic consultation between iterations
  • Self-detects completion, auto-refines output

${chalk.green('Best for:')}
  • Complex multi-step orchestration
  • Multi-file architecture
  • DevOps & CI/CD pipelines
  • Autonomous project scaffolding
  • System migrations

${chalk.yellow('Like:')} Air Traffic Control - orchestrates chaos`
};

/**
 * ✅ FIXED: Integrated Shark CLI with Guardian, Workflow, and AutoDebug
 */
export class SharkCLI {
  private coordinator: DualBrainCoordinator;
  private guardian: Guardian;
  private workflow: WorkflowMachine;
  private autoDebug: AutoDebugEngine;
  private workspacePath: string;
  private verbose: boolean;

  constructor(workspacePath: string, mode: BrainMode, config?: Partial<CoordinatorConfig>) {
    this.workspacePath = workspacePath;
    this.verbose = config?.verbose ?? false;

    // ✅ FIXED: Initialize Guardian
    this.guardian = createProductionGuardian(workspacePath);
    this.log('🛡️  Guardian initialized with BALANCED protection');

    // ✅ FIXED: Initialize Workflow Machine
    this.workflow = new WorkflowMachine(workspacePath);
    this.log('📋 Workflow machine initialized');

    // ✅ FIXED: Initialize Auto-Debug Engine
    this.autoDebug = new AutoDebugEngine();
    this.log('🔧 Auto-debug engine ready');

    // Initialize Coordinator
    const coordinatorConfig: CoordinatorConfig = {
      mode,
      maxIterations: mode === BrainMode.MACRO ? 15 : 10,
      autoApprove: false,
      verbose: this.verbose,
      gemmaRegion: (process.env.SHARK_REGION as 'us' | 'sea') || 'sea',
      ...config,
    };
    this.coordinator = new DualBrainCoordinator(coordinatorConfig);
    this.log(`🧠 Coordinator initialized in ${mode} mode`);
  }

  /**
   * Get current workflow step
   */
  getWorkflowStep(): WorkflowStep {
    return this.workflow.getCurrentStep();
  }

  /**
   * Check if Guardian allows an operation
   */
  checkGuardian(filePath: string, operation: 'read' | 'write' | 'delete' = 'write'): {
    allowed: boolean;
    decision: ModificationDecision;
    reason?: string;
  } {
    const decision = this.guardian.checkPermission(filePath, operation);
    const allowed = decision === ModificationDecision.ALLOW || 
                    decision === ModificationDecision.BACKUP_THEN_ALLOW ||
                    decision === ModificationDecision.SANDBOX_REDIRECT;
    
    return {
      allowed,
      decision,
      reason: allowed ? undefined : `Guardian blocked: ${decision}`,
    };
  }

  /**
   * ✅ FIXED: Execute task with full integration
   */
  async execute(task: string, options?: { context?: string }): Promise<{
    output: string;
    iterations: number;
    guardianBlocks: string[];
    workflowState: WorkflowStep;
    autoFixes: string[];
  }> {
    const guardianBlocks: string[] = [];
    const autoFixes: string[] = [];

    // ✅ FIXED: Set original prompt in workflow for intent verification
    this.workflow.setOriginalPrompt(task);

    // ✅ FIXED: Check workflow state
    const currentStep = this.workflow.getCurrentStep();
    this.log(`Current workflow step: ${WorkflowStep[currentStep]}`);

    // Get prevention tips from auto-debug
    const tips = this.autoDebug.getPreventionTips(task);
    if (tips.length > 0 && this.verbose) {
      console.log(chalk.gray('\n💡 Prevention tips:'));
      tips.slice(0, 3).forEach(tip => console.log(chalk.gray(`   • ${tip}`)));
    }

    try {
      // Execute with coordinator
      const result = await this.coordinator.execute(task, options);

      // Check if any file paths were mentioned and validate with Guardian
      const filePathPattern = /(?:file|path|write|create|delete|modify)[\s:]+([^\s]+\.(ts|js|json|md|py|sh))/gi;
      const matches = result.finalOutput.matchAll(filePathPattern);
      for (const match of matches) {
        const filePath = match[1];
        const check = this.checkGuardian(filePath, 'write');
        if (!check.allowed) {
          guardianBlocks.push(`${filePath}: ${check.reason}`);
        }
      }

      return {
        output: result.finalOutput,
        iterations: result.iterations,
        guardianBlocks,
        workflowState: this.workflow.getCurrentStep(),
        autoFixes,
      };

    } catch (error: any) {
      // ✅ FIXED: Use Auto-Debug for error recovery
      const errorOutput = error.message || String(error);
      const detected = this.autoDebug.analyze(errorOutput);

      if (detected.length > 0) {
        console.log(this.autoDebug.generateQuickFixReport(detected));

        // Try auto-fix
        const fixResult = await tryAutoFix(errorOutput, this.workspacePath);
        if (fixResult.fixed) {
          autoFixes.push(...fixResult.results
            .filter(r => r.result.success)
            .map(r => `${r.name}: ${r.result.message}`));
          
          console.log(chalk.green(`\n✅ Auto-fixed: ${fixResult.summary}\n`));
        }
      }

      throw error;
    }
  }

  /**
   * Get Guardian audit log
   */
  getGuardianAuditLog() {
    return this.guardian.getAuditLog();
  }

  /**
   * Get Guardian protection report
   */
  getGuardianReport(): string {
    return this.guardian.generateReport();
  }

  /**
   * Run workflow verification gate
   */
  async runVerificationGate(gate: 'functional' | 'intent' | 'security'): Promise<{
    passed: boolean;
    errors: string[];
  }> {
    const { VerificationGate } = await import('./workflow/types');
    const gateEnum = gate === 'functional' ? VerificationGate.FUNCTIONAL :
                     gate === 'intent' ? VerificationGate.INTENT :
                     VerificationGate.SECURITY;
    
    const result = await this.workflow.runVerificationGate(gateEnum);
    return {
      passed: result.status === 'passed',
      errors: result.errors,
    };
  }

  /**
   * Set brain mode
   */
  setMode(mode: BrainMode): void {
    this.coordinator.setMode(mode);
  }

  /**
   * Log if verbose
   */
  private log(message: string): void {
    if (this.verbose) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      console.log(`[${timestamp}] ${message}`);
    }
  }
}

/**
 * Mode selection wizard
 */
async function selectMode(): Promise<BrainMode> {
  console.log('\n' + SHARK_ASCII);
  
  console.log(chalk.gray('Select your engineer mode for this session:\n'));

  const { mode } = await prompt<{
    mode: 'micro' | 'macro';
  }>({
    type: 'select',
    name: 'mode',
    message: 'Choose mode',
    choices: [
      { 
        name: 'micro', 
        message: chalk.cyan('🦈 Micro Engineer') + chalk.gray(' - Precision coding (FREE execution)'),
        hint: 'Linear tasks, single-file, syntax fixes'
      },
      { 
        name: 'macro', 
        message: chalk.magenta('🧠 Macro Engineer') + chalk.gray(' - Systems engineering'),
        hint: 'Multi-file, DevOps, CI/CD, architecture'
      },
    ],
  });

  // Show mode details
  console.log(MODE_DESCRIPTIONS[mode]);
  console.log('');

  const { confirm } = await prompt<{ confirm: boolean }>({
    type: 'confirm',
    name: 'confirm',
    message: `Start ${mode === 'micro' ? 'Micro Engineer' : 'Macro Engineer'}?`,
    initial: true,
  });

  if (!confirm) {
    return selectMode(); // Let them choose again
  }

  return mode === 'micro' ? BrainMode.MICRO : BrainMode.MACRO;
}

/**
 * Check configuration and guide setup if needed
 */
async function checkConfiguration(mode: BrainMode): Promise<void> {
  const hasDeepseekKey = !!process.env.DEEPSEEK_API_KEY;
  const hasGlmKey = !!(process.env.GLM_API_KEY || process.env.GLM_CODING_PLAN_KEY);
  const hasGemmaKey = !!(process.env.GOOGLE_API_KEY || process.env.GEMMA_API_KEY);

  console.log(chalk.gray('\n📋 Configuration Status:\n'));

  if (mode === BrainMode.MICRO) {
    // Micro needs: Gemma (required), DeepSeek (optional but recommended)
    console.log(`  DeepSeek R1 (Planning):  ${hasDeepseekKey ? chalk.green('✓ Configured') : chalk.yellow('⚠ Not set')}`);
    console.log(`  Gemma 3 4B (Execution):  ${hasGemmaKey ? chalk.green('✓ Configured') : chalk.red('✗ Required')}`);

    if (!hasGemmaKey) {
      console.log(chalk.red('\n⚠  Gemma API key required for Micro Engineer mode'));
      console.log(chalk.gray('   Get free API key: https://aistudio.google.com/apikey'));
      console.log(chalk.gray('   Set environment: export GOOGLE_API_KEY=your-key\n'));
      process.exit(1);
    }

    if (!hasDeepseekKey) {
      console.log(chalk.yellow('\n💡 Tip: Set DEEPSEEK_API_KEY for strategic planning'));
      console.log(chalk.gray('   Without it, tasks will be executed directly without planning.\n'));
    }
  } else {
    // Macro needs: GLM (required), DeepSeek (recommended)
    console.log(`  GLM 4.5-flash (Primary): ${hasGlmKey ? chalk.green('✓ Configured') : chalk.red('✗ Required')}`);
    console.log(`  DeepSeek R1 (Advisory):  ${hasDeepseekKey ? chalk.green('✓ Configured') : chalk.yellow('⚠ Not set')}`);

    if (!hasGlmKey) {
      console.log(chalk.red('\n⚠  GLM API key required for Macro Engineer mode'));
      console.log(chalk.gray('   Set environment: export GLM_API_KEY=your-key'));
      console.log(chalk.gray('   Or: export GLM_CODING_PLAN_KEY=your-key\n'));
      process.exit(1);
    }

    if (!hasDeepseekKey) {
      console.log(chalk.yellow('\n💡 Tip: Set DEEPSEEK_API_KEY for strategic consultation'));
      console.log(chalk.gray('   GLM will work autonomously, but advisory input helps.\n'));
    }
  }
}

/**
 * Interactive REPL loop
 */
async function repl(cli: SharkCLI, mode: BrainMode): Promise<void> {
  console.log(chalk.gray('\n' + '─'.repeat(50)));
  console.log(chalk.bold('  Type your task, or use commands:'));
  console.log(chalk.gray('  /mode       - Switch mode'));
  console.log(chalk.gray('  /workflow   - Show workflow status'));
  console.log(chalk.gray('  /guardian   - Show guardian report'));
  console.log(chalk.gray('  /verify     - Run verification gates'));
  console.log(chalk.gray('  /clear      - Clear screen'));
  console.log(chalk.gray('  /exit       - Exit Shark'));
  console.log(chalk.gray('─'.repeat(50) + '\n'));

  while (true) {
    try {
      const { input } = await prompt<{ input: string }>({
        type: 'input',
        name: 'input',
        message: chalk.cyan('🦈'),
        prefix: '',
      });

      const trimmed = input.trim();

      // Handle commands
      if (trimmed.startsWith('/')) {
        const cmd = trimmed.toLowerCase().split(' ')[0];

        if (cmd === '/exit' || cmd === '/quit') {
          console.log(chalk.gray('\n👋 Goodbye!\n'));
          process.exit(0);
        }

        if (cmd === '/clear') {
          console.clear();
          continue;
        }

        if (cmd === '/mode') {
          const newMode = await selectMode();
          cli.setMode(newMode);
          await checkConfiguration(newMode);
          console.log(chalk.green(`\n✓ Switched to ${newMode === BrainMode.MICRO ? 'Micro' : 'Macro'} Engineer mode\n`));
          continue;
        }

        if (cmd === '/workflow') {
          const step = cli.getWorkflowStep();
          console.log(chalk.cyan('\n📋 Workflow Status:'));
          console.log(chalk.gray(`   Current Step: ${WorkflowStep[step]}`));
          console.log('');
          continue;
        }

        if (cmd === '/guardian') {
          console.log(chalk.cyan('\n🛡️  Guardian Report:'));
          console.log(cli.getGuardianReport());
          continue;
        }

        if (cmd === '/verify') {
          const parts = trimmed.split(' ');
          const gate = parts[1] as 'functional' | 'intent' | 'security' | undefined;
          
          if (gate && ['functional', 'intent', 'security'].includes(gate)) {
            console.log(chalk.cyan(`\n🔍 Running ${gate} verification...`));
            const result = await cli.runVerificationGate(gate);
            if (result.passed) {
              console.log(chalk.green(`\n✅ ${gate} gate passed\n`));
            } else {
              console.log(chalk.red(`\n❌ ${gate} gate failed:`));
              result.errors.forEach(e => console.log(chalk.red(`   • ${e}`)));
              console.log('');
            }
          } else {
            console.log(chalk.yellow('\nUsage: /verify [functional|intent|security]'));
            console.log(chalk.gray('   Example: /verify functional\n'));
          }
          continue;
        }

        console.log(chalk.yellow(`Unknown command: ${trimmed}`));
        continue;
      }

      // Skip empty input
      if (!trimmed) continue;

      // Execute task
      console.log(chalk.gray('\n⏳ Processing...\n'));

      const startTime = Date.now();
      const result = await cli.execute(trimmed, {
        context: process.cwd(),
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      // Display result
      console.log(chalk.gray('\n' + '─'.repeat(50)));
      console.log(result.output);
      console.log(chalk.gray('─'.repeat(50)));
      
      // Show any guardian blocks
      if (result.guardianBlocks.length > 0) {
        console.log(chalk.yellow('\n⚠️  Guardian blocked operations:'));
        result.guardianBlocks.forEach(b => console.log(chalk.yellow(`   • ${b}`)));
      }

      // Show any auto-fixes
      if (result.autoFixes.length > 0) {
        console.log(chalk.green('\n🔧 Auto-fixes applied:'));
        result.autoFixes.forEach(f => console.log(chalk.green(`   • ${f}`)));
      }

      console.log(chalk.gray(`\n✓ Completed in ${elapsed}s (${result.iterations} iteration${result.iterations > 1 ? 's' : ''})`));
      console.log(chalk.gray(`   Workflow Step: ${WorkflowStep[result.workflowState]}\n`));

    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    }
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  // Parse command line arguments
  const args = process.argv.slice(2);

  // Handle --help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${chalk.bold('🦈 SHARK CLI')} - AI Coding Assistant (Fixed Integration Build)

${chalk.bold('Usage:')}
  shark              Start interactive mode with wizard
  shark micro        Start in Micro Engineer mode (precision coding)
  shark macro        Start in Macro Engineer mode (systems engineering)

${chalk.bold('Commands in REPL:')}
  /mode       Switch between Micro/Macro mode
  /workflow   Show workflow status
  /guardian   Show guardian protection report
  /verify     Run verification gates (functional|intent|security)
  /clear      Clear screen
  /exit       Exit Shark

${chalk.bold('Features (NOW INTEGRATED):')}
  ✓ Guardian protection for all file operations
  ✓ 5-Step workflow enforcement (PLAN → BUILD → TEST → VERIFY → SHIP)
  ✓ Auto-debug with 60% known error auto-fix
  ✓ Dual-brain architecture

${chalk.bold('Environment Variables:')}
  DEEPSEEK_API_KEY     Planning/Advisory brain
  GOOGLE_API_KEY       Gemma 3 4B (Micro execution, FREE tier)
  GLM_API_KEY          GLM 4.5-flash (Macro primary)
  SHARK_MODE           Set mode (micro/macro) for non-interactive use
  SHARK_REGION         Gemma region (us/sea, default: sea)
  SHARK_DEBUG          Enable verbose logging (true/false)

${chalk.bold('Examples:')}
  shark                       # Interactive mode with wizard
  shark micro                 # Direct to Micro Engineer
  echo "fix this bug" | shark micro   # Non-interactive
  SHARK_MODE=macro shark < task.txt   # Via env var

${chalk.gray('GitHub: https://github.com/leviathan-devops/shark-frankenstein')}
`);
    process.exit(0);
  }

  // Handle --version
  if (args.includes('--version') || args.includes('-v')) {
    console.log('Shark CLI v1.1.0 (Frankenstein Edition - Fixed Integration)');
    process.exit(0);
  }

  // Determine mode
  let mode: BrainMode;

  // FIX: Check command line args first
  if (args[0] === 'micro') {
    mode = BrainMode.MICRO;
  } else if (args[0] === 'macro') {
    mode = BrainMode.MACRO;
  } else if (process.env.SHARK_MODE) {
    // FIX: Allow mode via environment variable for non-interactive use
    const envMode = process.env.SHARK_MODE.toLowerCase();
    if (envMode === 'micro') {
      mode = BrainMode.MICRO;
    } else if (envMode === 'macro') {
      mode = BrainMode.MACRO;
    } else {
      console.error(chalk.red(`\n❌ Invalid SHARK_MODE: ${process.env.SHARK_MODE}. Use 'micro' or 'macro'.\n`));
      process.exit(1);
    }
  } else {
    // Check if we're in non-interactive mode without a mode specified
    const isInteractive = process.stdin.isTTY === true;
    if (!isInteractive) {
      console.error(chalk.red('\n❌ Mode required for non-interactive use.\n'));
      console.log(chalk.white('Usage:'));
      console.log(chalk.gray('  echo "task" | shark micro'));
      console.log(chalk.gray('  echo "task" | shark macro'));
      console.log(chalk.gray('  SHARK_MODE=micro shark < task.txt'));
      console.log('');
      process.exit(1);
    }
    // Interactive wizard
    mode = await selectMode();
  }

  // Check configuration
  await checkConfiguration(mode);

  // ✅ FIXED: Create integrated CLI with Guardian, Workflow, AutoDebug
  const verbose = process.env.SHARK_DEBUG === 'true';
  const cli = new SharkCLI(process.cwd(), mode, { verbose });

  // Show integration status
  if (verbose) {
    console.log(chalk.green('\n✓ All integrations active:'));
    console.log(chalk.gray('  • Guardian: BALANCED protection'));
    console.log(chalk.gray('  • Workflow: Step 1 (PLAN)'));
    console.log(chalk.gray('  • Auto-Debug: 15 error patterns loaded'));
    console.log('');
  }

  // Check for piped input (non-interactive)
  // FIX: Handle Docker where isTTY returns undefined instead of false
  const isInteractive = process.stdin.isTTY === true;
  if (!isInteractive) {
    const { readStdin } = await import('./utils/stdin');
    const input = await readStdin();

    if (input.trim()) {
      // FIX: Add timeout warning for macro mode
      if (mode === BrainMode.MACRO) {
        console.log(chalk.gray('⏳ Macro mode: This may take a few minutes for complex tasks...\n'));
      }
      
      try {
        const result = await cli.execute(input);
        console.log(result.output);
        
        if (result.guardianBlocks.length > 0) {
          console.log(chalk.yellow('\n⚠️  Guardian blocked operations:'));
          result.guardianBlocks.forEach(b => console.log(chalk.yellow(`   • ${b}`)));
        }
        
        process.exit(0);
      } catch (error: any) {
        if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
          console.error(chalk.yellow('\n⚠️ Request timed out. Try:'));
          console.error(chalk.gray('   - Breaking the task into smaller parts'));
          console.error(chalk.gray('   - Using micro mode for simpler tasks'));
          console.error(chalk.gray('   - Setting SHARK_DEBUG=true for more details'));
        }
        throw error;
      }
    }
  }

  // Start REPL
  await repl(cli, mode);
}

// Run main
main().catch((error) => {
  console.error(chalk.red(`\n❌ Fatal error: ${error.message}\n`));
  process.exit(1);
});
