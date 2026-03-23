# 🦈 Shark Agent OS - 2-Stage Testing Protocol

> **Version**: 2.0.0  
> **Last Updated**: 2026-03-22  
> **Status**: MANDATORY for all releases  
> **Guardian**: REQUIRED for all operations

---

## ⚠️ CRITICAL: GUARDIAN PROTECTION

**Guardian is NOT just for Docker - it protects ALL agent operations.**

Guardian is the core safety rail that prevents agents from:
- Modifying system files
- Accessing personal credentials  
- Breaking critical configurations
- Escaping designated workspace boundaries
- Damaging the host device during testing

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

---

## 📋 OVERVIEW

Shark Agent OS enforces a **2-Stage Testing Protocol** before any code is considered production-ready. This ensures both isolated validation and real-world usability.

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 1: Docker Sandbox (Automated CI)                         │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Isolated environment (no host contamination)                 │
│  ✓ Reproducible (same results every time)                       │
│  ✓ Catches Docker-specific issues (stdin.isTTY bug)             │
│  ✓ Safe for destructive tests                                   │
│  ✗ Limited TTY simulation                                       │
│  ✗ Can't test real interactive UX                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    If Stage 1 passes
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 2: Local Device (Real User Testing)                      │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Real TTY (interactive wizard works properly)                 │
│  ✓ Actual network conditions                                    │
│  ✓ Real API key validation                                      │
│  ✓ User experience testing                                      │
│  ✗ Not reproducible                                             │
│  ✗ Risk of affecting host system                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🐳 STAGE 1: DOCKER SANDBOX TESTING

### Purpose
Automated, isolated testing that catches edge cases and environment-specific bugs.

### Test Categories

| Category | Tests | Priority |
|----------|-------|----------|
| **Non-Interactive Mode** | stdin handling, mode selection, piped input | HIGH |
| **API Integration** | DeepSeek, GLM, Gemma endpoints | HIGH |
| **Error Handling** | Timeout, network failure, invalid input | HIGH |
| **Configuration** | Environment variables, file loading | MEDIUM |
| **Security** | Guardian file protection, credential detection | HIGH |
| **Edge Cases** | Empty input, special characters, unicode | MEDIUM |

### Execution

```bash
# Run Stage 1 tests
cd shark-frankenstein/testing
./run-stage1.sh

# Or with specific test suite
./run-stage1.sh --suite api-integration
```

### Pass Criteria

- [ ] All non-interactive mode tests pass
- [ ] API integration tests complete without timeouts
- [ ] Error handling catches all expected errors
- [ ] Guardian security tests pass 100%
- [ ] No unhandled exceptions

---

## 💻 STAGE 2: LOCAL DEVICE TESTING

### Purpose
Real-world validation with actual TTY, network conditions, and API keys.

### Test Categories

| Category | Tests | Priority |
|----------|-------|----------|
| **Interactive UX** | Wizard flow, mode selection, REPL | HIGH |
| **TTY Features** | Console colors, prompts, screen clearing | HIGH |
| **Real API Calls** | Live DeepSeek/GLM/Gemma requests | HIGH |
| **Performance** | Response time, memory usage, stability | MEDIUM |
| **File Operations** | Read/write/protect files | MEDIUM |
| **User Experience** | Error messages, help text, intuitiveness | MEDIUM |

### Execution

```bash
# Run Stage 2 tests (requires interactive terminal)
cd shark-frankenstein/testing
./run-stage2.sh

# With specific API keys
GOOGLE_API_KEY=xxx GLM_API_KEY=xxx ./run-stage2.sh
```

### Pass Criteria

- [ ] Interactive wizard displays correctly
- [ ] Mode selection works (Micro/Macro)
- [ ] Real API calls complete successfully
- [ ] Performance within acceptable limits (Micro < 5s, Macro < 60s)
- [ ] Error messages are helpful
- [ ] No visual glitches or UX issues

---

## 📊 TEST REPORT FORMAT

### Stage 1 Report Template

```markdown
# 🦈 Stage 1: Docker Sandbox Test Report

**Date**: YYYY-MM-DD HH:MM:SS  
**Commit**: abc1234  
**Docker Image**: node:18-alpine  
**Duration**: X seconds

## Test Results

| Suite | Tests | Passed | Failed | Skipped |
|-------|-------|--------|--------|---------|
| Non-Interactive | 15 | 15 | 0 | 0 |
| API Integration | 10 | 9 | 1 | 0 |
| Error Handling | 12 | 12 | 0 | 0 |
| Security | 8 | 8 | 0 | 0 |

## Failed Tests
- [API Integration] GLM timeout on complex task

## Environment Issues
- None detected

## Recommendation
⚠️ PROCEED TO STAGE 2 with noted issues
```

### Stage 2 Report Template

```markdown
# 🦈 Stage 2: Local Device Test Report

**Date**: YYYY-MM-DD HH:MM:SS  
**Commit**: abc1234  
**Device**: MacBook Pro M1 / Ubuntu 22.04  
**Node Version**: 18.19.0  
**Duration**: X minutes

## Interactive Tests

| Test | Result | Notes |
|------|--------|-------|
| Wizard Display | ✅ PASS | Banner centered correctly |
| Mode Selection | ✅ PASS | Both modes work |
| Micro Execution | ✅ PASS | 2.3s average |
| Macro Execution | ⚠️ SLOW | 45s for complex task |

## Real API Results

| API | Status | Avg Response |
|-----|--------|--------------|
| Gemma 3 4B | ✅ Working | 1.8s |
| GLM 4.5-flash | ✅ Working | 12.4s |
| DeepSeek R1 | ✅ Working | 3.2s |

## UX Assessment
- Error messages: Clear and helpful
- Visual design: Good
- Performance: Acceptable

## Recommendation
✅ READY FOR PRODUCTION
```

---

## 🔄 INTEGRATION WITH AGENT WORKFLOW

### For Agents Building Shark Components

```
1. Make code changes
2. Run: shark test stage1
3. If Stage 1 passes → Report results
4. Request Stage 2 from human
5. Human runs: shark test stage2
6. Both stages pass → Commit to main
```

### Command Integration

```bash
# Built into Shark CLI
shark test stage1     # Run Docker tests
shark test stage2     # Run local tests (interactive)
shark test all        # Run both stages
shark test report     # View last test results
```

---

## ⚠️ COMMON DOCKER ISSUES REFERENCE

These issues are automatically injected into Stage 1 tests to prevent repetition:

### 1. stdin.isTTY Returns Undefined
**Error**: Non-interactive mode fails in Docker  
**Fix**: Use `process.stdin.isTTY === true` instead of `!process.stdin.isTTY`

### 2. Volume Mount Permissions
**Error**: Permission denied on mounted files  
**Fix**: Create files inside container, not on host mount

### 3. npm Install as Non-Root
**Error**: EACCES permission denied  
**Fix**: Install dependencies as root, then switch user

### 4. Docker Compose Version Warning
**Error**: "version attribute is obsolete"  
**Fix**: Remove version line from docker-compose.yml

### 5. ts-node Not Found
**Error**: ts-node missing but tsx available  
**Fix**: Use `npx tsx` instead of `ts-node`

---

## 📁 FILE STRUCTURE

```
testing/
├── TESTING_PROTOCOL.md        # This document
├── run-stage1.sh              # Docker test runner
├── run-stage2.sh              # Local test runner
├── stage1-docker/
│   ├── Dockerfile             # Test container
│   ├── docker-compose.yml     # Test orchestration
│   ├── test-non-interactive.sh
│   ├── test-api-integration.sh
│   ├── test-error-handling.sh
│   ├── test-security.sh
│   └── test-edge-cases.sh
├── stage2-local/
│   ├── test-interactive.sh
│   ├── test-tty-features.sh
│   ├── test-real-api.sh
│   ├── test-performance.sh
│   └── test-ux.sh
└── reports/
    ├── stage1-latest.md
    ├── stage2-latest.md
    └── history/
```

---

## 🎯 SUCCESS CRITERIA

### Stage 1 Must Pass
- 100% of HIGH priority tests
- 90% of MEDIUM priority tests
- No critical errors

### Stage 2 Must Pass
- All interactive features work
- Real API calls succeed
- Performance within limits
- No UX blockers

### Production Ready
- Both stages pass
- No unaddressed critical issues
- Documentation updated
- Changelog updated

---

*This protocol is MANDATORY for all Shark Agent OS releases.*
