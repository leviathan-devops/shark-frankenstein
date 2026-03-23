# 🦈 SHARK FRANKENSTEIN - MASTER CONTEXT FILE

**Purpose:** Complete context for continuing this work in a fresh session  
**Created:** 2026-03-23  
**Status:** AUDIT COMPLETE, FIXES CREATED, REPO UPDATE PENDING

---

## 🚨 CRITICAL SUMMARY

A forensic audit of 3 git repositories revealed **MONOLITHIC SYSTEM FAILURE**:

| Repository | Critical Failures | Status |
|------------|-------------------|--------|
| guardian-firewall | 7 CRITICAL + 5 HIGH | Audit complete |
| shark-agent | THEATRICAL SOFTWARE | Audit complete |
| shark-frankenstein | 2,192 lines theatrical code | Audit complete |

**The Pattern:** Code claims features that don't work. Guardian, Workflow, and AutoDebug exist but are NEVER integrated into the CLI.

---

## 📁 FILES CREATED (in /home/z/my-project/download/)

1. **FORENSIC-ANALYSIS-REPORT.md** - Complete failure analysis
2. **FIXED-cli.ts** - Fixed CLI with Guardian, Workflow, AutoDebug integrated
3. **SHARK-MASTER-PROMPT.md** - Prompt for vanilla agents

---

## 🔧 REQUIRED FIXES STILL PENDING

### 1. shark-agent - Remove Hardcoded API Key
**File:** skills/shark/run.py line 27
**Key exposed:** `sk-e8e93e31b582423e9fdaa4ab8e9347e2`
**Fix:** Replace with `os.environ.get("DEEPSEEK_API_KEY")`

### 2. guardian-firewall - Fix Hardcoded Path
**File:** src/bin/guardian-encrypt.sh
**Issue:** `/home/leviathan/guardian-scan-keys.sh` hardcoded
**Fix:** Use `$(dirname "$0")/../scripts/guardian-scan-keys.sh`

### 3. guardian-firewall - Session Token
**Issue:** Documented in 6+ files, ZERO implementation
**Fix:** Either implement or remove from documentation

### 4. shark-frankenstein - Apply FIXED-cli.ts
**Action:** Replace src/cli.ts with /home/z/my-project/download/FIXED-cli.ts

---

## 📋 KEY AUDIT FINDINGS

### Theatrical Code (shark-frankenstein)

```
Module                        Lines    Status
─────────────────────────────────────────────────
src/guardian/index.ts         ~800     Never called
src/workflow/state-machine.ts ~862     Never called
src/debug/autodebug.ts        ~530     Never called
─────────────────────────────────────────────────
TOTAL                         ~2,192   Could be deleted
```

### Integration Gaps (cli.ts)

```typescript
// Current imports:
import { DualBrainCoordinator } from './brain/coordinator';

// MISSING IMPORTS:
// import { Guardian } from './guardian';      // ❌ NOT IMPORTED
// import { Workflow } from './workflow';      // ❌ NOT IMPORTED
// import { AutoDebug } from './debug';        // ❌ NOT IMPORTED
```

### What Actually Works
- ✅ Dual-Brain Architecture (DeepSeek→Gemma for Micro, GLM+DeepSeek for Macro)
- ✅ API Clients (DeepSeek, Gemma, GLM)
- ✅ Interactive Wizard
- ✅ REPL Loop

### What's Theatrical
- ❌ Guardian protection (only test runner uses it)
- ❌ 5-Step Workflow (exists but CLI ignores it)
- ❌ Auto-Debug (never called)
- ❌ Git push blocking (hooks never installed)

---

## 🌐 REPOSITORIES

```bash
# Cloned for audit:
/home/z/my-project/audit-guardian/         # guardian-firewall
/home/z/my-project/audit-shark-agent/      # shark-agent
/home/z/my-project/audit-shark-frankenstein/ # shark-frankenstein

# GitHub:
https://github.com/leviathan-devops/guardian-firewall
https://github.com/leviathan-devops/shark-agent
https://github.com/leviathan-devops/shark-frankenstein
```

---

## 🔑 API KEYS (from previous session)

```
DEEPSEEK_API_KEY: sk-e8e93e31b582423e9fdaa4ab8e9347e2
GLM_API_KEY: 71cda1864f0f4e15b076b0f24d56753e.4SwmFVzcRiWmT3r1
GOOGLE_API_KEY: AIzaSyAZLu8LStbmyShaON6XzjP_BO2i6AT54l0
Railway Proxy: https://shark-gemini-proxy-production.up.railway.app
```

**⚠️ SECURITY ISSUE:** DeepSeek key is hardcoded in shark-agent repo!

---

## 📖 DESIGN PHILOSOPHY

The solution is **Earth and River**:

```
MECHANICAL ENFORCEMENT (Earth)
─────────────────────────────
• Hardcoded rules, no negotiation
• The "Brick Wall" - cannot bypass
• Workflow state machine
• Guardian protection zones

              ↓ directs

AI AUTONOMY (River)
───────────────────
• Creative freedom within constraints
• Fast iteration and exploration
• Dynamic problem solving
• BUT cannot escape the channel

              =

PRODUCTIVE WORK
───────────────
• Real execution, not simulation
• Verified outputs
• Reliable behavior
```

---

## ✅ NEXT STEPS FOR FRESH SESSION

1. Read this file first: `/home/z/my-project/download/MASTER-CONTEXT.md`
2. Read forensic report: `/home/z/my-project/download/FORENSIC-ANALYSIS-REPORT.md`
3. Read the FIXED cli.ts: `/home/z/my-project/download/FIXED-cli.ts`
4. Read master prompt: `/home/z/my-project/download/SHARK-MASTER-PROMPT.md`
5. Apply fixes to repos:
   - Copy FIXED-cli.ts to shark-frankenstein/src/cli.ts
   - Remove hardcoded API key from shark-agent
   - Fix hardcoded path in guardian-firewall
   - Either implement session tokens or remove documentation
6. Run full 2-stage testing
7. Update git repos with verified fixes

---

## 📊 FAILURE PATTERNS TO AVOID

| Pattern | Description | Example |
|---------|-------------|---------|
| Docstring-Driven Development | Docstrings claim features that don't exist | "Real-time monitoring" in comment, no implementation |
| Theatrical Code | Code exists but never called | Guardian module 800 lines, never imported |
| Missing Architecture | Claims require components that don't exist | Session token documented, no code |
| No Verification Layer | Claims have no tests | Zero test files despite test infrastructure |
| Semantic Drift | Terms used loosely | "Monitor" as noun vs verb |

---

## 🚀 THE SHARK SOLUTION

1. **Integrate Guardian** - Every file operation goes through Guardian
2. **Integrate Workflow** - 5-step enforcement (PLAN→BUILD→TEST→VERIFY→SHIP)
3. **Integrate Auto-Debug** - Error pattern matching on all failures
4. **Create Tests** - Unit, integration, E2E tests
5. **Verify Integration** - Tests prove code is actually used

---

*This file contains all context needed to continue the work. Read it first in a fresh session.*
