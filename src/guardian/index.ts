/**
 * 🦈 SHARK CLI - Guardian Module v2.0
 * 
 * Comprehensive agent safety rail for ALL environments.
 * Protects local device during Stage 2 testing and all agent operations.
 * 
 * GUARDIAN IS NOT JUST FOR DOCKER - IT'S FOR ALL AGENT BEHAVIOR.
 * 
 * Features:
 * - Protected zone boundaries (workspace vs system)
 * - Critical system file protection
 * - Operation audit logging
 * - Sandbox mode for testing
 * - Configurable protection levels
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

// ============================================================================
// TYPES & ENUMS
// ============================================================================

export enum ProtectionLevel {
  /** Maximum protection - only explicit workspace allowed */
  STRICT = 'strict',
  /** Balanced protection - workspace + common dev folders */
  BALANCED = 'balanced',
  /** Minimal protection - only critical system files blocked */
  PERMISSIVE = 'permissive',
  /** Testing mode - isolated sandbox, no system access */
  SANDBOX = 'sandbox',
}

export enum ProtectionStatus {
  UNPROTECTED = 'unprotected',
  PROTECTED = 'protected',
  LOCKED = 'locked',
  BLOCKED = 'blocked',
}

export enum ModificationDecision {
  ALLOW = 'allow',
  DENY = 'deny',
  PROMPT = 'prompt',
  BACKUP_THEN_ALLOW = 'backup_then_allow',
  SANDBOX_REDIRECT = 'sandbox_redirect',
}

export enum ZoneType {
  /** Safe workspace for agent operations */
  WORKSPACE = 'workspace',
  /** Sandbox for isolated testing */
  SANDBOX = 'sandbox',
  /** System directories - NEVER modify */
  SYSTEM = 'system',
  /** User personal files - protected by default */
  PERSONAL = 'personal',
  /** Development folders - allowed with caution */
  DEVELOPMENT = 'development',
  /** Configuration files - protected */
  CONFIG = 'config',
}

export interface GuardianConfig {
  enabled: boolean;
  level: ProtectionLevel;
  workspacePath: string;
  sandboxPath: string;
  protectedFiles: string[];
  protectedDirectories: string[];
  allowedDirectories: string[];
  autoBackup: boolean;
  promptOnModify: boolean;
  auditLog: boolean;
  auditLogPath?: string;
}

export interface FileInfo {
  path: string;
  status: ProtectionStatus;
  isProtected: boolean;
  canModify: boolean;
  zone: ZoneType;
  reason?: string;
}

export interface AuditEntry {
  timestamp: Date;
  operation: 'read' | 'write' | 'delete' | 'execute' | 'protect' | 'unprotect';
  path: string;
  decision: ModificationDecision;
  reason: string;
  success: boolean;
}

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

type Platform = 'linux' | 'darwin' | 'win32' | 'other';

function getPlatform(): Platform {
  return process.platform as Platform;
}

function isRoot(): boolean {
  return process.getuid?.() === 0;
}

// ============================================================================
// CRITICAL SYSTEM PATHS - NEVER TOUCH THESE
// ============================================================================

const CRITICAL_SYSTEM_PATHS: Record<Platform, string[]> = {
  linux: [
    '/bin', '/sbin', '/usr/bin', '/usr/sbin',
    '/lib', '/lib64', '/usr/lib', '/usr/lib64',
    '/etc', '/var', '/proc', '/sys', '/dev',
    '/boot', '/root', '/srv',
    '/usr/share', '/usr/include',
    // Package managers
    '/var/lib/dpkg', '/var/lib/rpm', '/var/lib/pacman',
    // Systemd
    '/etc/systemd', '/lib/systemd',
  ],
  darwin: [
    '/System', '/Library', '/Applications',
    '/usr', '/bin', '/sbin',
    '/etc', '/var', '/dev',
    '/cores', '/private',
    // Homebrew protection
    '/usr/local/Cellar', '/opt/homebrew',
  ],
  win32: [
    'C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)',
    'C:\\ProgramData', 'C:\\Users\\Public',
    // System drives
    process.env.SystemRoot || 'C:\\Windows',
    process.env.ProgramFiles || 'C:\\Program Files',
  ],
  other: [],
};

// Personal/sensitive directories
const PERSONAL_PATHS: string[] = [
  // Home directory sensitive folders
  '.ssh', '.gnupg', '.password-store', '.config/gh',
  '.aws', '.azure', '.gcloud', '.kube',
  '.env', '.env.local', '.env.*.local',
  // Credentials
  'credentials', 'secrets', '.secrets',
  // Financial/personal
  'Documents/Financial', 'Documents/Taxes',
  'Desktop', 'Downloads',
];

// Development directories (allowed with caution)
const DEV_DIRECTORIES: string[] = [
  'Projects', 'projects', 'code', 'Code', 'dev', 'Dev',
  'workspace', 'Workspace', 'repos', 'Repos',
  'src', 'Source', 'development',
];

// ============================================================================
// GUARDIAN CLASS
// ============================================================================

/**
 * Guardian - Agent Safety Rail System
 * 
 * Protects the host system during ALL agent operations, not just Docker.
 * This is the core safety mechanism that prevents agents from:
 * - Modifying system files
 * - Accessing personal credentials
 * - Breaking critical configurations
 * - Escaping designated workspace boundaries
 */
export class Guardian {
  private config: GuardianConfig;
  private protectedFiles: Set<string>;
  private auditLog: AuditEntry[] = [];
  private homeDir: string;
  private platform: Platform;

  constructor(config?: Partial<GuardianConfig>) {
    this.homeDir = os.homedir();
    this.platform = getPlatform();
    
    // Default configuration
    this.config = {
      enabled: true,
      level: ProtectionLevel.BALANCED,
      workspacePath: process.cwd(),
      sandboxPath: path.join(os.tmpdir(), 'shark-sandbox'),
      protectedFiles: [],
      protectedDirectories: [],
      allowedDirectories: [],
      autoBackup: true,
      promptOnModify: false, // For automated agents
      auditLog: true,
      ...config,
    };

    this.protectedFiles = new Set(this.config.protectedFiles);
    
    // Initialize sandbox if needed
    if (this.config.level === ProtectionLevel.SANDBOX) {
      this.initializeSandbox();
    }
  }

  // ==========================================================================
  // SANDBOX MANAGEMENT
  // ==========================================================================

  /**
   * Initialize isolated sandbox environment
   */
  private initializeSandbox(): void {
    const sandboxPath = this.config.sandboxPath;
    
    if (!fs.existsSync(sandboxPath)) {
      fs.mkdirSync(sandboxPath, { recursive: true, mode: 0o700 });
    }
    
    // Create sandbox structure
    const sandboxDirs = ['workspace', 'output', 'cache', 'logs'];
    for (const dir of sandboxDirs) {
      const fullPath = path.join(sandboxPath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true, mode: 0o700 });
      }
    }
    
    this.logAudit({
      timestamp: new Date(),
      operation: 'execute',
      path: sandboxPath,
      decision: ModificationDecision.ALLOW,
      reason: 'Sandbox initialization',
      success: true,
    });
  }

  /**
   * Enter sandbox mode - all operations redirected to isolated environment
   */
  enterSandboxMode(): void {
    this.config.level = ProtectionLevel.SANDBOX;
    this.initializeSandbox();
  }

  /**
   * Exit sandbox mode
   */
  exitSandboxMode(): void {
    this.config.level = ProtectionLevel.BALANCED;
  }

  /**
   * Get sandbox path for a given file path
   */
  getSandboxPath(originalPath: string): string {
    const basename = path.basename(originalPath);
    return path.join(this.config.sandboxPath, 'workspace', basename);
  }

  // ==========================================================================
  // ZONE CLASSIFICATION
  // ==========================================================================

  /**
   * Classify a path into a zone type
   */
  classifyPath(filePath: string): { zone: ZoneType; reason: string } {
    const absolutePath = path.resolve(filePath);
    const normalizedPath = path.normalize(absolutePath).toLowerCase();
    
    // Check if in workspace
    const workspaceNormalized = path.normalize(this.config.workspacePath).toLowerCase();
    if (normalizedPath.startsWith(workspaceNormalized)) {
      return { zone: ZoneType.WORKSPACE, reason: 'Within designated workspace' };
    }
    
    // Check if in sandbox
    const sandboxNormalized = path.normalize(this.config.sandboxPath).toLowerCase();
    if (normalizedPath.startsWith(sandboxNormalized)) {
      return { zone: ZoneType.SANDBOX, reason: 'Within sandbox environment' };
    }
    
    // Check critical system paths
    const criticalPaths = CRITICAL_SYSTEM_PATHS[this.platform] || [];
    for (const sysPath of criticalPaths) {
      if (normalizedPath.startsWith(sysPath.toLowerCase())) {
        return { zone: ZoneType.SYSTEM, reason: `Critical system path: ${sysPath}` };
      }
    }
    
    // Check personal paths
    const homeNormalized = this.homeDir.toLowerCase();
    if (normalizedPath.startsWith(homeNormalized)) {
      const relativePath = normalizedPath.slice(homeNormalized.length);
      for (const personalPath of PERSONAL_PATHS) {
        if (relativePath.includes(personalPath.toLowerCase())) {
          return { zone: ZoneType.PERSONAL, reason: `Personal/sensitive path: ${personalPath}` };
        }
      }
      
      // Check development directories
      for (const devPath of DEV_DIRECTORIES) {
        if (relativePath.includes(devPath.toLowerCase())) {
          return { zone: ZoneType.DEVELOPMENT, reason: `Development directory: ${devPath}` };
        }
      }
    }
    
    // Check config files
    const configPatterns = ['.json', '.yaml', '.yml', '.toml', '.ini', '.conf', '.config'];
    const basename = path.basename(normalizedPath);
    if (configPatterns.some(ext => basename.endsWith(ext))) {
      if (normalizedPath.includes('/etc/') || normalizedPath.includes('\\etc\\')) {
        return { zone: ZoneType.CONFIG, reason: 'System configuration file' };
      }
    }
    
    return { zone: ZoneType.PERSONAL, reason: 'Outside workspace - requires permission' };
  }

  // ==========================================================================
  // PERMISSION CHECKS
  // ==========================================================================

  /**
   * Check if an operation is allowed on a path
   */
  checkPermission(filePath: string, operation: 'read' | 'write' | 'delete' = 'write'): ModificationDecision {
    if (!this.config.enabled) {
      return ModificationDecision.ALLOW;
    }

    const absolutePath = path.resolve(filePath);
    const { zone, reason } = this.classifyPath(absolutePath);
    
    // Sandbox mode - redirect all writes to sandbox
    if (this.config.level === ProtectionLevel.SANDBOX && operation !== 'read') {
      return ModificationDecision.SANDBOX_REDIRECT;
    }
    
    // System zone - ALWAYS DENY
    if (zone === ZoneType.SYSTEM) {
      this.logAudit({
        timestamp: new Date(),
        operation,
        path: absolutePath,
        decision: ModificationDecision.DENY,
        reason: `BLOCKED: ${reason}`,
        success: false,
      });
      return ModificationDecision.DENY;
    }
    
    // Protected file
    if (this.protectedFiles.has(absolutePath)) {
      return this.config.promptOnModify 
        ? ModificationDecision.PROMPT 
        : ModificationDecision.DENY;
    }
    
    // Check based on protection level
    switch (this.config.level) {
      case ProtectionLevel.STRICT:
        // Only workspace allowed
        if (zone === ZoneType.WORKSPACE || zone === ZoneType.SANDBOX) {
          return ModificationDecision.ALLOW;
        }
        if (this.config.autoBackup && operation === 'write') {
          return ModificationDecision.BACKUP_THEN_ALLOW;
        }
        return ModificationDecision.DENY;
        
      case ProtectionLevel.BALANCED:
        // Workspace + development allowed, personal blocked
        if (zone === ZoneType.WORKSPACE || zone === ZoneType.SANDBOX || zone === ZoneType.DEVELOPMENT) {
          return ModificationDecision.ALLOW;
        }
        if (zone === ZoneType.PERSONAL || zone === ZoneType.CONFIG) {
          this.logAudit({
            timestamp: new Date(),
            operation,
            path: absolutePath,
            decision: ModificationDecision.DENY,
            reason: `Protected zone: ${zone}`,
            success: false,
          });
          return ModificationDecision.DENY;
        }
        return ModificationDecision.PROMPT;
        
      case ProtectionLevel.PERMISSIVE:
        // System already blocked above, allow everything else
        return ModificationDecision.ALLOW;
        
      case ProtectionLevel.SANDBOX:
        // All writes go to sandbox
        return ModificationDecision.SANDBOX_REDIRECT;
        
      default:
        return ModificationDecision.DENY;
    }
  }

  /**
   * Check modification permission (convenience method)
   */
  checkModification(filePath: string): ModificationDecision {
    return this.checkPermission(filePath, 'write');
  }

  // ==========================================================================
  // FILE OPERATIONS WITH PROTECTION
  // ==========================================================================

  /**
   * Safely write a file with Guardian protection
   */
  async safeWrite(filePath: string, content: string | Buffer): Promise<{ success: boolean; actualPath: string; reason?: string }> {
    const decision = this.checkPermission(filePath, 'write');
    const absolutePath = path.resolve(filePath);
    
    switch (decision) {
      case ModificationDecision.ALLOW:
        fs.writeFileSync(absolutePath, content);
        this.logAudit({
          timestamp: new Date(),
          operation: 'write',
          path: absolutePath,
          decision,
          reason: 'Allowed - within permitted zone',
          success: true,
        });
        return { success: true, actualPath: absolutePath };
        
      case ModificationDecision.SANDBOX_REDIRECT:
        const sandboxPath = this.getSandboxPath(absolutePath);
        fs.writeFileSync(sandboxPath, content);
        this.logAudit({
          timestamp: new Date(),
          operation: 'write',
          path: absolutePath,
          decision,
          reason: 'Redirected to sandbox',
          success: true,
        });
        return { success: true, actualPath: sandboxPath, reason: 'Written to sandbox' };
        
      case ModificationDecision.BACKUP_THEN_ALLOW:
        const backupPath = `${absolutePath}.guardian-backup-${Date.now()}`;
        if (fs.existsSync(absolutePath)) {
          fs.copyFileSync(absolutePath, backupPath);
        }
        fs.writeFileSync(absolutePath, content);
        this.logAudit({
          timestamp: new Date(),
          operation: 'write',
          path: absolutePath,
          decision,
          reason: `Backup created: ${backupPath}`,
          success: true,
        });
        return { success: true, actualPath: absolutePath, reason: `Backup: ${backupPath}` };
        
      case ModificationDecision.DENY:
        return { success: false, actualPath: absolutePath, reason: 'Operation denied by Guardian' };
        
      case ModificationDecision.PROMPT:
        // For automated agents, prompt = deny
        return { success: false, actualPath: absolutePath, reason: 'Prompt required - denied in automated mode' };
        
      default:
        return { success: false, actualPath: absolutePath, reason: 'Unknown decision' };
    }
  }

  /**
   * Safely delete a file with Guardian protection
   */
  async safeDelete(filePath: string): Promise<{ success: boolean; reason?: string }> {
    const decision = this.checkPermission(filePath, 'delete');
    const absolutePath = path.resolve(filePath);
    
    if (decision === ModificationDecision.ALLOW) {
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
      this.logAudit({
        timestamp: new Date(),
        operation: 'delete',
        path: absolutePath,
        decision,
        reason: 'Allowed',
        success: true,
      });
      return { success: true };
    }
    
    return { success: false, reason: `Deletion denied: ${decision}` };
  }

  /**
   * Safely read a file with Guardian logging
   */
  async safeRead(filePath: string): Promise<{ success: boolean; content?: string | Buffer; reason?: string }> {
    const decision = this.checkPermission(filePath, 'read');
    const absolutePath = path.resolve(filePath);
    
    if (decision === ModificationDecision.DENY) {
      return { success: false, reason: 'Read denied by Guardian' };
    }
    
    if (!fs.existsSync(absolutePath)) {
      return { success: false, reason: 'File not found' };
    }
    
    const content = fs.readFileSync(absolutePath);
    this.logAudit({
      timestamp: new Date(),
      operation: 'read',
      path: absolutePath,
      decision: ModificationDecision.ALLOW,
      reason: 'Read allowed',
      success: true,
    });
    
    return { success: true, content };
  }

  // ==========================================================================
  // KERNEL-LEVEL PROTECTION (requires root)
  // ==========================================================================

  /**
   * Apply kernel-level immutability (requires root/sudo)
   */
  async protect(filePath: string): Promise<boolean> {
    if (!this.config.enabled) return false;

    const absolutePath = path.resolve(filePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    try {
      if (this.platform === 'linux' && isRoot()) {
        execSync(`chattr +i "${absolutePath}"`, { stdio: 'pipe' });
        this.protectedFiles.add(absolutePath);
        return true;
      } else if (this.platform === 'darwin' && isRoot()) {
        execSync(`chflags schg "${absolutePath}"`, { stdio: 'pipe' });
        this.protectedFiles.add(absolutePath);
        return true;
      } else {
        // Software-level protection
        this.protectedFiles.add(absolutePath);
        return true;
      }
    } catch (error: any) {
      console.error(`Guardian: Failed to protect ${absolutePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Remove kernel-level immutability
   */
  async unprotect(filePath: string): Promise<boolean> {
    const absolutePath = path.resolve(filePath);

    try {
      if (this.platform === 'linux' && isRoot()) {
        execSync(`chattr -i "${absolutePath}"`, { stdio: 'pipe' });
      } else if (this.platform === 'darwin' && isRoot()) {
        execSync(`chflags noschg "${absolutePath}"`, { stdio: 'pipe' });
      }
      this.protectedFiles.delete(absolutePath);
      return true;
    } catch (error: any) {
      console.error(`Guardian: Failed to unprotect ${absolutePath}: ${error.message}`);
      return false;
    }
  }

  // ==========================================================================
  // AUDIT & LOGGING
  // ==========================================================================

  /**
   * Log an audit entry
   */
  private logAudit(entry: AuditEntry): void {
    if (!this.config.auditLog) return;
    
    this.auditLog.push(entry);
    
    // Write to file if path specified
    if (this.config.auditLogPath) {
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.config.auditLogPath, logLine);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Export audit log to file
   */
  exportAuditLog(outputPath: string): void {
    const content = this.auditLog.map(entry => JSON.stringify(entry)).join('\n');
    fs.writeFileSync(outputPath, content);
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Check if a file is protected
   */
  isProtected(filePath: string): boolean {
    const absolutePath = path.resolve(filePath);
    return this.protectedFiles.has(absolutePath);
  }

  /**
   * Get file info with zone classification
   */
  getFileInfo(filePath: string): FileInfo {
    const absolutePath = path.resolve(filePath);
    const { zone, reason } = this.classifyPath(absolutePath);
    const isProtected = this.protectedFiles.has(absolutePath);
    const decision = this.checkModification(absolutePath);

    return {
      path: absolutePath,
      status: isProtected ? ProtectionStatus.PROTECTED : 
              zone === ZoneType.SYSTEM ? ProtectionStatus.BLOCKED : ProtectionStatus.UNPROTECTED,
      isProtected,
      canModify: decision === ModificationDecision.ALLOW,
      zone,
      reason,
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
   * Disable guardian (use with caution)
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

  /**
   * Get current protection level
   */
  getProtectionLevel(): ProtectionLevel {
    return this.config.level;
  }

  /**
   * Set protection level
   */
  setProtectionLevel(level: ProtectionLevel): void {
    this.config.level = level;
    if (level === ProtectionLevel.SANDBOX) {
      this.initializeSandbox();
    }
  }

  /**
   * Get workspace path
   */
  getWorkspacePath(): string {
    return this.config.workspacePath;
  }

  /**
   * Set workspace path
   */
  setWorkspacePath(workspacePath: string): void {
    this.config.workspacePath = path.resolve(workspacePath);
  }

  /**
   * Generate a protection report
   */
  generateReport(): string {
    const lines = [
      '# 🦈 Guardian Protection Report',
      '',
      `**Generated**: ${new Date().toISOString()}`,
      `**Protection Level**: ${this.config.level}`,
      `**Platform**: ${this.platform}`,
      `**Enabled**: ${this.config.enabled}`,
      '',
      '## Configuration',
      `- Workspace: ${this.config.workspacePath}`,
      `- Sandbox: ${this.config.sandboxPath}`,
      `- Auto Backup: ${this.config.autoBackup}`,
      `- Audit Logging: ${this.config.auditLog}`,
      '',
      '## Protected Files',
      ...Array.from(this.protectedFiles).map(f => `- ${f}`),
      '',
      '## Audit Summary',
      `- Total Operations: ${this.auditLog.length}`,
      `- Denied: ${this.auditLog.filter(e => e.decision === ModificationDecision.DENY).length}`,
      `- Allowed: ${this.auditLog.filter(e => e.decision === ModificationDecision.ALLOW).length}`,
      `- Sandbox Redirects: ${this.auditLog.filter(e => e.decision === ModificationDecision.SANDBOX_REDIRECT).length}`,
    ];
    
    return lines.join('\n');
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a Guardian for testing mode (sandboxed)
 */
export function createTestGuardian(testWorkspace: string): Guardian {
  return new Guardian({
    level: ProtectionLevel.SANDBOX,
    workspacePath: testWorkspace,
    auditLog: true,
    autoBackup: true,
  });
}

/**
 * Create a Guardian for production use
 */
export function createProductionGuardian(workspacePath: string): Guardian {
  return new Guardian({
    level: ProtectionLevel.BALANCED,
    workspacePath,
    auditLog: true,
    autoBackup: true,
  });
}

/**
 * Create a Guardian for CI/CD (strict mode)
 */
export function createCIGuardian(workspacePath: string): Guardian {
  return new Guardian({
    level: ProtectionLevel.STRICT,
    workspacePath,
    auditLog: true,
    autoBackup: false,
  });
}

export default Guardian;
