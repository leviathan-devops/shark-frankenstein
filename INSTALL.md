# 🦈 Shark CLI Installation Guide

> Quick setup to start using Shark CLI on your local machine

---

## 📋 Prerequisites

- **Node.js** v18+ (check: `node --version`)
- **npm** (check: `npm --version`)
- **Git** (check: `git --version`)

---

## 🚀 Quick Install

```bash
# 1. Clone the repo
git clone https://github.com/leviathan-devops/shark-frankenstein.git
cd shark-frankenstein

# 2. Install dependencies
npm install

# 3. Build the CLI
npm run build

# 4. Link globally (so you can run `shark` anywhere)
npm link
```

---

## 🔑 API Keys Setup

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit with your API keys
nano .env  # or use your preferred editor
```

### Required Keys

| Key | Get It From | Free Tier |
|-----|-------------|-----------|
| `GOOGLE_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | **14k requests/day FREE** |
| `DEEPSEEK_API_KEY` | [platform.deepseek.com](https://platform.deepseek.com) | Limited free |
| `GLM_API_KEY` | [open.bigmodel.cn](https://open.bigmodel.cn) | Limited free |

### Minimum Setup (Micro Engineer Only)

```bash
# Just these two for Micro Engineer mode
GOOGLE_API_KEY=your-google-api-key-here
DEEPSEEK_API_KEY=your-deepseek-key-here
```

### Full Setup (Both Modes)

```bash
GOOGLE_API_KEY=your-google-api-key-here
DEEPSEEK_API_KEY=your-deepseek-key-here
GLM_API_KEY=your-glm-api-key-here
SHARK_REGION=sea
SHARK_DEBUG=false
```

---

## ✅ Verify Installation

```bash
# Check CLI works
shark --help

# Should show:
# 🦈 SHARK CLI - AI Coding Assistant
# Usage:
#   shark              Start interactive mode with wizard
#   shark micro        Start in Micro Engineer mode
#   shark macro        Start in Macro Engineer mode
```

---

## 🎮 Usage

### Interactive Mode (Recommended for First Run)

```bash
shark
```

This launches the wizard that guides you through mode selection.

### Direct to Micro Engineer

```bash
shark micro
```

### Direct to Macro Engineer

```bash
shark macro
```

### Non-Interactive Mode (Piped Input)

```bash
# Pipe a task
echo "Add error handling to this function" | shark micro

# From a file
cat task.txt | shark micro
```

---

## 🧪 Test Your Setup

### Quick Test

```bash
# Test with a simple task
echo "Write a hello world function in Python" | shark micro
```

### Verify All APIs

```bash
# Run the API tests
cd testing
export GOOGLE_API_KEY=your-key
export DEEPSEEK_API_KEY=your-key
export GLM_API_KEY=your-key
./run-stage2.sh
```

---

## 🔧 Troubleshooting

### "Gemma API key required"

```bash
# Make sure GOOGLE_API_KEY is set
echo $GOOGLE_API_KEY

# If empty, set it:
export GOOGLE_API_KEY=your-key-here
```

### "Permission denied" on npm link

```bash
# Use sudo (macOS/Linux)
sudo npm link

# Or use without linking:
node dist/cli.js --help
```

### "Cannot find module"

```bash
# Make sure you built first
npm run build

# Check dist/ exists
ls -la dist/
```

### "GLM timeout"

GLM can be slow (~10-40s). Increase timeout:

```bash
export SHARK_TIMEOUT=60000  # 60 seconds
```

---

## 📁 Project Structure

```
shark-frankenstein/
├── dist/           # Compiled JavaScript (after build)
├── src/            # TypeScript source
│   ├── brain/      # AI clients (DeepSeek, Gemma, GLM)
│   ├── guardian/   # File protection system
│   ├── workflow/   # 5-step enforcement
│   ├── wizard/     # Interactive UI
│   └── cli.ts      # Entry point
├── testing/        # Test suites
├── .env            # Your API keys (create from .env.example)
└── package.json
```

---

## 🎯 Next Steps

1. **Try Micro Engineer** - Best for coding tasks, uses FREE Gemma tier
2. **Test Guardian** - See file protection in action
3. **Run full test suite** - Verify everything works
4. **Read the docs** - `docs/DESIGN-PHILOSOPHY.md` for architecture

---

## 🦈 Quick Reference

| Command | Description |
|---------|-------------|
| `shark` | Interactive wizard |
| `shark micro` | Micro Engineer (coding) |
| `shark macro` | Macro Engineer (systems) |
| `shark --help` | Show help |
| `echo "task" \| shark micro` | Non-interactive |
| `/mode` | Switch modes (in REPL) |
| `/exit` | Exit Shark |

---

**Happy coding! 🦈**
