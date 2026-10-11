import { z } from 'zod';

export type ProfessionGroup = 'A' | 'B' | 'C';

export interface DefectDiagnostic {
  file: string;
  line?: number;
  column?: number;
  ruleId: string;
  severity: 'hard_gate' | 'blocker' | 'critical' | 'moderate' | 'advisory';
  message: string;
  remedy: string;
  rawSnippet?: string;
}

export interface VerificationContext {
  targetPath: string;
  content: string;
  projectRoot?: string;
  isHtml?: boolean;
}

export interface VerificationResult {
  verifierName: string;
  passed: boolean;
  diagnostics: DefectDiagnostic[];
  metrics: {
    compilerErrors?: number;
    linterErrors?: number;
    a11yViolations?: number;
    clsScore?: number;
    testCoverage?: number | 'N/A';
    customMetrics?: Record<string, unknown>;
  };
}

export interface Verifier {
  name: string;
  description: string;
  verify(context: VerificationContext): Promise<VerificationResult>;
}

export interface TestFixture {
  name: string;
  input: string;
  expectedPass: boolean;
  expectedRuleViolations?: string[];
}

export interface ProfessionSpec {
  id: string;
  title: string;
  group: ProfessionGroup;
  description: string;
  checklist: string[];
  verifiers: Verifier[];
  fixtures: TestFixture[];
  personaPrompt: string;
  minAcceptableScore: number;
}

export interface GatekeeperCycleResult {
  iterationCount: number;
  maxIterations: number;
  finalScore: number;
  passed: boolean;
  hardGateFailure: boolean;
  unresolvedDiagnostics: DefectDiagnostic[];
  auditHistory: Array<{
    iteration: number;
    score: number;
    diagnosticsCount: number;
  }>;
  machineReadableReport: string;
}
