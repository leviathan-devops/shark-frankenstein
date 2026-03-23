# 🦈 SHARK AGENT + OPENS CODE INTEGRATION BLUEPRINT

**Replacing Qwen Code Foundation with Opencode while preserving Shark Agent's mechanical enforcement systems**

## 🎯 OVERARCHING GOAL

Create a Shark Agent CLI where:
- **Opencode provides the UI/UX foundation** (which the user prefers)
- **Shark Agent systems provide mechanical enforcement** (Guardian, Workflow, Dual-Brain, AutoDebug)
- **The CLI itself becomes the "Earth Density"** - mechanical enforcement layer that agents cannot bypass
- **Zero tolerance for theatrical behavior** - agents must work within mechanical constraints or be blocked

## 🔧 CORE INTEGRATION STRATEGY

### Approach: Fork and Modify Opencode (Approach A)
1. Fork the Opencode repository: `https://github.com/anomalyco/opencode`
2. Replace/Qwen Code's core agent logic with Shark's DualBrainCoordinator
3. Integrate Shark systems as mechanical enforcement layers at key interception points
4. Preserve Opencode's UI while replacing underlying logic
5. Maintain Opencode's upgradability through careful integration points

## 🎯 TARGET INTEGRATION POINTS

### 1. MODE SWITCHING SYSTEM (PRIMARY TARGET)
**Location**: Opencode's plan/build mode toggle mechanism
**Files to examine**: 
- `/packages/opencode/src/agent/agent.ts` (plan/build agent definitions)
- `/packages/opencode/src/config/config.ts` (mode configuration)
- `/packages/opencode/src/session/processor.ts` (mode-based execution flow)

**Shark Integration**:
- Replace manual toggle with **automatic dual-brain switching**
- **Micro Engineer Mode** = Automatic Plan Mode (DeepSeek plans) → Build Mode (Gemma executes)
- **Macro Engineer Mode** = GLM handles planning+building internally, DeepSeek as advisory background service
- Leverage Opencode's existing "cannot build in plan mode" enforcement as foundation

### 2. COMMAND EXECUTION PIPELINE (CORE ENFORCEMENT)
**Location**: Where Opencode processes/executes agent-generated commands
**Files to examine**:
- `/packages/opencode/src/session/processor.ts` (tool execution flow)
- `/packages/opencode/src/tool/registry.ts` (tool registration/execution)
- `/packages/opencode/src/tool/batch.ts` (tool execution wrapper)
- `/packages/opencode/src/tool/tool.ts` (tool interface definition)

**Shark Integration**:
- **Guardian Angel**: Wrap ALL file operations (read/write/delete) with permission checks
- **WorkflowMachine**: Inject 5-step validation (PLAN→BUILD→TEST→VERIFY→SHIP) at command boundaries
- **ToolExecutor**: Replace native tool execution with Shark's Guardian-protected version
- **AutoDebugEngine**: Integrate into error handling - provide mechanical fixes before allowing retry

### 3. ERROR HANDLING & FEEDBACK LOOP (ANTI-HALLUCINATION)
**Location**: How Opencode handles/reports errors from agent commands
**Files to examine**:
- `/packages/opencode/src/session/processor.ts` (error handling in tool-result/tool-error)
- `/packages/opencode/src/tool/tool.ts` (tool execution error handling)
- `/packages/opencode/src/session/status.ts` (session status management)

**Shark Integration**:
- Replace error display with **mechanical violation detection**
- When agent attempts to bypass workflow (e.g., faking test results):
  * CLI detects violation via workflow state
  * Outputs: `VIOLATION DETECTED: [specific workflow step skipped]`
  * Provides: `AUTO-DEBUG SOLUTION: [mechanical fix from knowledge base]`
  * Forces: `NEXT STEPS: [clear mechanical instructions to complete correct step]`
- Prevents theatrical simulation by requiring actual workflow completion evidence

### 4. COMPLETION/SHIP VALIDATION (FINAL GATEKEEPER)
**Location**: How Opencode determines when a task is "complete"
**Files to examine**:
- `/packages/opencode/src/session/processor.ts` (finish-step handling)
- `/packages/opencode/src/session/status.ts` (session completion)
- `/packages/opencode/src/session/compaction.ts` (context completion detection)

**Shark Integration**:
- Implement **mechanical compile-from-scratch validation** at ship stage
- Before allowing user output:
  1. CLI checks workflow state = SHIP stage
  2. CLI mechanically compiles entire codebase from scratch (no agent context)
  3. Verifies build workflow completion through artifact analysis (0 AI inference)
  4. If validation fails: Forces restart from PLAN stage with added context
- This is the "satisfaction firewall" - ensures agents can't hallucinate completion

## 📁 FILE STRUCTURE FOR INTEGRATION

After forking Opencode, add Shark systems to:

```
/packages/shark-agent/
├── src/
│   ├── brain/                 # Dual-brain coordinator & model clients
│   │   ├── coordinator.ts     # DualBrainCoordinator (from Shark Frankenstein)
│   │   ├── glm.ts             # GLM client (coding plan endpoint)
│   │   ├── deepseek.ts        # DeepSeek client
│   │   ├── gemma.ts           # Gemma client (via proxy)
│   │   └── types.ts           # Shared types
│   ├── guardian/              # File protection system
│   │   └── index.ts           # Guardian class
│   ├── workflow/              # 5-step workflow enforcer
│   │   ├── state-machine.ts   # WorkflowMachine
│   │   └── types.ts           # WorkflowStep, etc.
│   ├── debug/                 # Auto-debug engine
│   │   └── autodebug.ts       # AutoDebugEngine
│   └── tools/                 # Safe tool execution
│       └── executor.ts        # ToolExecutor
```

## ⚙️ CONFIGURATION SYSTEM INTEGRATION

Extend Opencode's config to include Shark's mechanical enforcement:

```json
// In opencode.json or .opencode/opencode.json
{
  "sharkEnforcement": {
    "dualBrainMode": "micro|macro",
    "workflowStrictness": "enforced",  // Always enforced
    "guardianLevel": "maximum",
    "autoDebugSensitivity": "high",
    "mechanicalValidation": true,     // Core requirement - zero-AI validation
    "apiKeys": {
      "glm": "your_glm_key_here",
      "deepseek": "your_deepseek_key_here",
      "gemma": "your_google_key_here"
    },
    "gemmaProxy": {
      "enabled": true,
      "url": "https://shark-gemini-proxy-production.up.railway.app"
    }
  }
}
```

## 🛠️ IMPLEMENTATION ROADMAP

### PHASE 1: FOUNDATION SYSTEMS (Weeks 1-2)
1. [ ] Fork Opencode repository
2. [ ] Integrate **Guardian System** 
   - Wrap all file system operations with permission checks
   - Implement system file blocking (.ssh, /etc/passwd, etc.)
   - Add audit logging
3. [ ] Verify Guardian blocks unauthorized operations
4. [ ] Integrate **WorkflowMachine**
   - Hook into command execution pipeline
   - Enforce PLAN→BUILD→TEST→VERIFY→SHIP sequence
   - Block advancement until step completion
5. [ ] Verify workflow prevents step skipping

### PHASE 2: CORE ARCHITECTURE (Weeks 3-4)
1. [ ] Replace core agent logic with **DualBrainCoordinator**
   - Implement Micro Engineer: DeepSeek plans → Gemma executes
   - Implement Macro Engineer: GLM plans+executes → DeepSeek advises
   - Configure automatic switching based on task complexity
2. [ ] Integrate **ToolExecutor** 
   - Wrap all tool calls through Shark's Guardian-protected executor
   - Ensure consistent tool result formatting
3. [ ] Verify dual-brain modes work correctly
4. [ ] Test tool execution with Guardian checks

### PHASE 3: ANTI-HALLUCINATION SYSTEMS (Weeks 5-6)
1. [ ] Integrate **AutoDebugEngine** into error handling
   - Pattern matching for common errors (missing scripts, wrong paths, etc.)
   - Mechanical fix attempts before user error display
   - Prevention tips before execution
2. [ ] Implement **mechanical violation detection**
   - CLI detects when agents fake completion or skip steps
   - Clear error messages with mechanical next steps
3. [ ] Verify anti-hallucination systems work
4. [ ] Test with deliberate violation attempts

### PHASE 4: FINAL VALIDATION (Weeks 7-8)
1. [ ] Implement **mechanical ship validation**
   - Compile-from-scratch verification at completion
   - Artifact-based workflow completion proof (0 AI inference)
   - Forced restart from PLAN on validation failure
2. [ ] Run full integration test suite
3. [ ] Verify all Shark Frankenstein success criteria:
   - Guardian: ✅ System file protection
   - Workflow: ✅ 5-step enforcement
   - AutoDebug: ✅ 60% error auto-fix
   - Build: ✅ Clean compilation
   - Tests: ✅ All integration tests pass
   - No theatrical code remaining
4. [ ] Prepare for Stage 3 user validation

## ✅ SUCCESS CRITERIA

The integrated system is successful when:

### Mechanical Enforcement Verified
- [ ] Guardian blocks `/etc/passwd` write attempts
- [ ] Workflow prevents BUILD step without complete PLAN
- [ ] Workflow prevents TEST step without complete BUILD
- [ ] AutoDebug fixes "missing script: build" automatically
- [ ] ToolExecutor blocks unauthorized file operations

### Anti-Hallucination Verified
- [ ] Agent faking test results gets mechanical violation error
- [ ] Agent skipping workflow steps gets blocked with clear next steps
- [ ] Ship validation requires actual mechanical compilation proof
- [ ] No simulated/mocked outputs allowed without workflow completion

### Dual-Brain Functionality Verified
- [ ] Micro Engineer: DeepSeek creates plan, Gemma executes exactly
- [ ] Macro Engineer: GLM handles end-to-end with DeepSeek advisory
- [ ] Mode switching happens automatically based on task
- [ ] Context window pollution prevented for GLM in macro mode

### UI Preservation Verified
- [ ] Opencode's interface remains intact and usable
- [ ] Shark-specific indicators added (mode, workflow step, guardian status)
- [ ] All existing Opencode features accessible
- [ ] User experience maintains what they like about Opencode

## 📋 COMMUNICATION PROTOCOL (MANDATORY)

All work must follow Shark's communication standard:

```
[1/5] Description of action... ✓ (result)
[2/5] Description of action... ✓ (result)
...
```

**Examples**:
```
[1/5] Integrating Guardian file protection... ✓ (blocks /etc/passwd write)
[2/5] Wrapping read/write tools with permission checks... ✓ (all tools guarded)
[3/5] Testing workflow enforcement... ✓ (blocks build without plan)
[4/5] Configuring dual-brain coordinator... ✓ (micro/macro modes functional)
[5/5] Verifying anti-hallucination detection... ✓ (catches fake test results)
```

**NEVER** push to git without explicit user approval.

## 🚫 WHAT NOT TO DO (USER PREFERENCES)

Based on user feedback about other AI agents:
- ❌ **Do NOT** describe/explain without implementing
- ❌ **Do NOT** stay silent then claim "done" 
- ❌ **Do NOT** suggest older/slower models when user wants latest (use glm-4.7)
- ❌ **Do NOT** create mock tests instead of running real tests
- ❌ **Do NOT** use standard GLM endpoint (user has Coding Plan subscription)
- ❌ **Do NOT** push to git without explicit user approval

## ✅ WHAT TO DO

- ✅ **Actually write code, run commands, modify files**
- ✅ **Report incrementally** (every action) using the format above
- ✅ **Test real functionality**, not just imports or syntax
- ✅ **Verify glm-4.7 works specifically** on the coding plan endpoint
- ✅ **Ask for approval** before any git operations
- ✅ **Focus on implementation**, not explanation
- ✅ **Preserve what user likes** about Opencode's UI

## 📁 CONTEXT PRESERVATION

When context gets bloated, use this save/restore pattern:

```bash
# CREATE CONTEXT SNAPSHOT
mkdir -p ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)
cp -r ./src ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)/
cp -r ./packages ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)/
cp ./package*.json ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true
cp ./.env ./shared-workspace/snapshot-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true

# UPDATE WORKLOG
echo "## $(date) - Context Savepoint\n\n[DESCRIBE WHAT YOU ACCOMPLISHED]\nNext agent should: [DESCRIBE NEXT STEPS]\n\n---\n" >> ./shared-workspace/AUDIT-WORKLOG.md
```

## 🏁 COMPLETION CRITERIA

You are done when:
1. ✅ Forked Opencode repository with Shark systems integrated
2. ✅ All 4 Shark systems (Guardian, Workflow, AutoDebug, ToolExecutor) operational
3. ✅ Dual-brain architecture functioning (micro/macro modes)
4. ✅ Mechanical enforcement verified (no bypass possible)
5. ✅ Anti-hallucination systems working (catches fake outputs)
6. ✅ Ship validation requires actual mechanical proof
7. ✅ Build passes and all integration tests pass
8. ✅ User approves before any git push
9. ✅ Ready for Stage 3 user endpoint validation

---

**The CLI becomes the Earth Density** - mechanical enforcement layer that directs the river of AI agency toward productive, verifiable output. Agents operate freely within the channel but cannot escape its constraints. This is the Shark Agent thesis realized through Opencode's foundation.

*Let's build the future of trustworthy AI agents.* 🦈