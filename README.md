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

### Micro Engineer (Precision Coding)

```
┌─────────────────────────────────────────────────────┐
│  🦈 MICRO ENGINEER                                  │
│                                                     │
│  DeepSeek R1 ─────THINKS────→ Gemma 3 4B ─DOES→    │
│  (Planning Brain)           (Execution Brain)       │
│                                                     │
│  ✅ FREE execution (14k RPD)                        │
│  ✅ Best for: Single-file, syntax fixes, tests      │
│  ✅ Like: Special Forces - surgical precision       │
└─────────────────────────────────────────────────────┘
```

### Macro Engineer (Systems Engineering)

```
┌─────────────────────────────────────────────────────┐
│  🧠 MACRO ENGINEER                                  │
│                                                     │
│  GLM 4.5-flash ─────PRIMARY────→ Execution          │
│  DeepSeek R1   ─────ADVISORY────→ Strategy          │
│                                                     │
│  ✅ Autonomous multi-step execution                 │
│  ✅ Best for: Architecture, DevOps, CI/CD           │
│  ✅ Like: Air Force - full engineering capabilities │
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
│   │   └── index.ts         # File protection system
│   ├── utils/
│   │   ├── stdin.ts         # Stdin utility
│   │   └── index.ts         # Utils export
│   ├── wizard/
│   │   └── index.ts         # Interactive wizard
│   ├── cli.ts               # CLI entry point
│   └── index.ts             # Main exports
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🎯 When to Use Which Mode?

### Use Micro Engineer When:

- 📝 Single-file modifications
- 🔧 Syntax fixes and debugging
- ✅ Writing unit tests
- 👀 Code reviews
- 🎯 Linear coding tasks
- 💰 Cost optimization (FREE execution)

### Use Macro Engineer When:

- 🏗️ Multi-file architecture changes
- 🚀 DevOps and CI/CD pipelines
- ✨ Full feature development
- 🔄 Complex refactoring
- 📐 System design
- 🔀 Multi-step workflows

---

## 🔒 Guardian (File Protection)

Shark CLI includes a Guardian system for protecting critical files:

```typescript
import { Guardian } from '@leviathan/shark-cli';

const guardian = new Guardian({
  enabled: true,
  protectedFiles: ['./config/critical.json'],
  autoBackup: true
});

// Protect a file (requires root/sudo)
await guardian.protect('./important-file.ts');

// Check before modification
const decision = guardian.checkModification('./important-file.ts');
```

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
- Dual-brain architecture
- Micro/Macro engineer modes
- Interactive wizard

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
