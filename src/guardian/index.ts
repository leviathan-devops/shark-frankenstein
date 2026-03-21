/**
 * 🦈 SHARK CLI - Guardian Module
 * 
 * File protection system for critical files.
 * Implements chattr +i (Linux) and chflags schg (macOS) for kernel-level immutability.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export enum ProtectionStatus {
  UNPROTECTED = 'unprotected',
  PROTECTED = 'protected',
  LOCKED = 'locked',
}

export enum ModificationDecision {
  ALLOW = 'allow',
  DENY = 'deny',
  PROMPT = 'prompt',
  BACKUP_THEN_ALLOW = 'backup_then_allow',
}

export interface GuardianConfig {
  enabled: boolean;
  protectedFiles: string[];
  autoBackup: boolean;
  promptOnModify: boolean;
}

export interface FileInfo {
  path: string;
  status: ProtectionStatus;
  isProtected: boolean;
  canModify: boolean;
}

/**
 * Check the current platform
 */
function getPlatform(): 'linux' | 'darwin' | 'other' {
  switch (process.platform) {
    case 'linux':
      return 'linux';
    case 'darwin':
      return 'darwin';
    default:
      return 'other';
  }
}

/**
 * Check if running as root/sudo
 */
function isRoot(): boolean {
  return process.getuid?.() === 0;
}

/**
 * Guardian - File Protection System
 */
export class Guardian {
  private config: GuardianConfig;
  private protectedFiles: Set<string>;

  constructor(config?: Partial<GuardianConfig>) {
    this.config = {
      enabled: true,
      protectedFiles: [],
      autoBackup: true,
      promptOnModify: true,
      ...config,
    };
    this.protectedFiles = new Set(this.config.protectedFiles);
  }

  /**
   * Protect a file from modification
   */
  async protect(filePath: string): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    const absolutePath = path.resolve(filePath);
    const platform = getPlatform();

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    try {
      if (platform === 'linux') {
        // Use chattr +i for immutable flag
        if (!isRoot()) {
          console.warn('⚠️  File protection on Linux requires root privileges');
          return false;
        }
        execSync(`chattr +i "${absolutePath}"`, { stdio: 'pipe' });
      } else if (platform === 'darwin') {
        // Use chflags schg for system immutable
        if (!isRoot()) {
          console.warn('⚠️  File protection on macOS requires root privileges');
          return false;
        }
        execSync(`chflags schg "${absolutePath}"`, { stdio: 'pipe' });
      } else {
        console.warn('⚠️  File protection not supported on this platform');
        return false;
      }

      this.protectedFiles.add(absolutePath);
      return true;
    } catch (error: any) {
      console.error(`Failed to protect file: ${error.message}`);
      return false;
    }
  }

  /**
   * Unprotect a file
   */
  async unprotect(filePath: string): Promise<boolean> {
    const absolutePath = path.resolve(filePath);
    const platform = getPlatform();

    try {
      if (platform === 'linux') {
        if (isRoot()) {
          execSync(`chattr -i "${absolutePath}"`, { stdio: 'pipe' });
        }
      } else if (platform === 'darwin') {
        if (isRoot()) {
          execSync(`chflags noschg "${absolutePath}"`, { stdio: 'pipe' });
        }
      }

      this.protectedFiles.delete(absolutePath);
      return true;
    } catch (error: any) {
      console.error(`Failed to unprotect file: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a file is protected
   */
  isProtected(filePath: string): boolean {
    const absolutePath = path.resolve(filePath);
    return this.protectedFiles.has(absolutePath);
  }

  /**
   * Check modification permission for a file
   */
  checkModification(filePath: string): ModificationDecision {
    if (!this.config.enabled) {
      return ModificationDecision.ALLOW;
    }

    const absolutePath = path.resolve(filePath);

    if (this.protectedFiles.has(absolutePath)) {
      return this.config.promptOnModify 
        ? ModificationDecision.PROMPT 
        : ModificationDecision.DENY;
    }

    return ModificationDecision.ALLOW;
  }

  /**
   * Get file info
   */
  getFileInfo(filePath: string): FileInfo {
    const absolutePath = path.resolve(filePath);
    const isProtected = this.protectedFiles.has(absolutePath);

    return {
      path: absolutePath,
      status: isProtected ? ProtectionStatus.PROTECTED : ProtectionStatus.UNPROTECTED,
      isProtected,
      canModify: !isProtected,
    };
  }

  /**
   * List all protected files
   */
  listProtected(): string[] {
    return Array.from(this.protectedFiles);
  }

  /**
   * Enable guardian
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * Disable guardian
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Check if guardian is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

export default Guardian;
