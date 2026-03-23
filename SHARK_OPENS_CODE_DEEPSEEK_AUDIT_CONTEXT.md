# 🦈 SHARK FRANKENSTEIN DEEPSEEK AUDIT CONTEXT

**This document contains the essential context for DeepSeek to audit and continue the Shark Frankenstein → Opencode integration work.**

**FILE STRUCTURE:**
1. FULL_CONTEXT_HANDOVER_PROMPT.md (complete)
2. SHARK_OPENCODE_INTEGRATION_BLUEPRINT-MIMO.md (complete)  
3. USER'S DESIGN PHILOSOPHY (verbatim from Shark Frankenstein docs)
4. USER'S VISION EXPLANATIONS (verbatim from chat)
5. KEY DECISIONS + TECHNICAL REFERENCE
6. ACTIONABLE NEXT STEPS

---

## 1. FULL_CONTEXT_HANDOVER_PROMPT.md (COMPLETE)

# 🦈 SHARK FRANKENSTEIN - FULL CONTEXT HANDOVER PROMPT

**COPY EVERYTHING BELOW THIS LINE INTO A NEW CHAT**

---

## SECTION 0: WHAT IS SHARK FRANKENSTEIN

A TypeScript CLI that combines multiple AI brains for autonomous coding:

| Mode | Architecture | Use Case |
|------|-------------|----------|
| **Micro** | DeepSeek R1 (plans) → Gemma 3 4B (executes) | Single-file fixes, syntax, tests |
| **Macro** | GLM 4.7 (autonomous) | Multi-file architecture, DevOps, CI/CD |

**Built on Qwen Code foundation** - surgically modified ("frankensteined") to add:
- **Guardian** - File protection system (blocks system file mods)
- **WorkflowMachine** - 5-step enforcement (PLAN → BUILD → TEST → VERIFY → SHIP)
- **AutoDebugEngine** - 60% error auto-fix via pattern matching
- **ToolExecutor** - Safe tool execution with Guardian checks

**GitHub:** https://github.com/leviathan-devops/shark-frankenstein

---

## SECTION 1: REPOSITORY ECOSYSTEM

| Repo | URL | Purpose |
|------|-----|---------|
| shark-frankenstein | https://github.com/leviathan-devops/shark-frankenstein | Main TypeScript CLI |
| guardian-firewall | https://github.com/leviathan-devops/guardian-firewall | Multi-layer file protection |
| shark-agent | (internal) | Python implementation reference |

---

## SECTION 2: API KEYS

```
GITHUB_PAT=your_github_pat_here
RAILWAY_API_KEY=8190a045-3fbd-4c68-8c0f-772d7f10901f
RAILWAY_PROXY_URL=https://shark-gemini-proxy-production.up.railway.app
GOOGLE_API_KEY=AIzaSyAZLu8LStbmyShaON6Xzjp_BO2i6AT54l0
GEMMA_USE_PROXY=true
DEEPSEEK_API_KEY=sk-e8e93e31b582423e9fdaa4ab8e9347e2
GLM_API_KEY=71cda1864f0f4e15b076b0f24d56753e.4SwmFVzcRiWmT3r1
```

---

## SECTION 3: WHAT'S DONE (VERIFIED)

| Item | Status | Notes |
|------|--------|-------|
| Guardian integration | ✅ FIXED | Imported in cli.ts, coordinator.ts |
| Workflow integration | ✅ FIXED | 5-step enforcement active |
| AutoDebug integration | ✅ FIXED | Error pattern matching ready |
| ToolExecutor | ✅ CREATED | 320 lines, executes tool calls |
| Build | ✅ PASS | Clean compile |
| Integration tests | ✅ 7/7 | All pass |
| Gemma API | ✅ WORKS | Via Railway proxy |
| DeepSeek API | ✅ WORKS | Direct |
| Hallucination check | ✅ PASS | All functionality verified REAL |
| 6.1MB theatrical code | ✅ DELETED | skills/, src/wizard/, src/testing/ removed |
| GLM endpoint | ✅ FIXED | Uses coding plan endpoint |

---

## SECTION 4: THE GLM CONFIGURATION

**User has GLM Coding Plan subscription.** The current GLM client in the repo uses:

```typescript
// src/brain/glm.ts
const GLM_API_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions';
const GLM_MODEL = 'glm-4.7';
```

**This is correct.** If GLM fails, test the endpoint directly:
```bash
curl -s "https://api.z.ai/api/coding/paas/v4/chat/completions" \
  -H "Authorization: Bearer 71cda1864f0f4e15b076b0f24d56753e.4SwmFVzcRiWmT3r1" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.7","messages":[{"role":"user","content":"hi"}]}'
```

---

## SECTION 5: FAILURE DOCUMENTATION (READ THESE)

All failure logs are in the repo:
- https://github.com/leviathan-devops/shark-frankenstein/blob/main/docs/failure-logs/MONOLITHIC-FAILURE-LOG-001.md
- https://github.com/leviathan-devops/shark-frankenstein/blob/main/docs/failure-logs/MONOLITHIC-FAILURE-LOG-002.md
- https://github.com/leviathan-devops/shark-frankenstein/blob/main/docs/failure-logs/MONOLITHIC-FAILURE-LOG-003.md

**Key validation document:**
- https://github.com/leviathan-devops/shark-frankenstein/blob/main/docs/VANILLA-VS-SHARK-DIVERGENCE.md

**From guardian-firewall repo:**
- https://github.com/leviathan-devops/guardian-firewall/blob/main/docs/FAILURE_ANALYSIS.md

---

## SECTION 6: REMAINING WORK (STEP-BY-STEP)

### IMMEDIATE ACTIONS (PRIORITY):

1. **Clone both repos** (if not already done):
   ```bash
   git clone https://github.com/leviathan-devops/shark-frankenstein.git
   git clone https://github.com/leviathan-devops/guardian-firewall.git
   ```

2. **Copy critical failure docs** into shark-frankenstein failure-logs:
   ```bash
   cd shark-frankenstein
   cp docs/VANILLA-VS-SHARK-DIVERGENCE.md docs/failure-logs/
   # Note: FAILURE_ANALYSIS.md already copied in shared workspace
   ```

3. **Create .env** in shark-frankenstein with keys from Section 2:
   ```bash
   cat > .env << 'EOF'
   GITHUB_PAT=your_github_pat_here
   RAILWAY_API_KEY=8190a045-3fbd-4c68-8c0f-772d7f10901f
   RAILWAY_PROXY_URL=https://shark-gemini-proxy-production.up.railway.app
   GOOGLE_API_KEY=AIzaSyAZLu8LStbmyShaON6Xzjp_BO2i6AT54l0
   GEMMA_USE_PROXY=true
   DEEPSEEK_API_KEY=sk-e8e93e31b582423e9fdaa4ab8e9347e2
   GLM_API_KEY=71cda1864f0f4e15b076b0f24d56753e.4SwmFVzcRiWmT3r1
   EOF
   ```

4. **Install and build**:
   ```bash
   npm install
   npx tsc
   ```

5. **Run integration tests**:
   ```bash
   npx tsx testing/integration-test.ts
   ```

6. **Test all 3 AI APIs**:
   ```bash
   source .env
   node -e "const {GemmaClient}=require('./dist/brain/gemma');new GemmaClient({apiKey:'$GOOGLE_API_KEY',useProxy:true,proxyUrl:'$RAILWAY_PROXY_URL'}).execute('hi').then(r=>console.log('Gemma:',r.content.substring(0,30)))"
   node -e "const {GLMClient}=require('./dist/brain/glm');new GLMClient({apiKey:'$GLM_API_KEY'}).execute('hi').then(r=>console.log('GLM:',r.content.substring(0,30))).catch(e=>console.log('GLM error:',e.message))"
   node -e "const {DeepSeekClient}=require('./dist/brain/deepseek');new DeepSeekClient({apiKey:'$DEEPSEEK_API_KEY'}).plan('hi').then(r=>console.log('DeepSeek:',r.substring(0,30)))"
   ```

### VERIFICATION TASKS:

7. **Verify GLM-4.7 works on coding plan endpoint** (SPECIFIC USER REQUEST):
   - Test with actual coding tasks, not just "hi"
   - Confirm it uses the coding plan endpoint (`/api/coding/paas/v4/`), not standard chat
   - Verify tool use works correctly with this endpoint

8. **Dead code scan** - Verify no more theatrical patterns:
   ```bash
   # Find exports never imported
   for func in $(grep -rh "export function\|export class" src/ --include="*.ts" | awk '{print $3}' | cut -d'(' -f1); do
     count=$(grep -r "$func" src/ --include="*.ts" | grep -v "export" | wc -l)
     if [ "$count" -eq 0 ]; then echo "DEAD: $func"; fi
   done
   # Should return no results
   ```

9. **Prepare for Stage 3 user testing**:
   - Review: https://github.com/leviathan-devops/shark-frankenstein/blob/main/docs/STAGE-3-USER-ENDPOINT-PROMPT.md
   - This will be run on user's local device after Stage 2 passes

---

## SECTION 7: SHARED-WORKSPACE CONTENT

The `shared-workspace/` folder in the GitHub repo contains all necessary context files:
- https://github.com/leviathan-devops/shark-frankenstein/tree/main/GLM%20Engineer%20Shared%20Workspace

**Files include:**
- Complete chat history converted to markdown
- All failure logs and design docs
- Repository snapshots at time of handover
- Build artifacts and logs
- This handover prompt itself

**To upload your workspace when hitting context limits:**
```bash
# 1. Collect your current workspace files
mkdir -p ./shared-workspace
cp -r ./src ./shared-workspace/
cp -r ./testing ./shared-workspace/
cp -r ./docs ./shared-workspace/
cp ./package*.json ./shared-workspace/
cp ./.env ./shared-workspace/  # If exists
cp ./tsconfig.json ./shared-workspace/

# 2. Add a worklog entry
echo "## $(date) - Workspace Savepoint\n\n[DESCRIBE WHAT YOU ACCOMPLISHED AND CURRENT STATE]\n\n---\n" >> ./shared-workspace/AUDIT-WORKLOG.md

# 3. Commit and push (AFTER GETTING USER APPROVAL)
git add shared-workspace/
git commit -m "chore: update shared workspace context [SKIP CI]"
# DO NOT PUSH WITHOUT USER APPROVAL
```

---

## SECTION 8: COMMUNICATION PROTOCOL (MANDATORY)

**Report after EVERY action:**
```
[1/5] Description... ✓ (result)
[2/5] Description... ✓ (result)
...
```

**Examples:**
```
[1/5] Installing npm dependencies... ✓ (added 124 packages)
[2/5] Compiling TypeScript... ✓ (clean build)
[3/5] Running integration tests... ✓ (7/7 passed)
[4/5] Testing Gemma API... ✓ (response: "Hello! How can I help?")
[5/5] Testing GLM API... ✓ (response: "Hello! I'm GLM-4.7 ready to assist.")
```

**NEVER** push to git without user approval.

---

## SECTION 9: SUCCESS CRITERIA

You are done with Stage 2 when:
1. ✅ Clone successful
2. ✅ .env configured
3. ✅ Build passes (`npm run build` and `tsc` with no errors)
4. ✅ Integration tests 7/7 pass (`npx tsx testing/integration-test.ts`)
5. ✅ All 3 APIs respond (Gemma, GLM, DeepSeek) with actual coding capabilities
6. ✅ No more theatrical code found (dead code scan returns empty)
7. ✅ User asked for approval before any git push

**Overall Status: READY FOR STAGE 3 USER VALIDATION**

---

## SECTION 10: WHAT NOT TO DO (USER PREFERENCES)

> *"Claude Code does this SO much I cannot even use it. It is programmed to tell you how to do things, not actually do them."*

**What NOT to do:**
- ❌ Describe, explain, document WITHOUT implementing
- ❌ Stay silent for 10 minutes then claim "done"
- ❌ Suggest older/slower models when user wants latest (use glm-4.7, not 4.5-flash)
- ❌ Create mock tests instead of running real tests
- ❌ Use standard GLM endpoint (user has Coding Plan subscription)
- ❌ Push to git without explicit user approval

**What TO do:**
- ✅ Actually write code, run commands, modify files
- ✅ Report incrementally (every action) using the format above
- ✅ Test real functionality, not just imports or syntax
- ✅ Verify glm-4.7 works specifically on the coding plan endpoint
- ✅ Ask for approval before any git operations
- ✅ Focus on implementation, not explanation

---

## SECTION 11: CONTEXT UPLOAD PROMPT (FOR FUTURE AGENTS)

When your context gets bloated, run this to save your workspace:

```bash
# CREATE SHARED WORKSPACE SNAPSHOT
echo "Creating workspace snapshot at $(date)" >> ./shared-workspace/AUDIT-WORKLOG.md

# COLLECT ESSENTIAL FILES
mkdir -p ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)
cp -r ./src ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)/
cp -r ./testing ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)/
cp -r ./docs ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)/
cp ./package*.json ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true
cp ./.env ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true
cp ./tsconfig.json ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true

# UPDATE WORKLOG
echo "## $(date) - Context Reset Savepoint\n\nAgent completed: [DESCRIBE LAST TASK]\nNext agent should: [DESCRIBE NEXT STEPS]\n\nCurrent workspace saved to: snapshot-$(date +%Y%m%d-%H%M%S)\n\n---\n" >> ./shared-workspace/AUDIT-WORKLOG.md

# SHOW USER WHAT TO PROVIDE TO NEXT AGENT
echo ""
echo "=== CONTEXT HANDOVER INSTRUCTIONS ==="
echo "1. Give the next agent this entire shared-workspace/AUDIT-WORKLOG.md file"
echo "2. Provide them with the full GitHub repo URL:"
echo "   https://github.com/leviathan-devops/shark-frankenstein"
echo "3. Tell them to read: https://github.com/leviathan-devops/shark-frankenstein/blob/main/FULL_CONTEXT_HANDOVER_PROMPT.md"
echo "4. Remind them: NEVER push without user approval, report after EVERY action"
echo ""
```

---

## END OF HANDOFF

**The codebase is 95% clean and ready for Stage 3 validation. Remaining work is focused on final verification and user-stage testing.**

**DO NOT:**
- Suggest glm-4.5-flash (user wants 4.7)
- Use standard endpoint (user has Coding Plan)
- Document without implementing
- Push without approval

**The next agent should be able to pick up seamlessly by:**
1. Reading this entire document
2. Examining the shared-workspace/ folder
3. Following the verification tasks in Section 6
4. Reporting after every action using the prescribed format
5. Getting user approval before any git operations
6. Preparing for Stage 3 user endpoint validation

Let's finish strong! 🦈