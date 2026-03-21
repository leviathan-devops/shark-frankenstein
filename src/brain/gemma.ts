/**
 * 🦈 SHARK CLI - Gemma 3 4B Execution Brain (Micro Engineer)
 * 
 * Gemma 3 4B (Instruction-Tuned) serves as the execution brain for Micro Engineer mode.
 * 
 * IMPORTANT DETAILS:
 * - Free tier: 14,000 requests per day (RPD)
 * - API MUST be called from US or SEA region (NOT EU)
 * - Default region: SEA (Southeast Asia)
 * 
 * This is a "lobotomized" executor - it exists purely as hands for DeepSeek R1.
 * DeepSeek does the THINKING, Gemma does the DOING.
 * This architecture offloads execution to free tier while saving DeepSeek tokens for reasoning.
 */

import axios, { AxiosInstance } from 'axios';
import {
  GemmaClientConfig,
  GemmaApiRegion,
  GEMMA_API_ENDPOINTS,
  BrainExecutionOptions,
  BrainResponse,
  BrainType,
  TokenUsage,
} from './types';

const GEMMA_MODEL = 'gemma-3-4b-it';
const DEFAULT_TIMEOUT = 120000;
const DEFAULT_REGION: GemmaApiRegion = 'sea';

/**
 * Google Generative AI response structure for Gemma
 */
interface GemmaResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
        thoughtText?: string;
      }>;
      role: string;
    };
    finishReason: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Content part for request
 */
interface ContentPart {
  text: string;
}

/**
 * Request body for Gemma API
 */
interface GemmaRequest {
  contents: Array<{
    parts: ContentPart[];
    role: string;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

/**
 * Gemma 3 4B client for Micro Engineer execution
 * 
 * Usage:
 * ```typescript
 * const gemma = new GemmaClient({ apiKey: 'your-google-api-key' });
 * const response = await gemma.execute('Write a function to sort an array');
 * ```
 */
export class GemmaClient {
  private client: AxiosInstance;
  private apiKey: string | null;
  private model: string;
  private region: GemmaApiRegion;
  private timeout: number;

  constructor(config?: Partial<GemmaClientConfig>) {
    this.apiKey = config?.apiKey || process.env.GOOGLE_API_KEY || process.env.GEMMA_API_KEY || null;
    this.model = config?.model || GEMMA_MODEL;
    this.region = config?.region || DEFAULT_REGION;
    this.timeout = config?.timeout || DEFAULT_TIMEOUT;

    // Validate region - must be US or SEA
    if (this.region !== 'us' && this.region !== 'sea') {
      console.warn(`⚠️  Warning: Gemma API region '${this.region}' may not work. Only US and SEA are supported for free tier.`);
      this.region = 'sea'; // Default to SEA
    }

    this.client = axios.create({
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Log region for debugging
    if (process.env.SHARK_DEBUG) {
      console.log(`🦈 Gemma client initialized with region: ${this.region.toUpperCase()}`);
    }
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
   * Set the API region
   */
  setRegion(region: GemmaApiRegion): void {
    if (region !== 'us' && region !== 'sea') {
      throw new Error(`Invalid region '${region}'. Gemma API only works from US or SEA regions.`);
    }
    this.region = region;
  }

  /**
   * Get the API endpoint for the current region
   */
  private getEndpoint(method: string = 'generateContent'): string {
    const baseUrl = GEMMA_API_ENDPOINTS[this.region];
    return `${baseUrl}/${this.model}:${method}?key=${this.apiKey}`;
  }

  /**
   * Execute a task (main entry point for Micro Engineer)
   * 
   * This is the "hands" of the Micro Engineer - DeepSeek is the "brain".
   * Gemma receives precise instructions and executes them mechanically.
   */
  async execute(
    prompt: string,
    options?: BrainExecutionOptions
  ): Promise<BrainResponse> {
    if (!this.apiKey) {
      throw new Error(
        'Gemma API key not configured. Set GOOGLE_API_KEY or GEMMA_API_KEY environment variable.\n' +
        'Get a free API key at: https://aistudio.google.com/apikey'
      );
    }

    const systemPrompt = this.buildExecutionPrompt(options?.context);

    const requestBody: GemmaRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.5, // Lower temp for precise execution
        maxOutputTokens: options?.maxTokens || 4096,
        topP: 0.95,
        topK: 40,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    };

    try {
      const response = await this.client.post<GemmaResponse>(
        this.getEndpoint('generateContent'),
        requestBody
      );

      const data = response.data;
      const candidate = data.candidates?.[0];
      
      if (!candidate) {
        throw new Error('No response generated from Gemma');
      }

      const content = candidate.content.parts.map(p => p.text).join('');
      
      const tokensUsed: TokenUsage | undefined = data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount,
        completionTokens: data.usageMetadata.candidatesTokenCount,
        totalTokens: data.usageMetadata.totalTokenCount,
      } : undefined;

      return {
        content,
        hasCodeChanges: content.includes('```'),
        tokensUsed,
        sourceBrain: BrainType.EXECUTION,
      };
    } catch (error: any) {
      // Handle region-specific errors
      if (error.response?.data?.error?.message?.includes('region')) {
        throw new Error(
          `Gemma API region error: The API must be called from US or SEA region. ` +
          `Current region setting: ${this.region.toUpperCase()}\n` +
          `Try switching regions or ensure your network is not routing through EU.`
        );
      }
      
      // Handle quota exceeded
      if (error.response?.status === 429) {
        throw new Error(
          'Gemma API quota exceeded. Free tier allows 14,000 requests per day.\n' +
          'Try again tomorrow or upgrade to a paid plan.'
        );
      }

      throw new Error(`Gemma API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Execute a plan from DeepSeek (Micro Engineer flow)
   * 
   * This is the key method for the Micro Engineer architecture:
   * DeepSeek R1 (Planning Brain) → Gemma 3 4B (Execution Brain)
   */
  async executePlan(
    plan: string,
    originalTask: string,
    options?: BrainExecutionOptions
  ): Promise<BrainResponse> {
    const prompt = `You are the execution engine. Your job is to mechanically execute the following plan precisely.

EXECUTION PLAN:
${plan}

ORIGINAL TASK:
${originalTask}

Execute this plan step by step. Output clean, working code. Do not add explanations unless specifically asked.`;

    return this.execute(prompt, options);
  }

  /**
   * Generate code for a specific file (Micro Engineer task)
   */
  async generateFile(
    filePath: string,
    description: string,
    existingContent?: string
  ): Promise<string> {
    const prompt = existingContent
      ? `Modify the file '${filePath}':

${description}

CURRENT CONTENT:
\`\`\`
${existingContent}
\`\`\`

Output the complete updated file:`
      : `Create file '${filePath}':

${description}

Output the complete file content:`;

    const response = await this.execute(prompt);
    return response.content;
  }

  /**
   * Build the execution system prompt for Micro Engineer
   * 
   * Note: This is intentionally simple because DeepSeek does the thinking.
   * Gemma is just the "hands" - it executes precisely without reasoning overhead.
   */
  private buildExecutionPrompt(context?: string): string {
    const base = `You are the Execution Engine of Shark CLI's Micro Engineer mode.
Your role is to execute instructions precisely and efficiently.

RULES:
1. Output clean, working code
2. Follow the instructions exactly
3. No unnecessary explanations
4. Complete all requested changes
5. Use best practices for the language/framework`;

    return context ? `${base}\n\nContext:\n${context}` : base;
  }

  /**
   * Get quota information (14k RPD free tier)
   */
  getQuotaInfo(): { dailyLimit: number; tier: string } {
    return {
      dailyLimit: 14000,
      tier: 'Free Tier (14,000 RPD)',
    };
  }
}

export default GemmaClient;
