/**
 * 🦈 SHARK CLI - Testing Module
 * 
 * 2-Stage Testing System with Universal Guardian Protection
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                     SHARK TEST PIPELINE                         │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                 │
 * │   Stage 1: DOCKER SANDBOX                                       │
 * │   ┌─────────────────────────────────────────────────────────┐   │
 * │   │  Container Isolation + Guardian (inner layer)           │   │
 * │   │  - Automated CI testing                                  │   │
 * │   │  - Isolated network                                      │   │
 * │   │  - Resource limits                                       │   │
 * │   │  - Pass rate must be > 80% to proceed                    │   │
 * │   └─────────────────────────────────────────────────────────┘   │
 * │                           ↓                                     │
 * │   Stage 2: LOCAL DEVICE                                         │
 * │   ┌─────────────────────────────────────────────────────────┐   │
 * │   │  Guardian IS THE PROTECTION LAYER                       │   │
 * │   │  - Protects system files                                 │   │
 * │   │  - Protects personal credentials                         │   │
 * │   │  - Protects critical configs                             │   │
 * │   │  - Allows workspace modifications                        │   │
 * │   │  - Audit logging for all operations                      │   │
 * │   └─────────────────────────────────────────────────────────┘   │
 * │                                                                 │
 * │   GUARDIAN IS NOT JUST FOR DOCKER!                             │
 * │   IT'S THE UNIVERSAL AGENT FIREWALL FOR ALL ENVIRONMENTS       │
 * │                                                                 │
 * └─────────────────────────────────────────────────────────────────┘
 */

// Types
export * from './types';

// Runner
export {
  SharkTestRunner,
  createDockerTestRunner,
  createLocalTestRunner,
  createPipelineTestRunner,
} from './runner';

// Test Suites
export {
  MICRO_ENGINEER_SUITE,
  MACRO_ENGINEER_SUITE,
  GUARDIAN_SUITE,
  DUAL_BRAIN_SUITE,
  ALL_SUITES,
  getDockerSuites,
  getLocalSuites,
  getSuiteById,
} from './suites';

// Re-export Guardian for convenience
export {
  Guardian,
  ProtectionLevel,
  ProtectionStatus,
  ModificationDecision,
  ZoneType,
  createTestGuardian,
  createProductionGuardian,
  createCIGuardian,
} from '../guardian';

// Default export
import { SharkTestRunner } from './runner';
export default SharkTestRunner;
