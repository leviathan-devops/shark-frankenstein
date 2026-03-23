# 🦈 SHARK FRANKENSTEIN - COMPLETE HANDOFF PROMPT

**COPY THIS ENTIRE FILE INTO A NEW CHAT WINDOW**

**THIS FILE IS FOR LOCAL USE ONLY - DO NOT PUSH TO GIT**

---

## SECTION 0: META - WHY THIS DOCUMENT EXISTS

### The Previous AI Failed At Handoff

The previous session ended with the AI giving a ~10 line "prompt" that lacked:
- No failure context
- No negative examples
- No positive examples  
- No repo context from shark-agent/guardian-firewall
- Raw API keys in the prompt (security violation)
- Attempted to push to git without user approval

**This document fixes ALL of that.**

### Critical Rule: No Auto-Pushing to Git
**NEVER push to git without EXPLICIT user approval.** This is non-negotiable.

---

## SECTION 1: REPOSITORY ECOSYSTEM (3 REPOS, 1 SYSTEM)

Shark Frankenstein is a **combination of 3 separate projects**:

| Repo | Location | Purpose |
|------|----------|---------|
| **shark-frankenstein** | `/home/z/shark-frankenstein` | Main TypeScript CLI - Dual-brain AI coder |
| **shark-agent** | `/home/z/my-project/audit-shark-agent` | Python implementation - DeepSeek routing |
| **guardian-firewall** | `/home/z/my-project/audit-guardian` | Multi-layer file protection system |

### Why "Frankenstein"?

**Qwen Code is the foundation.** We are surgically editing it to fit our needs:
- Removing bottlenecks
- Adding Guardian protection
- Adding Workflow enforcement
- Adding Auto-Debug
- Combining with Shark Agent's dual-brain architecture

**"Frankenstein" = stitching together multiple systems into one working body.**

### GitHub Repository
`https://github.com/leviathan-devops/shark-frankenstein`

---

## SECTION 2: API KEYS (IN .env - DO NOT INCLUDE RAW VALUES)

The `.env` file at `/home/z/shark-frankenstein/.env` contains ALL keys:

| Variable | Purpose |
|----------|---------|
| `GITHUB_PAT` | Git push access |
| `RAILWAY_API_KEY` | Proxy for Gemma (bypasses EU geo-blocking) |
| `RAILWAY_PROXY_URL` | `https://shark-gemini-proxy-production.up.railway.app` |
| `GOOGLE_API_KEY` | Gemma API |
| `DEEPSEEK_API_KEY` | DeepSeek planning brain |
| `GLM_API_KEY` | GLM/ZhipuAI for Macro mode |
| `GEMMA_USE_PROXY` | Set to `true` - required for EU |

**ACTION: Read keys from .env file. NEVER ask user for keys.**

---

## SECTION 3: WHAT USER DISLIKES ABOUT QWEN CODE

### The Core Problem (From User's Experience)

> *"Claude Code does this SO much I cannot even use it. I had tapped into real production grade engineering once and then it feels like Anthropic blocked my account for accessing too much intelligence. Claude became so unusable and now I am on Chinese AI. Qwen also does this a lot. It is programmed to tell you how to do things, not actually do them. So when I turn it into an executor it defaults a lot to pretending and I have to force it mechanically to work."*

### The Universal AI Pattern (What NOT to do):

| Platform | The Pattern |
|----------|-------------|
| Claude Code | "Here's how you would implement that..." (doesn't implement) |
| Qwen | "In a production environment, you would..." (simulates instead of doing) |
| GPT-4 | "I'll create a mock test..." (mocks instead of testing) |
| DeepSeek | "Let me describe the solution..." (describes, doesn't build) |

### What This Means for YOU:
- **DO** → Actually write code, actually run commands
- **DON'T** → Describe, explain, document without implementing
- **DO** → Report incrementally (every action)
- **DON'T** → Stay silent for 10 minutes then claim "done"

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

**This handoff document is EARTH DENSITY. Your execution is RIVER FLOW. Stay in the channel.**

---

## SECTION 5: THEATRICAL CODE PATTERN

### Definition:
Code that EXISTS in files, has DOCUMENTATION, has EXPORTS, but is **NEVER IMPORTED or CALLED** in the main execution path.

### Round 1 Failures (From Forensic Audit):

| Module | Lines | What It Did |
|--------|-------|-------------|
| Guardian | ~800 | Existed but NEVER imported in cli.ts |
| Workflow | ~862 | Existed but NEVER instantiated |
| AutoDebug | ~530 | Existed but NEVER called |
| **TOTAL** | **~2,192** | **Could be deleted with zero impact** |

### Round 1 Fix Applied:
Updated `src/cli.ts` to import and use all three modules.

### Round 2 Findings (NEW ISSUES):

1. **GLM Tools Defined but NOT Executed**
   - `src/brain/glm.ts` defines tools: `write_file`, `read_file`, `run_command`, `search`
   - Tools passed to GLM API
   - GLM returns `tool_calls` in response
   - **NO LOOP TO EXECUTE THOSE TOOL CALLS**
   - Tools exist but are never processed

2. **Coordinator Lacks Guardian Integration**
   - `src/brain/coordinator.ts` coordinates brains
   - Does NOT import or use Guardian
   - When GLM wants to write file → NO Guardian check

3. **Python Bloat: 57% of Codebase**
   - 6MB / 58 Python files
   - Never imported in TypeScript core
   - Unexplained - needs investigation

### The Pattern to Watch For:
```
CODE EXISTS → CLAIMED IN README → NEVER IMPORTED → NEVER CALLED → DOES NOTHING
```

---

## SECTION 5.5: FAILURE DOCUMENTATION (ALL LOGS)

### All Failure Documents - READ THESE:

| Document | Location | What It Documents |
|----------|----------|-------------------|
| **MONOLITHIC-FAILURE-LOG-001.md** | `docs/failure-logs/` | Round 1: Guardian/Workflow/AutoDebug theatrical code |
| **VANILLA-VS-SHARK-DIVERGENCE.md** | `docs/` | Real-time validation: Vanilla agent simulated tests (83% divergence) |
| **FAILURE_ANALYSIS.md** | Guardian repo `docs/` | Guardian Angel "real-time monitoring" was fake (0/6 components) |

### Key Finding from VANILLA-VS-SHARK-DIVERGENCE.md:

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

### Key Finding from FAILURE_ANALYSIS.md (Guardian):

Guardian Angel claimed "real-time monitoring" but had:
- ❌ No background daemon process
- ❌ No file watcher (watchdog/inotify)
- ❌ No event-driven architecture
- ❌ No continuous monitoring loop
- ❌ No automatic triggers on file change

**0 out of 6 required components implemented. Docstring was a LIE.**

---

## SECTION 6: ARCHITECTURE

### Micro Engineer (Precision Coding)
```
DeepSeek R1 (THINKS) → Gemma 3 4B (DOES)
- FREE execution (14k RPD via Google AI Studio)
- Uses Railway proxy for EU geo-blocking bypass
- Single-file, syntax fixes, unit tests
- Like: Special Forces - surgical precision
```

### Macro Engineer (Systems Engineering)
```
GLM 4.5-flash (PRIMARY) + DeepSeek R1 (ADVISORY)
- Autonomous multi-step execution (up to 15 iterations)
- Multi-file architecture, DevOps, CI/CD
- Tool definitions exist but need execution loop
- Like: Air Traffic Control - orchestrates chaos
```

### Core Features:
1. **Guardian** - File protection (blocks system file mods)
2. **WorkflowMachine** - 5-step enforcement (PLAN → BUILD → TEST → VERIFY → SHIP)
3. **AutoDebugEngine** - 60% error auto-fix

---

## SECTION 7: GUARDIAN FIREWALL SYSTEM (From guardian-firewall repo)

### Protection Levels:
| Level | Description |
|-------|-------------|
| STRICT | Only explicit workspace allowed |
| BALANCED | Workspace + dev folders (DEFAULT) |
| PERMISSIVE | Only critical system files blocked |
| SANDBOX | All writes redirected to isolated sandbox |

### Multi-Layer Architecture:
1. **Kernel Immutability** - `chattr +i` at filesystem level
2. **Bash Function Overrides** - Blocks rm/cp/mv/cat/tee/echo
3. **Sudo Wrapper** - Blocks `sudo chattr -i` bypass
4. **Approval Workflow** - Request/approve system
5. **Auto-Relock** - 5-minute unlock windows
6. **Audit Logging** - All operations logged

### User Sovereignty Principle:
**User files are NEVER protected.** User always has control of their own device.

### Current Integration Status:
- ✅ Guardian class exists in `src/guardian/index.ts`
- ✅ Imported in cli.ts (Round 1 fix)
- ❌ NOT integrated in coordinator.ts (Round 2 issue)

---

## SECTION 8: SHARK AGENT SYSTEM (From shark-agent repo)

### The Protocol:
**DeepSeek R1 does ALL reasoning. Local model ONLY routes and executes.**

### Auto-Routing:
| Model | Use Case | Triggers |
|-------|----------|----------|
| DeepSeek Chat | Simple questions | <100 chars, single sentence |
| DeepSeek R1 | Complex reasoning | Coding, debugging, file ops, analysis |

### Zero Tolerance Rule:
**Local model makes EXACTLY ONE decision: Route to Chat or R1**
- NO model recommendations
- NO quantization decisions
- NO fallback decisions
- NO autonomous reasoning of ANY kind

---

## SECTION 9: TESTING PROTOCOL

### 3-Stage Build Workflow:

| Stage | Description | Who Runs |
|-------|-------------|----------|
| Stage 1 | Docker Sandbox | CI/CD |
| Stage 2 | Native Container | CI/CD |
| Stage 3 | User Endpoint | USER (local device) |
| Stage 4 | Crash Testing | FUTURE (adversarial) |

### Current Status:
- Stage 1: ⚠️ SKIPPED (Docker unavailable in build container)
- Stage 2: ✅ PASSED (7/7 integration tests)
- Stage 3: ⏳ PENDING (requires user's local device)
- Stage 4: 📋 PLANNED (see `docs/CRASH-TESTING-CONTEXT.md`)

### Integration Test Location:
`/home/z/shark-frankenstein/testing/integration-test.ts`

Run with: `npx tsx testing/integration-test.ts`

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
/home/z/shark-frankenstein/
├── .env                          # ALL API KEYS - READ FROM HERE
├── src/
│   ├── cli.ts                    # Main entry - Guardian/Workflow/AutoDebug integrated
│   ├── brain/
│   │   ├── coordinator.ts        # ⚠️ Lacks Guardian integration
│   │   ├── glm.ts                # ⚠️ Tools defined but not executed
│   │   ├── gemma.ts              # ✅ Has Railway proxy support
│   │   ├── deepseek.ts           # Planning brain
│   │   └── types.ts              # Type definitions
│   ├── guardian/
│   │   └── index.ts              # ✅ Integrated in cli.ts
│   ├── workflow/
│   │   ├── state-machine.ts      # ✅ Integrated in cli.ts
│   │   ├── types.ts              # WorkflowStep enum
│   │   └── index.ts              # Facade
│   ├── debug/
│   │   └── autodebug.ts          # ✅ Integrated in cli.ts
│   └── testing/
│       └── integration-test.ts   # 7 tests
├── docs/
│   ├── failure-logs/
│   │   └── MONOLITHIC-FAILURE-LOG-001.md  # Round 1 theatrical code failures
│   ├── VANILLA-VS-SHARK-DIVERGENCE.md      # ⚠️ CRITICAL: Validates thesis (83% divergence)
│   ├── DESIGN-PHILOSOPHY.md                # The Earth/River concept
│   ├── CRASH-TESTING-CONTEXT.md            # Stage 4 plan
│   └── STAGE-3-USER-ENDPOINT-PROMPT.md
├── testing/
│   ├── TESTING_PROTOCOL.md       # 3-stage workflow
│   └── integration-test.ts
├── skills/                       # Python skills (57% of codebase - investigate)
└── README.md
```

---

## SECTION 13: PENDING TASKS

### Immediate (Do These First):
0. **READ ALL FAILURE DOCS** - Understand the patterns before touching code
1. **Document Round 2 failures** in `/home/z/shark-frankenstein/docs/failure-logs/`
2. **Investigate Python discrepancy** - Why 57% Python in TypeScript codebase?
3. **Create ToolExecutor** - GLM tool calls need execution loop
4. **Add Guardian to coordinator.ts** - File operations need protection
5. Run `npm run build` to verify
6. Run integration tests

### After That:
7. Ask user for approval to push to GitHub
8. Create Stage 3 prompt for user's local device

### DO NOT:
- ❌ Just document without implementing
- ❌ Claim features exist without checking imports
- ❌ Stay silent for long periods
- ❌ Push to git without user approval
- ❌ Include raw API keys in any output

---

## SECTION 14: COMMUNICATION PROTOCOL

**MANDATORY: Report after EVERY action, not in batches.**

### Pattern:
```
[Action N] Description... ✓ (result)
```

### Example:
```
[1/6] Reading .env... ✓ (found 6 keys)
[2/6] Reading glm.ts... ✓ (tools defined, no loop found)
[3/6] Creating ToolExecutor.ts... ✓ (47 lines)
[4/6] Integrating into glm.ts... ✓ (added executeWithTools method)
[5/6] Running npm run build... ✓ (no errors)
[6/6] Running integration tests... ✓ (7/7 passed)
```

---

## SECTION 15: KEY FILES TO READ FIRST

1. `/home/z/shark-frankenstein/.env` - API keys
2. `/home/z/shark-frankenstein/docs/VANILLA-VS-SHARK-DIVERGENCE.md` - ⚠️ CRITICAL: Validates thesis
3. `/home/z/shark-frankenstein/docs/failure-logs/MONOLITHIC-FAILURE-LOG-001.md` - Round 1 failures
4. `/home/z/shark-frankenstein/docs/DESIGN-PHILOSOPHY.md` - The thesis
5. `/home/z/shark-frankenstein/src/brain/glm.ts` - Tool execution issue
6. `/home/z/shark-frankenstein/src/brain/coordinator.ts` - Missing Guardian
7. `/home/z/my-project/audit-guardian/docs/FAILURE_ANALYSIS.md` - Guardian Angel fake monitoring

---

## SECTION 16: YOUR FIRST ACTIONS

**DO NOT SKIP THESE. REPORT EACH ONE.**

```bash
# 1. Navigate to repo
cd /home/z/shark-frankenstein

# 2. Verify API keys exist (DO NOT DISPLAY RAW VALUES)
cat .env | grep -c "="  # Should show ~7 keys

# 3. Check build state
npm run build

# 4. Run integration tests
npx tsx testing/integration-test.ts

# 5. Read CRITICAL failure docs
cat docs/VANILLA-VS-SHARK-DIVERGENCE.md  # Why mechanical enforcement is essential
cat docs/failure-logs/MONOLITHIC-FAILURE-LOG-001.md  # Round 1 theatrical code
cat /home/z/my-project/audit-guardian/docs/FAILURE_ANALYSIS.md  # Guardian Angel fake monitoring
```

**REPORT THE RESULT OF EACH COMMAND BEFORE CONTINUING.**

---

## SECTION 17: SUCCESS CRITERIA

You will be considered successful when:

1. ✅ ALL failure documentation read and understood
2. ✅ Round 2 failures documented in `docs/failure-logs/`
3. ✅ Python discrepancy investigated and explained
4. ✅ ToolExecutor created and integrated into GLM client
5. ✅ Guardian integrated into coordinator.ts
6. ✅ `npm run build` succeeds
7. ✅ Integration tests pass (7/7)
8. ✅ User asked for approval before any git push
9. ✅ Stage 3 prompt created for user's local device

---

## SECTION 18: THE EXACT CODE TO CHECK

### glm.ts (Tool calls extracted but NOT executed):
```typescript
// Line 140-163
const toolCalls = choice.message.tool_calls?.map(tc => ({
  id: tc.id,
  name: tc.function.name,
  arguments: JSON.parse(tc.function.arguments),
})) as ToolCall[] | undefined;

return {
  content,
  toolCalls,  // ❌ RETURNED but NEVER PROCESSED
};
```

### coordinator.ts (No Guardian check):
```typescript
// Line 288-289
const result = await this.executionBrain.execute(currentTask, options);
// ❌ If GLM wants to write a file, NO Guardian protection
```

---

## END OF HANDOFF DOCUMENT

**COPY EVERYTHING ABOVE THIS LINE INTO A NEW CHAT**

The new chat should have 100% context of:
- All 3 repos (shark-frankenstein, shark-agent, guardian-firewall)
- Why we're "frankensteining" Qwen Code
- What user dislikes about Qwen Code (explaining instead of doing)
- What theatrical code is
- What Round 1 fixed (Guardian/Workflow/AutoDebug integration)
- What Round 2 found (GLM tools not executed, Python bloat)
- **ALL failure documentation (MONOLITHIC-FAILURE-LOG-001, VANILLA-VS-SHARK-DIVERGENCE, FAILURE_ANALYSIS)**
- Why mechanical enforcement is essential (83% divergence proven)
- What NOT to do (with examples)
- What TO do (with examples)
- Where all files are
- Where API keys are (NOT raw values)
- What the communication protocol is
- What the pending tasks are
- NEVER push to git without user approval
