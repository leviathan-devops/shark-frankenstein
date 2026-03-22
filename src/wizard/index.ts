/**
 * 🦈 SHARK CLI - Wizard Module
 * 
 * Interactive mode selection wizard for Shark CLI.
 * Provides a simple, clear interface for users to choose their engineer mode.
 */

import chalk from 'chalk';
import { prompt } from 'enquirer';
import { BrainMode } from '../brain/types';

export interface WizardResult {
  mode: BrainMode;
  confirmed: boolean;
}

/**
 * ASCII art for the wizard
 */
const SHARK_BANNER = `
${chalk.cyan('    ╔═══════════════════════════════════╗')}
${chalk.cyan('    ║')}                                   ${chalk.cyan('║')}
${chalk.cyan('    ║')}      ${chalk.bold.white('🦈 SHARK AGENT')}            ${chalk.cyan('║')}
${chalk.cyan('    ║')}    ${chalk.gray('Dual-Brain Architecture')}       ${chalk.cyan('║')}
${chalk.cyan('    ║')}                                   ${chalk.cyan('║')}
${chalk.cyan('    ╚═══════════════════════════════════╝')}
`;

/**
 * Mode info type
 */
interface ModeInfo {
  title: string;
  emoji: string;
  color: chalk.Chalk;
  description: string;
  details: string[];
  comparison: string;
}

/**
 * Mode descriptions for the wizard
 */
const MODE_INFO: Record<'micro' | 'macro', ModeInfo> = {
  micro: {
    title: 'Micro Engineer',
    emoji: '🦈',
    color: chalk.cyan,
    description: 'Full-Stack AI Coder (FREE)',
    details: [
      'DeepSeek R1 strategist + Gemma 3 4B executor',
      'FREE execution: 14k requests/day via Google AI Studio',
      'Full capabilities: features, refactoring, debugging,',
      '  multi-file work, architecture, tests, DevOps',
    ],
    comparison: 'Like a 10x engineer with infinite stamina - FREE',
  },
  macro: {
    title: 'Macro Engineer',
    emoji: '🧠',
    color: chalk.magenta,
    description: 'Systems Engineering',
    details: [
      'GLM 4.5-flash primary + DeepSeek advisory',
      'Autonomous multi-step execution',
      'Best for: architecture, DevOps, CI/CD',
    ],
    comparison: 'Like Air Force - full engineering capabilities',
  },
};

/**
 * Convert BrainMode enum to string key
 */
function modeToKey(mode: BrainMode): 'micro' | 'macro' {
  return mode === BrainMode.MICRO ? 'micro' : 'macro';
}

/**
 * Run the interactive wizard
 */
export async function runWizard(): Promise<WizardResult> {
  console.log('\n' + SHARK_BANNER);
  console.log(chalk.gray('─'.repeat(40)));
  console.log(chalk.white('  Choose your engineer mode:\n'));

  const { mode } = await prompt<{
    mode: 'micro' | 'macro';
  }>({
    type: 'select',
    name: 'mode',
    message: 'Mode',
    choices: [
      {
        name: 'micro',
        message: chalk.cyan('🦈 Micro') + chalk.gray(' - Full-stack AI coder (FREE)'),
        hint: 'DeepSeek R1 + Gemma 3 4B - Complete engineering',
      },
      {
        name: 'macro',
        message: chalk.magenta('🧠 Macro') + chalk.gray(' - Autonomous systems'),
        hint: 'GLM 4.5 + DeepSeek R1 - Complex orchestration',
      },
    ],
  });

  // Show mode details
  const info = MODE_INFO[mode];
  console.log('\n' + chalk.gray('─'.repeat(40)));
  console.log(info.color(`\n  ${info.emoji} ${info.title} - ${info.description}\n`));
  info.details.forEach((detail) => {
    console.log(chalk.white(`  • ${detail}`));
  });
  console.log(chalk.gray(`\n  ${info.comparison}\n`));
  console.log(chalk.gray('─'.repeat(40)));

  const { confirm } = await prompt<{ confirm: boolean }>({
    type: 'confirm',
    name: 'confirm',
    message: `Start ${info.title}?`,
    initial: true,
  });

  return {
    mode: mode === 'micro' ? BrainMode.MICRO : BrainMode.MACRO,
    confirmed: confirm,
  };
}

/**
 * Quick mode switch wizard
 */
export async function switchMode(currentMode: BrainMode): Promise<BrainMode> {
  const currentKey = modeToKey(currentMode);
  const targetKey = currentKey === 'micro' ? 'macro' : 'micro';
  
  const currentInfo = MODE_INFO[currentKey];
  const targetInfo = MODE_INFO[targetKey];

  console.log(chalk.gray(`\n  Currently: ${currentInfo.color(currentInfo.title)}`));
  console.log(chalk.gray('\n  Switch to:\n'));

  const { confirm } = await prompt<{ confirm: boolean }>({
    type: 'confirm',
    name: 'confirm',
    message: `Switch to ${targetInfo.title}?`,
    initial: true,
  });

  if (confirm) {
    return targetKey === 'micro' ? BrainMode.MICRO : BrainMode.MACRO;
  }

  return currentMode;
}

/**
 * Display API key setup instructions
 */
export function displaySetupInstructions(mode: BrainMode): void {
  console.log(chalk.yellow('\n  ⚠  API Key Setup Required\n'));

  if (mode === BrainMode.MICRO) {
    console.log(chalk.white('  Micro Engineer requires:\n'));
    console.log('  • Gemma API Key (required for execution)');
    console.log(chalk.gray('    Get free: https://aistudio.google.com/apikey'));
    console.log(chalk.gray('    export GOOGLE_API_KEY=your-key\n'));
    console.log('  • DeepSeek API Key (optional, for planning)');
    console.log(chalk.gray('    Get: https://platform.deepseek.com'));
    console.log(chalk.gray('    export DEEPSEEK_API_KEY=your-key\n'));
  } else {
    console.log(chalk.white('  Macro Engineer requires:\n'));
    console.log('  • GLM API Key (required for execution)');
    console.log(chalk.gray('    export GLM_API_KEY=your-key\n'));
    console.log('  • DeepSeek API Key (recommended, for advisory)');
    console.log(chalk.gray('    Get: https://platform.deepseek.com'));
    console.log(chalk.gray('    export DEEPSEEK_API_KEY=your-key\n'));
  }
}

export default { runWizard, switchMode, displaySetupInstructions };
