import axios from 'axios';
import { BrainClientConfig, BrainExecutionOptions, BrainResponse, BrainType, TokenUsage, ToolCall } from './types';

const GLM_API_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions';
const GLM_MODEL = 'glm-4.7';

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
      reasoning_content?: string;
      tool_calls?: Array<{id: string; type: string; function: {name: string; arguments: string}}>; 
    };
  }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number; };
}

interface GLMTool { type: 'function'; function: { name: string; description: string; parameters: Record<string, unknown>; }; }

export class GLMClient {
  private client = axios.create({ timeout: 300000, headers: { 'Content-Type': 'application/json' } });
  private apiKey: string | null;
  private model: string;
  private tools: GLMTool[];

  constructor(config?: Partial<BrainClientConfig>) {
    this.apiKey = config?.apiKey || process.env.GLM_API_KEY || process.env.GLM_CODING_PLAN_KEY || null;
    this.model = config?.model || GLM_MODEL;
    this.tools = this.getDefaultTools();
  }

  isConfigured(): boolean { return this.apiKey !== null; }
  setApiKey(key: string): void { this.apiKey = key; }

  async execute(prompt: string, options?: BrainExecutionOptions): Promise<BrainResponse> {
    if (!this.apiKey) throw new Error('GLM API key not configured');
    
    const response = await this.client.post<GLMResponse>(GLM_API_URL, {
      model: this.model,
      messages: [
        { role: 'system', content: 'You are a coding assistant. Execute tasks precisely.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: options?.maxTokens || 8192,
      temperature: options?.temperature || 0.7,
      tools: this.tools,
      tool_choice: 'auto',
    }, { headers: { Authorization: `Bearer ${this.apiKey}` } });

    const data = response.data;
    const choice = data.choices[0];
    // Handle thinking models that return reasoning_content
    const content = choice.message.content || choice.message.reasoning_content || '';
    const toolCalls = choice.message.tool_calls?.map(tc => ({ id: tc.id, name: tc.function.name, arguments: JSON.parse(tc.function.arguments) })) as ToolCall[] | undefined;

    return {
      content,
      hasCodeChanges: (content.includes('```') || !!toolCalls?.length) ?? false,
      tokensUsed: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens },
      sourceBrain: BrainType.EXECUTION,
      toolCalls,
    };
  }

  async generateFile(filePath: string, description: string, existingContent?: string): Promise<string> {
    const prompt = existingContent 
      ? `Modify '${filePath}': ${description}\n\nCurrent:\n\`\`\`\n${existingContent}\n\`\`\``
      : `Create '${filePath}': ${description}`;
    return (await this.execute(prompt)).content;
  }

  private getDefaultTools(): GLMTool[] {
    return [
      { type: 'function', function: { name: 'write_file', description: 'Write to file', parameters: { type: 'object', properties: { file_path: { type: 'string' }, content: { type: 'string' } }, required: ['file_path', 'content'] } } },
      { type: 'function', function: { name: 'read_file', description: 'Read file', parameters: { type: 'object', properties: { file_path: { type: 'string' } }, required: ['file_path'] } } },
      { type: 'function', function: { name: 'run_command', description: 'Run shell command', parameters: { type: 'object', properties: { command: { type: 'string' }, cwd: { type: 'string' } }, required: ['command'] } } },
      { type: 'function', function: { name: 'search', description: 'Search codebase', parameters: { type: 'object', properties: { query: { type: 'string' }, type: { type: 'string', enum: ['file', 'content'] } }, required: ['query'] } } },
    ];
  }
}

export default GLMClient;
