# SHARK FRANKENSTEIN - MASTER HANDOFF v2

**COPY EVERYTHING BELOW THIS LINE INTO A NEW CHAT**

---

## SECTION 0: CRITICAL CONTEXT

**This `shared-workspace/` folder contains ALL context needed:**
- `MASTER-HANDOFF-V2.md` - This file (start here)
- `AUDIT-WORKLOG.md` - Full forensic audit report
- `FINAL-WORKLOG-SUMMARY.md` - Summary of fixes created
- `VANILLA-VS-SHARK-DIVERGENCE.md` - Why vanilla agents fail
- `FAILURE_ANALYSIS.md` - From guardian-firewall repo
- `DESIGN-PHILOSOPHY.md` - Architecture principles

---

## SECTION 1: WHAT IS SHARK FRANKENSTEIN

A TypeScript CLI that combines multiple AI brains for autonomous coding:

| Mode | Architecture | Use Case |
|------|-------------|----------|
| **Micro** | DeepSeek R1 (plans) → Gemma 3 4B (executes) | Single-file fixes, syntax, tests |
| **Macro** | GLM 4.7 (autonomous) | Multi-file, architecture, DevOps |

**Key Components:**
- **Guardian** - File protection system (blocks system file mods)
- **WorkflowMachine** - 5-step enforcement (PLAN → BUILD → TEST → VERIFY → SHIP)
- **AutoDebugEngine** - 60% error auto-fix
- **ToolExecutor** - Safe tool execution with Guardian checks

**GitHub:** https://github.com/leviathan-devops/shark-frankenstein

---

## SECTION 2: API KEYS (ASK USER)

The following keys are needed. **Ask the user to provide them:**

```
GITHUB_PAT=<ask user>
RAILWAY_PROXY_URL=https://shark-gemini-proxy-production.up.railway.app
GOOGLE_API_KEY=<ask user>
GEMMA_USE_PROXY=true
DEEPSEEK_API_KEY=<ask user>
GLM_API_KEY=<ask user> (Coding Plan subscription)
```

---

## SECTION 3: WHAT'S DONE

| Item | Status | Notes |
|------|--------|-------|
| Guardian integration | ✅ FIXED | Imported in cli.ts, coordinator.ts |
| Workflow integration | ✅ FIXED | 5-step enforcement active |
| AutoDebug integration | ✅ FIXED | Error pattern matching ready |
| Build | ✅ PASS | Clean compile |
| Integration tests | ✅ 7/7 | All pass |
| Gemma API | ✅ WORKS | Via Railway proxy |
| DeepSeek API | ✅ WORKS | Direct |
| 6.1MB theatrical code | ✅ DELETED | skills/, src/wizard/, src/testing/ |
| GLM endpoint | ✅ FIXED | Uses coding plan endpoint |

---

## SECTION 4: THE GLM CONFIGURATION

**User has GLM Coding Plan subscription.**

```typescript
// src/brain/glm.ts
const GLM_API_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions';
const GLM_MODEL = 'glm-4.7';
```

**DO NOT suggest glm-4.5-flash. User wants glm-4.7.**

---

## SECTION 5: REMAINING ISSUES

1. **GLM model testing** - Verify glm-4.7 works on coding plan endpoint
2. **2 unused exports** - `canPush`, `createWorkflow` in coordinator.ts (minor)
3. **Stage 3 user testing** - Run on user's local device
4. **Dead code scan** - Verify no more theatrical patterns

---

## SECTION 6: FIRST ACTIONS

1. Clone the repo: `git clone https://github.com/leviathan-devops/shark-frankenstein.git`
2. Read files in `shared-workspace/`
3. Ask user for API keys
4. Create `.env` file
5. Run `npm install && npx tsc`
6. Run integration tests
7. Test all 3 APIs

---

## SECTION 7: COMMUNICATION PROTOCOL

**Report after EVERY action:**
```
[1/5] Description... ✓ (result)
```

**NEVER push to git without user approval.**

---

## END OF HANDOFF

**All context is in `shared-workspace/` folder - READ IT FIRST.**
