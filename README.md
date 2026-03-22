# 🦈 Shark CLI (Frankenstein Edition)

> **AI-powered coding assistant with dual-brain architecture**  
> Phase 1: TypeScript "Frankenstein" CLI built on Qwen Code concepts

---

## 🎯 Quick Start

```bash
# Clone and install
git clone https://github.com/leviathan-devops/shark-frankenstein.git
cd shark-frankenstein
npm install

# Build and link globally
npm run build
npm link

# Run the wizard
shark
```

---

## 🧠 Architecture

### Micro Engineer (Full-Stack AI Coder)

```
┌─────────────────────────────────────────────────────┐
│  🦈 MICRO ENGINEER - Full-Stack AI Coder (FREE)    │
│                                                     │
│  DeepSeek R1 ─────THINKS────→ Gemma 3 4B ─DOES→    │
│  (Planning Brain)           (Execution Brain)       │
│                                                     │
│  ✅ FREE execution (14k RPD via Google AI Studio)  │
│  ✅ Full capabilities: features, refactoring,       │
│     debugging, multi-file work, architecture,      │
│     tests, DevOps - COMPLETE ENGINEERING           │
│  ✅ Like: 10x engineer with infinite stamina        │
└─────────────────────────────────────────────────────┘
```

### Macro Engineer (Autonomous Systems Architect)

```
┌─────────────────────────────────────────────────────┐
│  🧠 MACRO ENGINEER - Autonomous Systems Architect   │
│                                                     │
│  GLM 4.5-flash ─────PRIMARY────→ Execution          │
│  DeepSeek R1   ─────ADVISORY────→ Strategy          │
│                                                     │
│  ✅ Autonomous multi-step execution (self-iterates) │
│  ✅ Built-in tools: file read/write, shell, search  │
│  ✅ Strategic consultation between iterations       │
│  ✅ Self-detects completion, auto-refines output    │
│  ✅ Best for: Complex orchestration, DevOps, CI/CD  │
│     multi-file architecture, system migrations,     │
│     autonomous project scaffolding                  │
│  ⚠️  Cost: GLM tokens + DeepSeek tokens (not free)  │
│  ✅ Like: Air Traffic Control - orchestrates chaos  │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# MICRO ENGINEER (Required)
GOOGLE_API_KEY=your-google-api-key-here     # Get free: https://aistudio.google.com/apikey

# MACRO ENGINEER (Required)
GLM_API_KEY=your-glm-api-key-here           # Get: https://open.bigmodel.cn

# PLANNING/ADVISORY (Recommended for both modes)
DEEPSEEK_API_KEY=your-deepseek-key-here     # Get: https://platform.deepseek.com

# OPTIONAL
SHARK_DEBUG=false                           # Enable verbose logging
SHARK_REGION=sea                            # Gemma region (us/sea)
```

### API Key Sources

| API | Purpose | Free Tier | Get Key |
|-----|---------|-----------|---------|
| Google (Gemma) | Micro execution | 14k RPD | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| DeepSeek | Planning/Advisory | Limited free | [platform.deepseek.com](https://platform.deepseek.com) |
| GLM | Macro execution | Limited free | [open.bigmodel.cn](https://open.bigmodel.cn) |

---

## 🚀 Usage

### Interactive Mode

```bash
# Launch with wizard
shark

# Direct to Micro Engineer
shark micro

# Direct to Macro Engineer
shark macro
```

### Non-Interactive Mode

```bash
# Pipe input
echo "Add error handling to this function" | shark micro

# File input
cat task.txt | shark macro
```

### REPL Commands

| Command | Description |
|---------|-------------|
| `/mode` | Switch between Micro/Macro mode |
| `/clear` | Clear screen |
| `/exit` | Exit Shark |

---

## 📁 Project Structure

```
shark-frankenstein/
├── src/
│   ├── brain/
│   │   ├── types.ts         # Type definitions
│   │   ├── coordinator.ts   # Dual-brain coordination
│   │   ├── deepseek.ts      # DeepSeek R1 client
│   │   ├── gemma.ts         # Gemma 3 4B client
│   │   └── glm.ts           # GLM 4.5 client
│   ├── config/
│   │   └── index.ts         # Configuration management
│   ├── guardian/
│   │   └── index.ts         # Universal agent firewall
│   ├── testing/
│   │   └── *.ts             # Test runner modules
│   ├── utils/
│   │   ├── stdin.ts         # Stdin utility
│   │   └── index.ts         # Utils export
│   ├── wizard/
│   │   └── index.ts         # Interactive wizard
│   ├── cli.ts               # CLI entry point
│   └── index.ts             # Main exports
├── testing/
│   ├── TESTING_PROTOCOL.md  # 2-stage testing docs
│   ├── run-stage1.sh        # Docker sandbox tests
│   ├── run-stage2.sh        # Local device tests
│   ├── stage1-docker/       # Docker test scripts
│   └── stage2-local/        # Local test scripts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🎯 When to Use Which Mode?

### Use Micro Engineer When:

- 🎯 **ANY coding task** - it's a full-stack AI coder!
- 📝 Features, refactoring, debugging
- 🏗️ Architecture and multi-file work
- ✅ Writing tests and documentation
- 👀 Code reviews
- 💰 **Cost optimization** - FREE execution (14k RPD)
- ⚡ Quick iterations with instant feedback

### Use Macro Engineer When:

- 🔄 **Multi-step autonomous execution** - iterates up to 15 times
- 🚀 Full DevOps pipeline setup
- ✨ Autonomous project scaffolding (creates entire project structures)
- 📁 Multi-file architecture with cross-file dependencies
- 🔀 Workflows requiring independent decision-making
- 📐 Large-scale system migrations
- 🤖 Tasks needing minimal human oversight
- ⚠️ **Willing to pay** for GLM tokens (not free like Micro)

---

## 🔒 Guardian (Universal Agent Firewall)

**Guardian is NOT just for Docker - it protects ALL agent operations.**

Guardian is the core safety rail that prevents agents from:
- Modifying system files
- Accessing personal credentials
- Breaking critical configurations
- Escaping designated workspace boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│  GUARDIAN PROTECTION LEVELS                                     │
├─────────────────────────────────────────────────────────────────┤
│  STRICT     → Only explicit workspace allowed                   │
│  BALANCED   → Workspace + dev folders (DEFAULT)                 │
│  PERMISSIVE → Only critical system files blocked                │
│  SANDBOX    → All writes redirected to isolated sandbox         │
└─────────────────────────────────────────────────────────────────┘
```

```typescript
import { Guardian, ProtectionLevel } from '@leviathan/shark-cli';

// For testing (safest)
const guardian = new Guardian({
  level: ProtectionLevel.SANDBOX,
  workspacePath: './my-project',
  autoBackup: true
});

// For production
const guardian = new Guardian({
  level: ProtectionLevel.BALANCED,
  workspacePath: './my-project',
  auditLog: true
});

// Check before any operation
const decision = guardian.checkModification('/etc/passwd');
// → ModificationDecision.DENY (system file)

const decision2 = guardian.checkModification('./src/index.ts');
// → ModificationDecision.ALLOW (workspace)
```

### Zone Classification

Guardian classifies all paths into zones:

| Zone | Description | Can Modify? |
|------|-------------|-------------|
| WORKSPACE | Designated project folder | ✅ Yes |
| SANDBOX | Isolated test environment | ✅ Yes |
| DEVELOPMENT | ~/Projects, ~/code, etc. | ✅ Yes (BALANCED) |
| PERSONAL | ~/.ssh, ~/.aws, Documents | ❌ No |
| CONFIG | /etc, config files | ❌ No |
| SYSTEM | /bin, /usr, /System | ❌ NEVER |

---

## 🧪 2-Stage Testing Protocol

Shark CLI enforces a **2-Stage Testing Protocol** before any code is production-ready.

### Stage 1: Docker Sandbox (Automated CI)

```bash
# Run Stage 1 tests
npm run test:stage1

# Or directly
bash testing/run-stage1.sh
```

- Isolated environment (no host contamination)
- Reproducible (same results every time)
- Catches Docker-specific issues
- Guardian runs in SANDBOX mode

### Stage 2: Local Device (Real User Testing)

```bash
# Run Stage 2 tests (requires interactive terminal)
npm run test:stage2

# Safest mode - all writes to sandbox
npm run test:stage2:sandbox

# With real API calls
npm run test:api
```

- Real TTY (interactive wizard works properly)
- Actual network conditions
- Real API key validation
- **Guardian protects your local device**

### Testing Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run Stage 1 + quick Stage 2 |
| `npm run test:stage1` | Docker sandbox tests |
| `npm run test:stage2` | Local device tests |
| `npm run test:stage2:sandbox` | Local tests in sandbox mode |
| `npm run test:api` | Test real API calls |
| `npm run test:guardian` | Guardian security tests |

---

## 🌍 Gemma Region Configuration

**IMPORTANT**: Gemma 3 4B free tier only works from US or SEA regions.

- **SEA** (Southeast Asia) - Default, recommended
- **US** (United States) - Alternative

EU region will NOT work with the free tier.

```bash
# Set region via environment
SHARK_REGION=sea shark micro
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (no build)
npm run dev

# Link for global use
npm link
```

---

## 📋 Roadmap

### Phase 1: Frankenstein CLI ✅ (Current)
- TypeScript implementation
- Dual-brain architecture (Micro: DeepSeek+Gemma, Macro: GLM+DeepSeek)
- Micro/Macro engineer modes
- Interactive wizard
- Guardian universal firewall (Docker + Local protection)
- 2-Stage Testing Protocol (Docker → Local)
- Non-interactive mode support

### Phase 2: Rust Kernel (Future)
- Native Rust implementation
- Better memory management
- 10+ concurrent terminals
- Self-contained binary

### Phase 3: Kraken (Future)
- Agentized dev teams
- 3-5 micro engineers
- 1 macro supervisor
- Distributed execution

---

## 📄 License

Apache-2.0

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

<p align="center">
  <strong>🦈 Shark CLI - Think DeepSeek, Execute Gemma/GLM</strong>
</p>
