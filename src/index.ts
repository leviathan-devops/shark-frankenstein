/**
 * 🦈 SHARK CLI - TypeScript Implementation
 * 
 * Shark CLI is an AI-powered coding assistant with dual-brain architecture:
 * 
 * 🦈 MICRO ENGINEER (Precision Coding):
 * ├─ Brain: DeepSeek R1 (THINKS - burns tokens for reasoning)
 * ├─ Hands: Gemma 3 4B (DOES - FREE tier, 14k RPD)
 * ├─ Use: Linear tasks, single-file, syntax fixes, unit tests
 * └─ Like: Special Forces - surgical precision
 * 
 * 🧠 MACRO ENGINEER (Systems Engineering):
 * ├─ Primary: GLM 4.5-flash (autonomous execution)
 * ├─ Advisory: DeepSeek R1 (strategic copilot)
 * ├─ Use: Multi-file architecture, DevOps, CI/CD
 * └─ Like: Air Force - full engineering capabilities
 */

// Brain types and constants
export {
  BrainMode,
  BrainType,
  BrainResponse,
  TokenUsage,
  GemmaApiRegion,
  GemmaClientConfig,
  BrainClientConfig,
  BrainExecutionOptions,
  ConversationEntry,
  CoordinationResult,
  ToolCall,
  Message,
  EXECUTION_MODELS,
  GEMMA_API_ENDPOINTS,
} from './brain/types';

// Brain clients
export { DualBrainCoordinator, CoordinatorConfig } from './brain/coordinator';
export { DeepSeekClient } from './brain/deepseek';
export { GLMClient } from './brain/glm';
export { GemmaClient } from './brain/gemma';

// Configuration
export {
  SharkConfig,
  loadConfig,
  saveConfig,
  getApiKeys,
  validateConfig,
  DEFAULT_CONFIG,
} from './config';

// Guardian (file protection)
export {
  Guardian,
  GuardianConfig,
  ProtectionStatus,
  ModificationDecision,
  FileInfo,
} from './guardian';

// Wizard (interactive mode selection)
export {
  WizardResult,
  runWizard,
  switchMode,
  displaySetupInstructions,
} from './wizard';

// Utils
export { readStdin } from './utils/stdin';
