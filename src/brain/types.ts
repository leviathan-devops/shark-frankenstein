/**
 * 🦈 SHARK CLI - Brain Types
 * 
 * Type definitions for the dual-brain architecture.
 * 
 * ARCHITECTURE:
 * 
 * 🦈 MICRO ENGINEER (Linear Coding Tasks)
 * ├─ Brain: DeepSeek R1 (strategic planning)
 * ├─ Executor: Gemma 3 4B (Instruction-Tuned) via Google API
 * │   └─ API Region: US or SEA only (defaults to SEA)
 * │   └─ Free Tier: 14,000 RPD (Requests Per Day)
 * ├─ Auth: Google API Key (free tier)
 * └─ Focus: Single-file operations, syntax fixing, unit tests
 * 
 * 🧠 MACRO ENGINEER (Complex Systems Engineering)
 * ├─ Primary Brain: GLM 4.5-flash (autonomous execution)
 * ├─ Advisory Brain: DeepSeek R1 (strategic consultation)
 * ├─ Auth: GLM Coding Plan API
 * └─ Focus: Multi-file architecture, DevOps, CI/CD pipelines
 */

/**
 * API region configuration for Gemma (Google API)
 * 
 * IMPORTANT: Gemma 3 4B free tier (14k RPD) only works from US or SEA regions.
 * EU region will NOT work and returns errors.
 */
export type GemmaApiRegion = 'us' | 'sea';

/**
 * Google API endpoints for Gemma
 */
export const GEMMA_API_ENDPOINTS = {
  us: 'https://generativelanguage.googleapis.com/v1beta/models',
  sea: 'https://generativelanguage.googleapis.com/v1beta/models', // Same endpoint, region determined by request origin
} as const;

/**
 * Brain mode selection
 */
export enum BrainMode {
  /** 
   * Micro Engineer: Linear coding tasks
   * - Brain: DeepSeek R1 (planning)
   * - Executor: Gemma 3 4B (Instruction-Tuned) via Google API
   * - API Region: US or SEA only (defaults to SEA)
   * - Free Tier: 14,000 RPD
   */
  MICRO = 'micro',
  
  /**
   * Macro Engineer: Complex systems engineering
   * - Primary Brain: GLM 4.5-flash (autonomous execution)
   * - Advisory Brain: DeepSeek R1 (strategic consultation)
   * - Auth: GLM Coding Plan API
   */
  MACRO = 'macro',
}

/**
 * Type of brain
 */
export enum BrainType {
  /** Planning brain (DeepSeek R1) */
  PLANNING = 'planning',
  
  /** Execution brain (GLM 4.5 for Macro / Gemma 3 4B for Micro) */
  EXECUTION = 'execution',
}

/**
 * Model identifiers for execution brains
 */
export const EXECUTION_MODELS = {
  /** Micro Engineer executor: Gemma 3 4B Instruction-Tuned */
  MICRO: 'gemma-3-4b-it',
  
  /** Macro Engineer executor: GLM 4.5-flash */
  MACRO: 'glm-4-flash',
} as const;

/**
 * Configuration for Gemma client (Google API)
 * 
 * Gemma 3 4B Free Tier Details:
 * - 14,000 requests per day (RPD)
 * - Region restricted: US or SEA only
 * - EU region NOT supported
 */
export interface GemmaClientConfig extends BrainClientConfig {
  /** API region - must be 'us' or 'sea' (defaults to 'sea') */
  region?: GemmaApiRegion;
  
  /** Google API key for Gemini/Gemma */
  apiKey?: string;
  
  /** Model ID - defaults to 'gemma-3-4b-it' */
  model?: string;
  
  /** Request timeout in milliseconds */
  timeout?: number;
  
  /** Use Railway proxy to bypass region restrictions */
  useProxy?: boolean;
  
  /** Custom proxy URL (defaults to Railway Singapore proxy) */
  proxyUrl?: string;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Response from a brain query
 */
export interface BrainResponse {
  /** The response content */
  content: string;
  
  /** Whether this response includes code changes */
  hasCodeChanges: boolean;
  
  /** Token usage if available */
  tokensUsed?: TokenUsage;
  
  /** The brain that generated this response */
  sourceBrain: BrainType;
  
  /** Tool calls if any */
  toolCalls?: ToolCall[];
  
  /** Reasoning content (for DeepSeek R1) */
  reasoning?: string;
}

/**
 * Tool call from the model
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Message in a conversation
 */
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

/**
 * Conversation entry for history tracking
 */
export interface ConversationEntry {
  /** Which brain generated this */
  brain: BrainType;
  
  /** The content */
  content: string;
  
  /** The phase of coordination */
  phase: string;
  
  /** Timestamp */
  timestamp: Date;
}

/**
 * Result of dual-brain coordination
 */
export interface CoordinationResult {
  /** The final output */
  finalOutput: string;
  
  /** History of the conversation between brains */
  conversationHistory: ConversationEntry[];
  
  /** Number of iterations executed */
  iterations: number;
  
  /** The mode used for execution */
  mode: BrainMode;
  
  /** Total tokens used */
  totalTokens?: number;
  
  /** Execution time in milliseconds */
  executionTimeMs: number;
}

/**
 * Configuration for a brain client
 */
export interface BrainClientConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Options for brain execution
 */
export interface BrainExecutionOptions {
  /** Context to include in the prompt */
  context?: string;
  
  /** Maximum tokens to generate */
  maxTokens?: number;
  
  /** Temperature for sampling */
  temperature?: number;
  
  /** Whether to stream the response */
  stream?: boolean;
  
  /** Callback for streaming chunks */
  onChunk?: (chunk: string) => void;
}
