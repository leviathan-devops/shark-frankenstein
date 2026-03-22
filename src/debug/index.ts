/**
 * 🦈 SHARK CLI - Auto-Debug System
 *
 * This system is BAKED INTO THE CLI so agents don't waste time on minutia.
 *
 * USAGE:
 *
 *   import { AutoDebugEngine, analyzeError, tryAutoFix } from './debug';
 *
 *   // Quick analysis
 *   const issues = analyzeError(errorOutput);
 *
 *   // Attempt auto-fix
 *   const result = await tryAutoFix(errorOutput, workspacePath);
 *
 *   // Get prevention tips before running command
 *   const tips = new AutoDebugEngine().getPreventionTips('docker build');
 *
 * INTEGRATION POINTS:
 *
 *   1. Pre-flight checks - Before any operation, check for common issues
 *   2. Error capture - When errors occur, run through auto-debug
 *   3. Auto-recovery - Apply fixes automatically when possible
 *   4. User guidance - Show exact steps when manual fix needed
 */

export * from './autodebug';
export { AutoDebugEngine as default } from './autodebug';
