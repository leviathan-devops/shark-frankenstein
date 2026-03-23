/**
 * 🦈 SHARK CLI - Dual-Brain Coordinator (FIXED with Tool Execution)
 * 
 * Coordinates the dual-brain architecture with the correct model assignments:
 * 
 * MICRO ENGINEER (Precision Coding):
 * - Planning Brain: DeepSeek R1 (strategic planning)
 * - Execution Brain: Gemma 3 4B (free tier, 14k RPD)
 * - Architecture: DeepSeek THINKS → Gemma DOES
 * - Use case: Linear tasks, single-file operations, syntax fixing
 * 
 * MACRO ENGINEER (Systems Engineering):
 * - Primary Brain: GLM 4.5-flash (autonomous execution)
 * - Advisory Brain: DeepSeek R1 (strategic consultation)
 * - Architecture: GLM leads, DeepSeek advises
 * - Use case: Multi-file architecture, DevOps, CI/CD, complex systems
 * 
 * ✅ FIXED: Now integrates Guardian and ToolExecutor for ACTUAL file operations
 */

import { DeepSeekClient } from './deepseek';
import { GLMClient } from './glm';
import { GemmaClient } from './gemma';
import {
  BrainMode,
  BrainType,
  CoordinationResult,
  ConversationEntry,
  BrainExecutionOptions,
  BrainResponse,
  ToolCall,
} from './types';
import { Guardian, createProductionGuardian } from '../guardian';
import { ToolExecutor, ToolResult } from '../tools/executor';

/**
 * Coordinator configuration
 */
export interface CoordinatorConfig {
  /** Brain mode (micro or macro) */
  mode: BrainMode;
  
  /** Maximum iterations for coordination loop */
  maxIterations?: number;
  
  /** Auto-approve mode (skip user prompts) */
  autoApprove?: boolean;
  
  /** Verbose logging */
  verbose?: boolean;
  
  /** Gemma region (US or SEA only for free tier) */
  gemmaRegion?: 'us' | 'sea';
  
  /** ✅ FIXED: Workspace path for Guardian */
  workspacePath?: string;
  
  /** ✅ FIXED: Use Gemma proxy for EU region bypass */
  useGemmaProxy?: boolean;
}

/**
 * Coordinates dual-brain architecture for task execution
 * 
 * ✅ FIXED: Now includes Guardian protection and actual tool execution
 */
export class DualBrainCoordinator {
  private mode: BrainMode;
  private planningBrain: DeepSeekClient;
  private executionBrain: GLMClient | GemmaClient;
  private maxIterations: number;
  private autoApprove: boolean;
  private verbose: boolean;
  private workspacePath: string;
  private guardian: Guardian;
  private toolExecutor: ToolExecutor;

  constructor(config: CoordinatorConfig) {
    this.mode = config.mode;
    this.maxIterations = config.maxIterations || 10;
    this.autoApprove = config.autoApprove ?? false;
    this.verbose = config.verbose ?? false;
    this.workspacePath = config.workspacePath || process.cwd();

    // ✅ FIXED: Initialize Guardian
    this.guardian = createProductionGuardian(this.workspacePath);
    this.log('🛡️  Guardian initialized for coordinator');

    // ✅ FIXED: Initialize ToolExecutor
    this.toolExecutor = new ToolExecutor({
      guardian: this.guardian,
      workspacePath: this.workspacePath,
      verbose: this.verbose,
    });
    this.log('🔧 ToolExecutor initialized');

    // Initialize brain clients based on mode
    this.planningBrain = new DeepSeekClient();
    
    // CRITICAL: Use Gemma for Micro, GLM for Macro
    if (this.mode === BrainMode.MICRO) {
      // Micro Engineer: Gemma 3 4B (free tier executor)
      this.executionBrain = new GemmaClient({ 
        region: config.gemmaRegion || 'sea',
        useProxy: config.useGemmaProxy,
      });
      this.log('Micro Engineer mode: Using Gemma 3 4B as execution brain (14k RPD free tier)');
    } else {
      // Macro Engineer: GLM 4.5-flash (autonomous execution)
      this.executionBrain = new GLMClient();
      this.log('Macro Engineer mode: Using GLM 4.5-flash as primary brain');
    }
  }

  /**
   * Get the current brain mode
   */
  getMode(): BrainMode {
    return this.mode;
  }

  /**
   * Set the brain mode (switches execution brain)
   */
  setMode(mode: BrainMode): void {
    if (this.mode !== mode) {
      this.mode = mode;
      
      // Switch execution brain based on mode
      if (mode === BrainMode.MICRO) {
        this.executionBrain = new GemmaClient();
        this.log('Switched to Micro Engineer: Gemma 3 4B');
      } else {
        this.executionBrain = new GLMClient();
        this.log('Switched to Macro Engineer: GLM 4.5-flash');
      }
    }
  }

  /**
   * Check if the required brains are configured
   */
  isConfigured(): boolean {
    return this.executionBrain.isConfigured();
  }

  /**
   * Get configuration status for display
   */
  getConfigStatus(): { planning: boolean; execution: boolean; executionModel: string } {
    return {
      planning: this.planningBrain.isConfigured(),
      execution: this.executionBrain.isConfigured(),
      executionModel: this.mode === BrainMode.MICRO ? 'Gemma 3 4B' : 'GLM 4.5-flash',
    };
  }

  /**
   * Get Guardian instance
   */
  getGuardian(): Guardian {
    return this.guardian;
  }

  /**
   * Execute a task using the dual-brain architecture
   */
  async execute(task: string, options?: BrainExecutionOptions): Promise<CoordinationResult> {
    const startTime = Date.now();

    switch (this.mode) {
      case BrainMode.MICRO:
        return this.executeMicro(task, options, startTime);
      case BrainMode.MACRO:
        return this.executeMacro(task, options, startTime);
      default:
        throw new Error(`Unknown brain mode: ${this.mode}`);
    }
  }

  /**
   * Execute in Micro Engineer mode
   * 
   * ARCHITECTURE: DeepSeek R1 (THINKS) → Gemma 3 4B (DOES)
   */
  private async executeMicro(
    task: string,
    options?: BrainExecutionOptions,
    startTime?: number
  ): Promise<CoordinationResult> {
    const history: ConversationEntry[] = [];
    let iterations = 0;

    this.log('🦈 Starting Micro Engineer execution...');
    this.log('Architecture: DeepSeek R1 (THINKS) → Gemma 3 4B (DOES)');

    // Step 1: Get plan from Planning Brain (DeepSeek R1)
    let plan: string;
    if (this.planningBrain.isConfigured()) {
      this.log('Step 1: DeepSeek R1 generating plan...');
      plan = await this.planningBrain.generatePlan(task, options?.context);
      
      history.push({
        brain: BrainType.PLANNING,
        content: plan,
        phase: 'planning',
        timestamp: new Date(),
      });

      this.log(`Plan generated (${plan.length} chars)`);
    } else {
      plan = task;
      this.log('⚠️  Planning Brain not configured, using task directly as execution prompt');
      this.log('💡 Tip: Set DEEPSEEK_API_KEY to enable strategic planning');
    }

    // Step 2: Execute with Execution Brain (Gemma 3 4B)
    this.log('Step 2: Gemma 3 4B executing plan...');

    const executionPrompt = `Execute this plan precisely:

${plan}

Original Task: ${task}

Output clean, working code. Follow the plan step by step.`;

    const executionResult = await this.executionBrain.execute(executionPrompt, options);
    
    history.push({
      brain: BrainType.EXECUTION,
      content: executionResult.content,
      phase: 'execution',
      timestamp: new Date(),
    });

    // ✅ FIXED: Process tool calls if any
    if (executionResult.toolCalls && executionResult.toolCalls.length > 0) {
      this.log(`Processing ${executionResult.toolCalls.length} tool calls...`);
      const toolResults = await this.processToolCalls(executionResult.toolCalls);
      
      history.push({
        brain: BrainType.EXECUTION,
        content: `Tool Results:\n${toolResults.map(r => r.result).join('\n')}`,
        phase: 'tool_execution',
        timestamp: new Date(),
      });
    }

    iterations = 1;

    // Step 3: Optional review with Planning Brain
    if (this.planningBrain.isConfigured() && executionResult.hasCodeChanges && !this.autoApprove) {
      this.log('Step 3: DeepSeek reviewing execution...');
      const review = await this.planningBrain.reviewExecution(task, executionResult.content);
      
      history.push({
        brain: BrainType.PLANNING,
        content: review,
        phase: 'review',
        timestamp: new Date(),
      });

      // Check if refinement is needed
      const needsRefinement = 
        review.toLowerCase().includes('issue') || 
        review.toLowerCase().includes('improvement') ||
        review.toLowerCase().includes('error');

      if (needsRefinement && iterations < this.maxIterations) {
        this.log('Refining execution based on review...');
        iterations++;
        
        const refinedResult = await this.executionBrain.execute(
          `Fix the following issues:\n${review}\n\nPrevious execution:\n${executionResult.content}`,
          options
        );
        
        history.push({
          brain: BrainType.EXECUTION,
          content: refinedResult.content,
          phase: 'refinement',
          timestamp: new Date(),
        });
      }
    }

    const totalTime = Date.now() - (startTime || Date.now());
    this.log(`Micro execution complete: ${iterations} iteration(s), ${totalTime}ms`);

    return {
      finalOutput: executionResult.content,
      conversationHistory: history,
      iterations,
      mode: this.mode,
      totalTokens: executionResult.tokensUsed?.totalTokens,
      executionTimeMs: totalTime,
    };
  }

  /**
   * Execute in Macro Engineer mode
   * 
   * ARCHITECTURE: GLM 4.5-flash (PRIMARY) + DeepSeek R1 (ADVISORY)
   */
  private async executeMacro(
    task: string,
    options?: BrainExecutionOptions,
    startTime?: number
  ): Promise<CoordinationResult> {
    const history: ConversationEntry[] = [];
    let iterations = 0;
    let currentTask = task;
    const allOutputs: string[] = [];

    this.log('🦈 Starting Macro Engineer execution...');
    this.log('Architecture: GLM 4.5-flash (PRIMARY) + DeepSeek R1 (ADVISORY)');

    while (iterations < this.maxIterations) {
      iterations++;
      this.log(`Iteration ${iterations}/${this.maxIterations}`);

      // Step 1: Get strategic consultation from DeepSeek (if configured)
      if (this.planningBrain.isConfigured()) {
        this.log('DeepSeek providing strategic consultation...');
        const strategy = await this.planningBrain.generatePlan(currentTask, options?.context);
        
        history.push({
          brain: BrainType.PLANNING,
          content: strategy,
          phase: `strategy_round_${iterations}`,
          timestamp: new Date(),
        });

        // Enhance task with strategy
        currentTask = `Strategic Plan:\n${strategy}\n\nTask: ${currentTask}`;
      }

      // Step 2: Execute with GLM 4.5-flash (primary brain)
      this.log('GLM 4.5-flash executing...');
      const result = await this.executionBrain.execute(currentTask, options);
      
      history.push({
        brain: BrainType.EXECUTION,
        content: result.content,
        phase: `execution_round_${iterations}`,
        timestamp: new Date(),
      });

      allOutputs.push(result.content);

      // ✅ FIXED: Process tool calls if any
      if (result.toolCalls && result.toolCalls.length > 0) {
        this.log(`Processing ${result.toolCalls.length} tool calls...`);
        const toolResults = await this.processToolCalls(result.toolCalls);
        
        history.push({
          brain: BrainType.EXECUTION,
          content: `Tool Results:\n${toolResults.map(r => `${r.name}: ${r.success ? 'OK' : 'FAILED'}`).join('\n')}`,
          phase: `tool_execution_round_${iterations}`,
          timestamp: new Date(),
        });

        // Feed tool results back to GLM if needed
        const failedTools = toolResults.filter(r => !r.success && r.guardianBlocked);
        if (failedTools.length > 0) {
          this.log('Some tools were blocked by Guardian, informing GLM...');
          currentTask = `Previous work:\n${result.content}\n\nGuardian blocked these operations:\n${failedTools.map(t => `- ${t.name}: ${t.guardianReason}`).join('\n')}\n\nPlease revise your approach to avoid protected paths.`;
          continue;
        }
      }

      // Step 3: Check for completion
      if (this.isComplete(result.content)) {
        this.log('Task appears complete');
        break;
      }

      // Step 4: Get review for next iteration
      if (this.planningBrain.isConfigured() && iterations < this.maxIterations) {
        this.log('DeepSeek reviewing progress...');
        const review = await this.planningBrain.reviewExecution(task, result.content);
        
        history.push({
          brain: BrainType.PLANNING,
          content: review,
          phase: `review_round_${iterations}`,
          timestamp: new Date(),
        });

        if (review.toLowerCase().includes('complete') || 
            review.toLowerCase().includes('success') ||
            review.toLowerCase().includes('finished')) {
          this.log('DeepSeek confirmed task complete');
          break;
        }

        // Update for next iteration
        currentTask = `Previous work:\n${result.content}\n\nRemaining work:\n${review}`;
      } else {
        break;
      }
    }

    const totalTime = Date.now() - (startTime || Date.now());
    this.log(`Macro execution complete: ${iterations} iteration(s), ${totalTime}ms`);

    return {
      finalOutput: allOutputs.join('\n\n---\n\n'),
      conversationHistory: history,
      iterations,
      mode: this.mode,
      totalTokens: undefined,
      executionTimeMs: totalTime,
    };
  }

  /**
   * ✅ FIXED: Process tool calls with Guardian protection
   */
  private async processToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      this.log(`Executing tool: ${toolCall.name}`);
      
      const result = await this.toolExecutor.executeTool(toolCall);
      results.push(result);

      if (result.guardianBlocked) {
        this.log(`⚠️  Guardian blocked: ${toolCall.name} - ${result.guardianReason}`);
      } else if (result.success) {
        this.log(`✅ Tool executed: ${toolCall.name}`);
      } else {
        this.log(`❌ Tool failed: ${toolCall.name} - ${result.result}`);
      }
    }

    return results;
  }

  /**
   * Quick execution without planning (for simple tasks)
   */
  async quickExecute(task: string, options?: BrainExecutionOptions): Promise<string> {
    const result = await this.executionBrain.execute(task, options);
    
    // ✅ FIXED: Process any tool calls
    if (result.toolCalls && result.toolCalls.length > 0) {
      await this.processToolCalls(result.toolCalls);
    }
    
    return result.content;
  }

  /**
   * Check if a result indicates completion
   */
  private isComplete(content: string): boolean {
    const completionIndicators = [
      'task complete',
      'successfully implemented',
      'all changes applied',
      'implementation finished',
      'done',
      'complete',
    ];
    
    const lowerContent = content.toLowerCase();
    return completionIndicators.some(indicator => lowerContent.includes(indicator));
  }

  /**
   * Log message if verbose mode is enabled
   */
  private log(message: string): void {
    if (this.verbose) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      console.log(`[${timestamp}] ${message}`);
    }
  }
}

export default DualBrainCoordinator;
