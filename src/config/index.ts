/**
 * 🦈 SHARK CLI - Configuration Module
 */

import * as fs from 'fs';
import * as path from 'path';
import { BrainMode, GemmaApiRegion } from '../brain/types';

export interface SharkConfig {
  /** Default brain mode */
  mode: BrainMode;
  
  /** Gemma API region (US or SEA) */
  gemmaRegion: GemmaApiRegion;
  
  /** Maximum iterations for coordination loop */
  maxIterations: number;
  
  /** Auto-approve mode */
  autoApprove: boolean;
  
  /** Verbose logging */
  verbose: boolean;
  
  /** Working directory */
  workingDirectory: string;
  
  /** Guardian settings */
  guardian: {
    enabled: boolean;
    protectedFiles: string[];
    autoBackup: boolean;
  };
}

export const DEFAULT_CONFIG: SharkConfig = {
  mode: BrainMode.MICRO,
  gemmaRegion: 'sea',
  maxIterations: 10,
  autoApprove: false,
  verbose: false,
  workingDirectory: process.cwd(),
  guardian: {
    enabled: true,
    protectedFiles: [],
    autoBackup: true,
  },
};

const CONFIG_FILE_NAME = '.sharkrc.json';

/**
 * Load configuration from file and environment
 */
export function loadConfig(projectDir: string = process.cwd()): SharkConfig {
  const config = { ...DEFAULT_CONFIG };

  // Try to load from project directory
  const projectConfigPath = path.join(projectDir, CONFIG_FILE_NAME);
  if (fs.existsSync(projectConfigPath)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf-8'));
      Object.assign(config, fileConfig);
    } catch (error) {
      console.warn(`Warning: Could not parse ${projectConfigPath}`);
    }
  }

  // Try to load from home directory
  const homeConfigPath = path.join(process.env.HOME || '~', CONFIG_FILE_NAME);
  if (fs.existsSync(homeConfigPath)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(homeConfigPath, 'utf-8'));
      Object.assign(config, fileConfig);
    } catch (error) {
      console.warn(`Warning: Could not parse ${homeConfigPath}`);
    }
  }

  // Override with environment variables
  if (process.env.SHARK_MODE) {
    config.mode = process.env.SHARK_MODE as BrainMode;
  }
  if (process.env.SHARK_REGION) {
    config.gemmaRegion = process.env.SHARK_REGION as GemmaApiRegion;
  }
  if (process.env.SHARK_DEBUG) {
    config.verbose = true;
  }
  if (process.env.SHARK_AUTO_APPROVE) {
    config.autoApprove = true;
  }

  return config;
}

/**
 * Save configuration to file
 */
export function saveConfig(config: Partial<SharkConfig>, projectDir: string = process.cwd()): void {
  const configPath = path.join(projectDir, CONFIG_FILE_NAME);
  const existingConfig = fs.existsSync(configPath) 
    ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    : {};
  
  const mergedConfig = { ...existingConfig, ...config };
  fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
}

/**
 * Get API keys from environment
 */
export function getApiKeys(): {
  deepseek: string | undefined;
  gemma: string | undefined;
  glm: string | undefined;
} {
  return {
    deepseek: process.env.DEEPSEEK_API_KEY,
    gemma: process.env.GOOGLE_API_KEY || process.env.GEMMA_API_KEY,
    glm: process.env.GLM_API_KEY || process.env.GLM_CODING_PLAN_KEY,
  };
}

/**
 * Validate configuration for a given mode
 */
export function validateConfig(config: SharkConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const keys = getApiKeys();

  // ALL API keys are MANDATORY - no optional keys
  if (config.mode === BrainMode.MICRO) {
    // Micro requires Gemma (execution) + DeepSeek (planning)
    if (!keys.gemma) {
      errors.push('GOOGLE_API_KEY is required for Micro Engineer mode (Gemma execution brain)');
    }
    if (!keys.deepseek) {
      errors.push('DEEPSEEK_API_KEY is required for Micro Engineer mode (DeepSeek planning brain)');
    }
  } else if (config.mode === BrainMode.MACRO) {
    // Macro requires GLM (primary) + DeepSeek (advisory)
    if (!keys.glm) {
      errors.push('GLM_API_KEY or GLM_CODING_PLAN_KEY is required for Macro Engineer mode');
    }
    if (!keys.deepseek) {
      errors.push('DEEPSEEK_API_KEY is required for Macro Engineer mode (DeepSeek advisory brain)');
    }
  }

  // Validate Gemma region
  if (config.gemmaRegion !== 'us' && config.gemmaRegion !== 'sea') {
    errors.push(`Invalid Gemma region '${config.gemmaRegion}'. Must be 'us' or 'sea'.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
