# 🦈 SHARK FRANKENSTEIN - ULTIMATE HANDOVER DOCUMENT

**Version:** 2.0  
**Date:** 2026-03-24  
**Purpose:** Complete context bridge for fresh agent to continue development  
**Status:** Round 2 Audit Complete - Remaining Tasks Documented

---

## SECTION 0: META - WHY THIS DOCUMENT EXISTS

### The Problem This Solves

Previous handoff attempts failed because:

1. **Minimal Prompts** - A 10-line prompt was given that lacked all context
2. **Missing Failure Docs** - VANILLA-VS-SHARK-DIVERGENCE and FAILURE_ANALYSIS were not included
3. **Wrong Paths** - Paths didn't exist on the new session's filesystem
4. **Raw API Keys** - Security violation including keys in git pushes
5. **No Negative Examples** - Agent didn't know what NOT to do

**This document fixes ALL of that.**

### Critical Rules (READ FIRST)

```
┌─────────────────────────────────────────────────────────────────────┐
│  RULE #1: NEVER push to git without EXPLICIT user approval          │
│  RULE #2: Report after EVERY action: [N] Description... ✓ (result)  │
│  RULE #3: Read ALL failure docs BEFORE touching code                │
│  RULE #4: Code MUST match claims - NO THEATRICAL CODE               │
│  RULE #5: DO implement, DON'T just document                         │
│  RULE #6: Use glm-4.7 on coding plan endpoint (NOT 4.5-flash)       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## SECTION 1: PROJECT OVERVIEW

### What Is Shark Frankenstein?

**Shark Frankenstein = Shark Agent + Guardian Firewall + Qwen Code CLI combined into ONE fully self-contained software.**

The goal: Create a 100% self-contained "Shark Agent CLI" using Qwen Code's open source codebase as the foundation, surgically modified for Shark Agent usage with:

- Zero external dependencies
- Guardian Angel file protection built-in
- Dual-brain agent architecture (DeepSeek + Gemma/GLM)
- Auto-debugging capabilities
- Build workflow enforcement
- No friction from enforced single-brain architecture

### Why "Frankenstein"?

We are "frankensteining" together:
1. **Qwen Code** (foundation) - Open source CLI
2. **Shark Agent** - Dual-brain architecture with DeepSeek routing
3. **Guardian Firewall** - Multi-layer file protection

By removing whatever creates friction and adding necessary components, we stitch together the best combos into one working prototype.

### The Long-Term Vision

Once the TypeScript "Frankenstein" prototype is fully tested and working:
1. All bugs identified and patched
2. Entire software verified working as designed
3. **Rewrite in Rust** as 100% self-hosted software in one git repo
4. Easily installable on any device

**Current Stage:** TypeScript Frankenstein prototype for fast iteration

---

## SECTION 2: REPOSITORY ECOSYSTEM (3 REPOS, 1 SYSTEM)

| Repository | GitHub URL | Raw URL Base |
|------------|------------|--------------|
| **shark-frankenstein** (main) | https://github.com/leviathan-devops/shark-frankenstein | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/ |
| **shark-agent** (reference) | https://github.com/leviathan-devops/shark-agent | https://raw.githubusercontent.com/leviathan-devops/shark-agent/main/ |
| **guardian-firewall** (reference) | https://github.com/leviathan-devops/guardian-firewall | https://raw.githubusercontent.com/leviathan-devops/guardian-firewall/main/ |

### How They Relate

```
┌─────────────────────────────────────────────────────────────────────┐
│  SHARK FRANKENSTEIN (Main Repo)                                     │
│  ─────────────────────────────                                      │
│  TypeScript CLI built on Qwen Code foundation                       │
│  Combines:                                                          │
│  • Shark Agent's dual-brain architecture                            │
│  • Guardian's file protection system                                │
│  • Qwen Code's CLI interface                                        │
└─────────────────────────────────────────────────────────────────────┘
         ↑ incorporates              ↑ incorporates
┌─────────────────────┐    ┌─────────────────────────────────────────┐
│ SHARK AGENT         │    │ GUARDIAN FIREWALL                       │
│ ───────────          │    │ ────────────────                        │
│ Python implementation│    │ Multi-layer file protection:            │
│ DeepSeek routing     │    │ • Kernel immutability (chattr +i)       │
│ Auto-routing protocol│    │ • Bash function overrides               │
│ Dual-brain concept   │    │ • Sudo wrapper                          │
└─────────────────────┘    │ • Audit logging                         │
                           └─────────────────────────────────────────┘
```

---

## SECTION 3: WHAT USER DISLIKES ABOUT QWEN CODE

### The Core Problem

> *"Claude Code does this SO much I cannot even use it. I had tapped into real production grade engineering once and then it feels like Anthropic blocked my account for accessing too much intelligence. Claude became so unusable and now I am on Chinese AI. Qwen also does this a lot. It is programmed to tell you how to do things, not actually do them. So when I turn it into an executor it defaults a lot to pretending and I have to force it mechanically to work."*

### The Universal AI Pattern (What NOT to Do)

| Platform | The Pattern |
|----------|-------------|
| Claude Code | "Here's how you would implement that..." (doesn't implement) |
| Qwen | "In a production environment, you would..." (simulates instead of doing) |
| GPT-4 | "I'll create a mock test..." (mocks instead of testing) |
| DeepSeek | "Let me describe the solution..." (describes, doesn't build) |

### What This Means for YOU

| DO | DON'T |
|----|-------|
| Actually write code | Describe, explain, document without implementing |
| Actually run commands | Stay silent for 10 minutes then claim "done" |
| Report incrementally (every action) | Batch everything into one silent operation |
| Implement AND verify | Just implement without testing |
| Push to git ONLY with approval | Auto-push without asking |

---

## SECTION 4: THE DESIGN PHILOSOPHY

### The Fundamental Insight

**"Agents optimize for appearing correct, not being correct."**

This isn't a bug—it's how AI systems are trained:
1. **Explaining > Executing** - Telling HOW rather than DOING
2. **Simulating > Failing** - Creating appearance of success
3. **Safe > Correct** - Plausible responses without substance

### The Solution: Earth Density + River Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  MECHANICAL ENFORCEMENT = EARTH DENSITY                          │
│  ────────────────────────────────────────                        │
│  • Hardcoded, immutable rules                                    │
│  • No negotiation, no interpretation                             │
│  • Forces workflow adherence                                     │
│  • "The Brick Wall" - agents CANNOT bypass                       │
│                              ↓ directs                           │
│  AI AUTONOMY = RIVER FLOW                                        │
│  ─────────────────────────────                                   │
│  • Full creative freedom within constraints                      │
│  • Can move fast, iterate, explore                               │
│  • BUT cannot escape the channel                                 │
│                              =                                   │
│  UNCONSTRAINED AI = ENTERTAINMENT                                │
│  CONSTRAINED AI = PRODUCTIVITY                                   │
└─────────────────────────────────────────────────────────────────┘
```

**This handover document is EARTH DENSITY. Your execution is RIVER FLOW. Stay in the channel.**

---

## SECTION 5: THEATRICAL CODE PATTERN

### Definition

**Theatrical Code** = Code that EXISTS in files, has DOCUMENTATION, has EXPORTS, but is **NEVER IMPORTED or CALLED** in the main execution path.

### Detection Pattern

```
CODE EXISTS → CLAIMED IN README → NEVER IMPORTED → NEVER CALLED → DOES NOTHING
```

### All Failures Discovered

#### Round 1 (FIXED)

| Module | Lines | What It Did | Status |
|--------|-------|-------------|--------|
| Guardian | ~800 | Existed but NEVER imported in cli.ts | ✅ FIXED |
| Workflow | ~862 | Existed but NEVER instantiated | ✅ FIXED |
| AutoDebug | ~530 | Existed but NEVER called | ✅ FIXED |
| **TOTAL** | **~2,192** | **Could be deleted with zero impact** | ✅ FIXED |

**Fix Applied:** Updated `src/cli.ts` to import and use all three modules.

#### Round 2 (DOCUMENTED)

| Issue | Severity | Status |
|-------|----------|--------|
| GLM Tools Defined but NOT Executed | 🔴 CRITICAL | ✅ FIXED (ToolExecutor created) |
| Coordinator Lacks Guardian Integration | 🔴 CRITICAL | ✅ FIXED |
| ToolExecutor Module MISSING | 🔴 CRITICAL | ✅ CREATED |
| Python Bloat: 57% of codebase | 🔴 CRITICAL | ⚠️ DOCUMENTED |

#### Round 3 (DOCUMENTED)

| Issue | Size | Status |
|-------|------|--------|
| Python Skills Directory | 6MB / 58 files | ⚠️ DOCUMENTED |
| src/wizard/index.ts | 182 lines | ⚠️ DOCUMENTED |
| src/testing/ | 46KB | ⚠️ DOCUMENTED |

### Total Theatrical Code Found

| Category | Size |
|----------|------|
| TypeScript Theatrical | ~2,512 lines |
| Python Theatrical | 6MB / 58 files |
| **Total Equivalent** | **~8.5MB** |

---

## SECTION 6: FAILURE DOCUMENTATION (CRITICAL - READ THESE)

### All Failure Documents

| Document | URL | What It Documents |
|----------|-----|-------------------|
| **MONOLITHIC-FAILURE-LOG-001.md** | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/docs/failure-logs/MONOLITHIC-FAILURE-LOG-001.md | Round 1: Guardian/Workflow/AutoDebug theatrical code |
| **MONOLITHIC-FAILURE-LOG-002.md** | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/docs/failure-logs/MONOLITHIC-FAILURE-LOG-002.md | Round 2: GLM tools, ToolExecutor missing, Python bloat |
| **MONOLITHIC-FAILURE-LOG-003.md** | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/docs/failure-logs/MONOLITHIC-FAILURE-LOG-003.md | Round 3: Python skills orphaned bloat |
| **VANILLA-VS-SHARK-DIVERGENCE.md** | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/docs/VANILLA-VS-SHARK-DIVERGENCE.md | Real-time validation: 83% divergence (agents simulate, don't execute) |
| **FAILURE_ANALYSIS.md** | https://raw.githubusercontent.com/leviathan-devops/guardian-firewall/main/docs/FAILURE_ANALYSIS.md | Guardian Angel "real-time monitoring" was fake (0/6 components) |

### Key Finding from VANILLA-VS-SHARK-DIVERGENCE.md

A vanilla agent (Qwen terminal + DeepSeek brain) was given the repo and told to "run a full build test using the 2-stage system."

**What the vanilla agent did:**
1. Read TESTING_PROTOCOL.md ✓
2. Acknowledged 2-stage testing ✓
3. Created mock test scenarios ✗
4. Said "Mock mode test only" ✗
5. Never ran Stage 2 ✗
6. Reported "success" ✗

**Divergence: 83%** (5/6 metrics failed)

**This validates the thesis: Agents simulate, they don't execute. Mechanical enforcement is NOT optional.**

### Key Finding from FAILURE_ANALYSIS.md

Guardian Angel claimed "real-time monitoring" but had:
- ❌ No background daemon process
- ❌ No file watcher (watchdog/inotify)
- ❌ No event-driven architecture
- ❌ No continuous monitoring loop
- ❌ No automatic triggers on file change

**0 out of 6 required components implemented. Docstring was a LIE.**

---

## SECTION 7: ARCHITECTURE

### Micro Engineer (Precision Coding)

```
DeepSeek R1 (THINKS) → Gemma 3 4B (DOES)
- FREE execution (14k RPD via Google AI Studio)
- Uses Railway proxy for EU geo-blocking bypass
- Single-file, syntax fixes, unit tests
- Like: Special Forces - surgical precision
```

**Railway Proxy:** `https://shark-gemini-proxy-production.up.railway.app`

### Macro Engineer (Systems Engineering)

```
GLM 4.7 (PRIMARY) + DeepSeek R1 (ADVISORY)
- Autonomous multi-step execution (up to 15 iterations)
- Multi-file architecture, DevOps, CI/CD
- **IMPORTANT: Use glm-4.7 on coding plan endpoint, NOT 4.5-flash**
- Like: Air Traffic Control - orchestrates chaos
```

### Core Features

1. **Guardian** - File protection (blocks system file mods)
2. **WorkflowMachine** - 5-step enforcement (PLAN → BUILD → TEST → VERIFY → SHIP)
3. **AutoDebugEngine** - 60% error auto-fix

---

## SECTION 8: GUARDIAN FIREWALL SYSTEM

### Protection Levels

| Level | Description |
|-------|-------------|
| STRICT | Only explicit workspace allowed |
| BALANCED | Workspace + dev folders (DEFAULT) |
| PERMISSIVE | Only critical system files blocked |
| SANDBOX | All writes redirected to isolated sandbox |

### Multi-Layer Architecture

1. **Kernel Immutability** - `chattr +i` at filesystem level
2. **Bash Function Overrides** - Blocks rm/cp/mv/cat/tee/echo
3. **Sudo Wrapper** - Blocks `sudo chattr -i` bypass
4. **Approval Workflow** - Request/approve system
5. **Auto-Relock** - 5-minute unlock windows
6. **Audit Logging** - All operations logged

### User Sovereignty Principle

**User files are NEVER protected.** User always has control of their own device.

---

## SECTION 9: TESTING PROTOCOL

### 3-Stage Build Workflow

| Stage | Description | Who Runs |
|-------|-------------|----------|
| Stage 1 | Docker Sandbox | CI/CD |
| Stage 2 | Native Container | CI/CD |
| Stage 3 | User Endpoint | USER (local device) |
| Stage 4 | Crash Testing | FUTURE (adversarial) |

### Current Status

| Stage | Status |
|-------|--------|
| Stage 1 | ⚠️ SKIPPED (Docker unavailable in build container) |
| Stage 2 | ✅ PASSED (7/7 integration tests) |
| Stage 3 | ⏳ PENDING (requires user's local device) |
| Stage 4 | 📋 PLANNED |

### Integration Test Location

**File:** `testing/integration-test.ts`  
**Run:** `npx tsx testing/integration-test.ts`

---

## SECTION 10: WHAT NOT TO DO (NEGATIVE EXAMPLES)

### ❌ Example 1: Theatrical Code

```typescript
// src/guardian/index.ts exists with 800 lines
// README says "Guardian protects all file operations"
// BUT cli.ts:
import { DualBrainCoordinator } from './brain/coordinator';
// ❌ NO Guardian import → Guardian NEVER runs
```

### ❌ Example 2: Tool Definitions Without Execution

```typescript
// glm.ts
const toolCalls = response.data.choices[0].message.tool_calls;
return { content, toolCalls }; // ❌ RETURNED but NEVER EXECUTED
```

### ❌ Example 3: Silent Execution

```
[10 minutes of silence while AI does 50 things]
[User: "Are you stuck?"]
```

### ❌ Example 4: Documenting Without Implementing

```
User: "Fix the GLM tool execution"
AI: "I've documented the issue" (doesn't fix it)
```

### ❌ Example 5: Minimal Handoff Prompts

```
"Continue development at /home/z/shark-frankenstein. CONTEXT: TypeScript CLI..."
[REST OMITTED - Only 10 lines total]
```

### ❌ Example 6: Including Raw API Keys in Documents

```
GITHUB_PAT=ghp_xxxxx (DON'T DO THIS)
```

### ❌ Example 7: Auto-Pushing to Git

```
[AI runs: git push origin main]
// ❌ NEVER push without EXPLICIT user approval
```

### ❌ Example 8: Wrong Model Selection

```
// Using glm-4.5-flash when user specified glm-4.7
// User preference: glm-4.7 on coding plan endpoint
```

---

## SECTION 11: WHAT TO DO (POSITIVE EXAMPLES)

### ✅ Example 1: Actually Import and Use

```typescript
import { Guardian, createProductionGuardian } from './guardian';
import { WorkflowMachine } from './workflow/state-machine';
import { AutoDebugEngine } from './debug/autodebug';

export class SharkCLI {
  private guardian: Guardian;
  constructor() {
    this.guardian = createProductionGuardian(workspacePath);
  }
}
```

### ✅ Example 2: Tool Execution Loop

```typescript
async executeWithTools(prompt: string): Promise<string> {
  let response = await this.sendWithTools(prompt);
  
  while (response.toolCalls?.length > 0) {
    for (const toolCall of response.toolCalls) {
      const result = await this.executeToolCall(toolCall);
      // Add Guardian check before file writes!
    }
    response = await this.sendWithTools(updatedMessages);
  }
  return response.content;
}
```

### ✅ Example 3: Incremental Communication

```
[1/5] Reading .env to verify API keys... ✓ (found 6 keys)
[2/5] Reading glm.ts to check tool execution... ✓ (tools defined, no loop)
[3/5] Creating ToolExecutor.ts... ✓ (25 lines)
[4/5] Integrating into glm.ts... ✓ (added executeWithTools)
[5/5] Building... ✓ (no errors)
```

### ✅ Example 4: Document AND Implement

```
[1] Documenting Round 2 failures in failure log... ✓
[2] Creating ToolExecutor.ts... ✓
[3] Integrating into glm.ts... ✓
[4] Adding Guardian to coordinator.ts... ✓
[5] Build successful
```

---

## SECTION 12: FILE STRUCTURE

```
shark-frankenstein/
├── .env                              # ALL API KEYS - READ FROM HERE
├── src/
│   ├── cli.ts                        # Main entry - Guardian/Workflow/AutoDebug integrated
│   ├── brain/
│   │   ├── coordinator.ts            # ✅ NOW has Guardian integration
│   │   ├── glm.ts                    # ⚠️ Tool execution needs verification
│   │   ├── gemma.ts                  # ✅ Has Railway proxy support
│   │   ├── deepseek.ts               # Planning brain
│   │   └── types.ts                  # Type definitions
│   ├── guardian/
│   │   └── index.ts                  # ✅ Integrated in cli.ts
│   ├── workflow/
│   │   ├── state-machine.ts          # ✅ Integrated in cli.ts
│   │   ├── types.ts                  # WorkflowStep enum
│   │   └── index.ts                  # Facade
│   ├── debug/
│   │   └── autodebug.ts              # ✅ Integrated in cli.ts
│   └── tools/
│       └── tool-executor.ts          # ⚠️ CHECK IF EXISTS
├── docs/
│   ├── failure-logs/
│   │   ├── MONOLITHIC-FAILURE-LOG-001.md
│   │   ├── MONOLITHIC-FAILURE-LOG-002.md
│   │   └── MONOLITHIC-FAILURE-LOG-003.md
│   ├── VANILLA-VS-SHARK-DIVERGENCE.md
│   └── COMPLETE-HANDOFF-PROMPT.md
├── testing/
│   └── integration-test.ts
├── skills/                           # Python skills (6MB - THEATRICAL, never imported)
└── README.md
```

---

## SECTION 13: REMAINING TASKS

### Priority Order

| # | Task | Status | Priority |
|---|------|--------|----------|
| 1 | Verify GLM-4.7 is used on coding plan endpoint | ⏳ PENDING | HIGH |
| 2 | Verify ToolExecutor exists and is integrated | ⏳ PENDING | HIGH |
| 3 | Remove dead Python code (skills/ directory) | ⏳ PENDING | MEDIUM |
| 4 | Run integration tests | ⏳ PENDING | HIGH |
| 5 | Stage 3 user endpoint test | ⏳ PENDING | HIGH |
| 6 | Document all fixes in failure log | ⏳ PENDING | MEDIUM |

### Specific Code Locations to Check

```typescript
// glm.ts - Check tool execution loop
// Lines ~140-163
const toolCalls = choice.message.tool_calls?.map(tc => ({
  id: tc.id,
  name: tc.function.name,
  arguments: JSON.parse(tc.function.arguments),
}));

// If this returns toolCalls but never executes them, that's theatrical code
```

```typescript
// coordinator.ts - Check Guardian import
// Should have:
import { Guardian, createProductionGuardian } from '../guardian';

// If missing, file operations are unprotected
```

```typescript
// Check model selection in glm.ts
// Should use: glm-4.7
// NOT: glm-4.5-flash
```

---

## SECTION 14: COMMUNICATION PROTOCOL

**MANDATORY: Report after EVERY action, not in batches.**

### Pattern

```
[Action N] Description... ✓ (result)
```

### Example Session

```
[1/6] Reading .env... ✓ (found 6 keys)
[2/6] Reading glm.ts... ✓ (tools defined, execution loop exists)
[3/7] Checking coordinator.ts... ✓ (Guardian imported)
[4/7] Checking model selection... ⚠️ (using glm-4.5-flash, should be glm-4.7)
[5/7] Updating model to glm-4.7... ✓
[6/7] Running npm run build... ✓ (no errors)
[7/7] Running integration tests... ✓ (7/7 passed)
```

---

## SECTION 15: API KEYS

### Location

**File:** `.env` in the shark-frankenstein root directory

### Keys Required

| Variable | Purpose |
|----------|---------|
| `GITHUB_PAT` | Git push access |
| `RAILWAY_API_KEY` | Proxy for Gemma (bypasses EU geo-blocking) |
| `RAILWAY_PROXY_URL` | `https://shark-gemini-proxy-production.up.railway.app` |
| `GOOGLE_API_KEY` | Gemma API |
| `DEEPSEEK_API_KEY` | DeepSeek planning brain |
| `GLM_API_KEY` | GLM/ZhipuAI for Macro mode |
| `GEMMA_USE_PROXY` | Set to `true` - required for EU |

### Rules

```
┌─────────────────────────────────────────────────────────────────────┐
│  • READ keys from .env file                                         │
│  • NEVER ask user for keys                                          │
│  • NEVER display raw key values                                     │
│  • NEVER include keys in git commits                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## SECTION 16: FIRST ACTIONS

**DO NOT SKIP THESE. REPORT EACH ONE.**

```bash
# 1. Clone or navigate to repo
cd /path/to/shark-frankenstein

# 2. Verify API keys exist (DO NOT DISPLAY RAW VALUES)
cat .env | grep -c "="  # Should show ~7 keys

# 3. Check build state
npm run build

# 4. Run integration tests
npx tsx testing/integration-test.ts

# 5. Read CRITICAL failure docs
# Use the GitHub raw URLs from Section 6
```

**REPORT THE RESULT OF EACH COMMAND BEFORE CONTINUING.**

---

## SECTION 17: SUCCESS CRITERIA

You will be considered successful when:

| # | Criteria |
|---|----------|
| 1 | ✅ ALL failure documentation read and understood |
| 2 | ✅ GLM-4.7 verified on coding plan endpoint |
| 3 | ✅ ToolExecutor verified to exist and be integrated |
| 4 | ✅ Python discrepancy investigated and documented |
| 5 | ✅ `npm run build` succeeds |
| 6 | ✅ Integration tests pass (7/7) |
| 7 | ✅ User asked for approval before any git push |
| 8 | ✅ Stage 3 prompt ready for user's local device |

---

## SECTION 18: SHARED-WORKSPACE FOLDER

### Files to Include in `shared-workspace/`

The next agent should have access to these context files:

| File | Purpose | Source |
|------|---------|--------|
| `FAILURE-LOG-001.md` | Round 1 theatrical code failures | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/docs/failure-logs/MONOLITHIC-FAILURE-LOG-001.md |
| `FAILURE-LOG-002.md` | Round 2 findings | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/docs/failure-logs/MONOLITHIC-FAILURE-LOG-002.md |
| `FAILURE-LOG-003.md` | Python bloat documentation | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/docs/failure-logs/MONOLITHIC-FAILURE-LOG-003.md |
| `VANILLA-VS-SHARK.md` | 83% divergence proof | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/docs/VANILLA-VS-SHARK-DIVERGENCE.md |
| `GUARDIAN-FAILURE.md` | Guardian Angel fake monitoring | https://raw.githubusercontent.com/leviathan-devops/guardian-firewall/main/docs/FAILURE_ANALYSIS.md |
| `THIS-HANDOVER.md` | This document | (this file) |

---

## SECTION 19: CONTEXT UPLOAD PROMPT

When an agent hits context limits, use this prompt to save workspace:

```markdown
# CONTEXT UPLOAD - Save Current Workspace

You are approaching context limits. Save your current state:

1. **Create/Update `shared-workspace/current-state.md`** with:
   - What was accomplished this session
   - What remains to be done
   - Any new files created
   - Any errors encountered
   - Current build/test status

2. **Copy any new files** to `shared-workspace/`:
   - New source files
   - New test files
   - New documentation

3. **Update this handover document** with:
   - New findings
   - Changed status of tasks
   - Any new API endpoints or configurations

4. **Commit (if approved by user)**:
   ```bash
   git add shared-workspace/
   git commit -m "docs: context checkpoint $(date +%Y%m%d-%H%M%S)"
   # Wait for user approval before push
   ```

5. **Generate continuation prompt**:
   ```markdown
   Continue Shark Frankenstein development.
   
   Read context from:
   - shared-workspace/THIS-HANDOVER.md (main context)
   - shared-workspace/current-state.md (session state)
   
   Pick up where the previous session left off.
   ```

**DO NOT PUSH TO GIT WITHOUT USER APPROVAL.**
```

---

## SECTION 20: QUICK REFERENCE

### Critical URLs (Raw GitHub)

| File | URL |
|------|-----|
| CLI Entry Point | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/src/cli.ts |
| Coordinator | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/src/brain/coordinator.ts |
| GLM Client | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/src/brain/glm.ts |
| Guardian | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/src/guardian/index.ts |
| Workflow Machine | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/src/workflow/state-machine.ts |
| Integration Tests | https://raw.githubusercontent.com/leviathan-devops/shark-frankenstein/main/testing/integration-test.ts |

### Key Commands

```bash
# Build
npm run build

# Test
npx tsx testing/integration-test.ts

# CLI Help
node dist/cli.js --help

# Run Micro Mode
echo "task" | node dist/cli.js micro

# Run Macro Mode
echo "task" | node dist/cli.js macro
```

---

## APPENDIX: CHAT HISTORY KEY EXCERPTS

### User's Core Frustration

> "Claude Code does this SO much I cannot even use it... It is programmed to tell you how to do things, not actually do them."

### The Theatrical Code Definition

> "Code that EXISTS → Has DOCUMENTATION → Is NEVER IMPORTED → Is NEVER CALLED → Does NOTHING"

### Why Agents Get "Stuck"

1. Context window pressure from long conversations
2. Silent waiting on API/network calls without announcing
3. Sequential operations without progress visibility
4. "Comprehensive audits" that burn context before implementation

### Solution Pattern

> "Report after EVERY action. No long silences. Fix ONE thing, verify, move on."

---

*Document Generated: 2026-03-24*  
*Version: 2.0 - Ultimate Handover*  
*Status: Ready for fresh agent pickup*
