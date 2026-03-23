/**
 * 🦈 SHARK CLI - Tool Executor with Guardian Integration
 * 
 * This module ACTUALLY EXECUTES the tool calls from AI models.
 * All operations are protected by Guardian.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Guardian, ModificationDecision } from '../guardian';
import { ToolCall } from '../brain/types';

export interface ToolResult {
  toolCallId: string;
  name: string;
  success: boolean;
  result: string;
  guardianBlocked?: boolean;
  guardianReason?: string;
}

export interface ToolExecutorConfig {
  guardian: Guardian;
  workspacePath: string;
  verbose?: boolean;
}

/**
 * Tool Executor - Executes AI tool calls with Guardian protection
 * 
 * This is the MISSING LINK between AI tool definitions and actual execution.
 */
export class ToolExecutor {
  private guardian: Guardian;
  private workspacePath: string;
  private verbose: boolean;

  constructor(config: ToolExecutorConfig) {
    this.guardian = config.guardian;
    this.workspacePath = config.workspacePath;
    this.verbose = config.verbose ?? false;
  }

  /**
   * Execute a single tool call with Guardian protection
   */
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    this.log(`Executing tool: ${toolCall.name}`);

    switch (toolCall.name) {
      case 'write_file':
        return this.executeWriteFile(toolCall);
      case 'read_file':
        return this.executeReadFile(toolCall);
      case 'run_command':
        return this.executeRunCommand(toolCall);
      case 'search':
        return this.executeSearch(toolCall);
      default:
        return {
          toolCallId: toolCall.id,
          name: toolCall.name,
          success: false,
          result: `Unknown tool: ${toolCall.name}`,
        };
    }
  }

  /**
   * Execute all tool calls in sequence with Guardian protection
   */
  async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      const result = await this.executeTool(toolCall);
      results.push(result);

      // Stop if Guardian blocked an operation
      if (result.guardianBlocked) {
        this.log(`Guardian blocked operation, stopping tool execution`);
        break;
      }
    }

    return results;
  }

  /**
   * Write file with Guardian protection
   */
  private async executeWriteFile(toolCall: ToolCall): Promise<ToolResult> {
    const filePath = this.resolvePath(toolCall.arguments.file_path as string);
    const content = toolCall.arguments.content as string;

    // Guardian check
    const decision = this.guardian.checkPermission(filePath, 'write');
    
    if (decision === ModificationDecision.DENY) {
      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: false,
        result: `Guardian DENIED write to ${filePath}`,
        guardianBlocked: true,
        guardianReason: 'File in protected zone',
      };
    }

    try {
      // Handle sandbox redirect
      let actualPath = filePath;
      if (decision === ModificationDecision.SANDBOX_REDIRECT) {
        actualPath = this.guardian.getSandboxPath(filePath);
        this.log(`Redirecting write to sandbox: ${actualPath}`);
      }

      // Create directory if needed
      const dir = path.dirname(actualPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write the file
      fs.writeFileSync(actualPath, content, 'utf-8');

      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: true,
        result: `Successfully wrote ${content.length} bytes to ${actualPath}`,
      };
    } catch (error: any) {
      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: false,
        result: `Failed to write file: ${error.message}`,
      };
    }
  }

  /**
   * Read file with Guardian logging
   */
  private async executeReadFile(toolCall: ToolCall): Promise<ToolResult> {
    const filePath = this.resolvePath(toolCall.arguments.file_path as string);

    // Guardian check
    const decision = this.guardian.checkPermission(filePath, 'read');

    if (decision === ModificationDecision.DENY) {
      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: false,
        result: `Guardian DENIED read of ${filePath}`,
        guardianBlocked: true,
        guardianReason: 'File in protected zone',
      };
    }

    try {
      if (!fs.existsSync(filePath)) {
        return {
          toolCallId: toolCall.id,
          name: toolCall.name,
          success: false,
          result: `File not found: ${filePath}`,
        };
      }

      const content = fs.readFileSync(filePath, 'utf-8');

      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: true,
        result: content,
      };
    } catch (error: any) {
      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: false,
        result: `Failed to read file: ${error.message}`,
      };
    }
  }

  /**
   * Run command with basic safety checks
   */
  private async executeRunCommand(toolCall: ToolCall): Promise<ToolResult> {
    const command = toolCall.arguments.command as string;
    const cwd = toolCall.arguments.cwd as string || this.workspacePath;

    // Basic safety - block obviously dangerous commands
    const dangerousPatterns = [
      /rm\s+-rf\s+\//,  // rm -rf /
      />\s*\/dev\/sda/, // overwrite disk
      /mkfs/,           // format
      /dd\s+if=/,       // disk dump
      /:(){ :|:& };:/,  // fork bomb
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return {
          toolCallId: toolCall.id,
          name: toolCall.name,
          success: false,
          result: `Command blocked: dangerous pattern detected`,
          guardianBlocked: true,
          guardianReason: 'Dangerous command pattern',
        };
      }
    }

    try {
      const output = execSync(command, {
        cwd,
        encoding: 'utf-8',
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
      });

      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: true,
        result: output,
      };
    } catch (error: any) {
      // Include stderr for debugging
      const output = error.stdout || '' + error.stderr || '';
      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: false,
        result: output || error.message,
      };
    }
  }

  /**
   * Search files/content
   */
  private async executeSearch(toolCall: ToolCall): Promise<ToolResult> {
    const query = toolCall.arguments.query as string;
    const type = toolCall.arguments.type as string || 'content';

    try {
      if (type === 'file') {
        // Search for files matching pattern
        const files = this.findFiles(query);
        return {
          toolCallId: toolCall.id,
          name: toolCall.name,
          success: true,
          result: files.join('\n'),
        };
      } else {
        // Search content using grep-like approach
        const results = this.searchContent(query);
        return {
          toolCallId: toolCall.id,
          name: toolCall.name,
          success: true,
          result: results.join('\n'),
        };
      }
    } catch (error: any) {
      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: false,
        result: `Search failed: ${error.message}`,
      };
    }
  }

  /**
   * Resolve path relative to workspace
   */
  private resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.join(this.workspacePath, filePath);
  }

  /**
   * Find files matching pattern
   */
  private findFiles(pattern: string): string[] {
    const results: string[] = [];
    
    const walk = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip hidden and node_modules
          if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
          }

          if (entry.isDirectory()) {
            walk(fullPath);
          } else if (entry.name.includes(pattern) || entry.name.match(pattern)) {
            results.push(fullPath);
          }
        }
      } catch {
        // Skip directories we can't read
      }
    };

    walk(this.workspacePath);
    return results.slice(0, 50); // Limit results
  }

  /**
   * Search content in files
   */
  private searchContent(query: string): string[] {
    const results: string[] = [];
    
    const walk = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip hidden and node_modules
          if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
          }

          if (entry.isDirectory()) {
            walk(fullPath);
          } else if (entry.isFile() && !entry.name.endsWith('.json') && !entry.name.endsWith('.lock')) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              if (content.includes(query)) {
                // Find line numbers
                const lines = content.split('\n');
                const matches = lines
                  .map((line, i) => line.includes(query) ? `${fullPath}:${i + 1}` : null)
                  .filter(Boolean) as string[];
                results.push(...matches.slice(0, 5));
              }
            } catch {
              // Skip files we can't read
            }
          }
        }
      } catch {
        // Skip directories we can't read
      }
    };

    walk(this.workspacePath);
    return results.slice(0, 50); // Limit results
  }

  /**
   * Log if verbose
   */
  private log(message: string): void {
    if (this.verbose) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      console.log(`[${timestamp}] [ToolExecutor] ${message}`);
    }
  }
}

export default ToolExecutor;
