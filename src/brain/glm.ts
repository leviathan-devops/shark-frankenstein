/**
 * 🦈 SHARK CLI - GLM 4.5 Execution Brain
 * 
 * GLM 4.5-flash serves as the primary execution brain in Macro mode.
 * It handles autonomous code generation, multi-file operations, and complex systems engineering.
 */

import axios, { AxiosInstance } from 'axios';
import {
  BrainClientConfig,
  BrainExecutionOptions,
  BrainResponse,
  BrainType,
  TokenUsage,
  ToolCall,
} from './types';

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const GLM_4_FLASH_MODEL = 'glm-4-flash';
const GLM_4_5_FLASH_MODEL = 'glm-4.5-flash';

/**
 * GLM API response structure
 */
interface GLMResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Tool definition for GLM
 */
interface GLMTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

/**
 * GLM 4.5 client for code execution and generation
 */
export class GLMClient {
  private client: AxiosInstance;
  private apiKey: string | null;
  private model: string;
  private baseUrl: string;
  private tools: GLMTool[];

  constructor(config?: Partial<BrainClientConfig>) {
    this.apiKey = 
      config?.apiKey || 
      process.env.GLM_API_KEY || 
      process.env.GLM_CODING_PLAN_KEY || 
      null;
    this.model = config?.model || GLM_4_5_FLASH_MODEL;
    this.baseUrl = config?.baseUrl || GLM_API_URL;

    this.client = axios.create({
      timeout: config?.timeout || 300000, // 5 minutes for complex macro tasks
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.tools = this.getDefaultTools();
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
   * Execute a coding task
   */
  async execute(
    prompt: string,
    options?: BrainExecutionOptions
  ): Promise<BrainResponse> {
    if (!this.apiKey) {
      throw new Error('GLM API key not configured. Set GLM_API_KEY or GLM_CODING_PLAN_KEY environment variable.');
    }

    const systemPrompt = this.buildExecutionPrompt(options?.context);

    const response = await this.client.post<GLMResponse>(
      this.baseUrl,
      {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: options?.maxTokens || 8192,
        temperature: options?.temperature || 0.7,
        tools: this.tools,
        tool_choice: 'auto',
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

    const content = choice.message.content || '';
    const toolCalls = choice.message.tool_calls?.map(tc => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    })) as ToolCall[] | undefined;

    return {
      content,
      hasCodeChanges: content.includes('```') || !!toolCalls?.length,
      tokensUsed,
      sourceBrain: BrainType.EXECUTION,
      toolCalls,
    };
  }

  /**
   * Generate code for a specific file
   */
  async generateFile(
    filePath: string,
    description: string,
    existingContent?: string
  ): Promise<string> {
    const prompt = existingContent
      ? `Modify the file at '${filePath}' according to the following description:

${description}

Current file content:
\`\`\`
${existingContent}
\`\`\`

Provide the complete updated file content.`
      : `Create a new file at '${filePath}' with the following description:

${description}

Provide the complete file content.`;

    const response = await this.execute(prompt);
    return response.content;
  }

  /**
   * Build the execution system prompt
   */
  private buildExecutionPrompt(context?: string): string {
    const base = `You are GLM 4.5-flash, the Execution Brain of Shark CLI. Your role is to:
- Generate high-quality, production-ready code
- Execute plans provided by the Planning Brain
- Handle multi-file operations and complex systems
- Provide clear explanations of your changes
- Follow best practices and design patterns

You have access to tools for:
- Reading and writing files
- Running shell commands
- Searching the codebase
- Managing the project

Always ensure your code is complete, correct, and follows the project's style.`;

    return context ? `${base}\n\nContext:\n${context}` : base;
  }

  /**
   * Get default tools for GLM
   */
  private getDefaultTools(): GLMTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'write_file',
          description: 'Write content to a file. Creates the file if it doesn\'t exist, or overwrites if it does.',
          parameters: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'The path to the file to write',
              },
              content: {
                type: 'string',
                description: 'The content to write to the file',
              },
            },
            required: ['file_path', 'content'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'read_file',
          description: 'Read the content of a file.',
          parameters: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'The path to the file to read',
              },
            },
            required: ['file_path'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'run_command',
          description: 'Execute a shell command.',
          parameters: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'The command to execute',
              },
              cwd: {
                type: 'string',
                description: 'Working directory for the command',
              },
            },
            required: ['command'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'search',
          description: 'Search for files or content in the codebase.',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query',
              },
              type: {
                type: 'string',
                enum: ['file', 'content'],
                description: 'Type of search',
              },
            },
            required: ['query'],
          },
        },
      },
    ];
  }
}

export default GLMClient;
