/**
 * 🦈 SHARK CLI - DeepSeek R1 Planning Brain
 * 
 * DeepSeek R1 serves as the strategic planning brain in the dual-brain architecture.
 * It provides reasoning, planning, and strategic guidance for both Micro and Macro modes.
 */

import axios, { AxiosInstance } from 'axios';
import {
  BrainClientConfig,
  BrainExecutionOptions,
  BrainResponse,
  BrainType,
  TokenUsage,
} from './types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_REASONER_MODEL = 'deepseek-reasoner';

/**
 * DeepSeek API response structure
 */
interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * DeepSeek R1 client for strategic planning
 */
export class DeepSeekClient {
  private client: AxiosInstance;
  private apiKey: string | null;
  private model: string;

  constructor(config?: Partial<BrainClientConfig>) {
    this.apiKey = config?.apiKey || process.env.DEEPSEEK_API_KEY || null;
    this.model = config?.model || DEEPSEEK_REASONER_MODEL;

    this.client = axios.create({
      timeout: config?.timeout || 120000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check if the client is configured (has API key)
   */
  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  /**
   * Set the API key
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Send a planning query to DeepSeek R1
   */
  async plan(
    prompt: string,
    context?: string,
    options?: BrainExecutionOptions
  ): Promise<BrainResponse> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured. Set DEEPSEEK_API_KEY environment variable.');
    }

    const systemPrompt = this.buildSystemPrompt(context);

    const response = await this.client.post<DeepSeekResponse>(
      DEEPSEEK_API_URL,
      {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: options?.maxTokens || 8192,
        temperature: options?.temperature || 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    const data = response.data;
    const choice = data.choices[0];

    const tokensUsed: TokenUsage = {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    };

    return {
      content: choice.message.content,
      hasCodeChanges: choice.message.content.includes('```'),
      tokensUsed,
      sourceBrain: BrainType.PLANNING,
      reasoning: choice.message.reasoning_content,
    };
  }

  /**
   * Generate a strategic plan for a coding task
   */
  async generatePlan(
    task: string,
    codebaseContext?: string
  ): Promise<string> {
    const planningPrompt = `You are the Planning Brain of Shark CLI. Analyze the following task and create a detailed execution plan.

Task: ${task}
${codebaseContext ? `\nCodebase Context:\n${codebaseContext}` : ''}

Provide:
1. Task decomposition into steps
2. Files that need to be modified or created
3. Potential risks and considerations
4. Success criteria

Format your response as a structured plan that can be executed by the Execution Brain.`;

    const response = await this.plan(planningPrompt);
    return response.content;
  }

  /**
   * Review execution results and provide guidance
   */
  async reviewExecution(
    originalTask: string,
    executionResult: string
  ): Promise<string> {
    const reviewPrompt = `You are the Planning Brain reviewing an execution result.

Original Task: ${originalTask}

Execution Result: ${executionResult}

Analyze the result and provide:
1. Assessment of completion
2. Any issues or improvements needed
3. Next steps if required`;

    const response = await this.plan(reviewPrompt);
    return response.content;
  }

  /**
   * Build the system prompt with optional context
   */
  private buildSystemPrompt(context?: string): string {
    const base = `You are DeepSeek R1, the Planning Brain of Shark CLI. Your role is to:
- Analyze coding tasks strategically
- Decompose complex tasks into manageable steps
- Identify potential risks and edge cases
- Provide clear, actionable plans
- Think through problems methodically

You provide planning guidance, but do not directly execute code changes.
Your output will be used by the Execution Brain to perform actual implementation.`;

    return context ? `${base}\n\nContext:\n${context}` : base;
  }
}

export default DeepSeekClient;
