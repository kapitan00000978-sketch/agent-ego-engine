import { DefectItem, DisgustLevel, ArchetypeDefinition, ObjectiveScoreBreakdown } from '../types.js';

export interface ScoreInputMetrics {
  compilerErrors?: number;
  linterErrors?: number;
  testCoverage?: number | 'N/A';
  a11yViolations?: number;
  clsScore?: number;
  horizontalOverflow?: boolean;
}

export class DisgustCalculator {
  /**
   * Deterministic Rubric with Hard Gates and weighted deductions:
   * 1. Hard Gate: If tsc errors > 0 OR linter errors > 0 -> Score = 0.0 IMMEDIATELY.
   * 2. Defect deductions: Blocker (-2.5), Critical (-1.5), Moderate (-0.5).
   * 3. Accessibility deductions: -0.5 per a11y violation (capped at -3.0).
   * 4. Layout/CLS deductions: -1.0 if horizontal overflow; -1.0 if CLS > 0.1.
   * 5. Test coverage: If present and < 80%, deduct -1.0; if 'N/A', no deduction (fair policy).
   */
  public static calculate(
    defects: DefectItem[],
    archetype: ArchetypeDefinition,
    metrics?: ScoreInputMetrics
  ): {
    score: number;
    passed: boolean;
    disgustLevel: DisgustLevel;
    breakdown: ObjectiveScoreBreakdown;
  } {
    const compilerErrors = metrics?.compilerErrors ?? 0;
    const linterErrors = metrics?.linterErrors ?? 0;
    const testCoverage = metrics?.testCoverage ?? 'N/A';
    const a11yViolations = metrics?.a11yViolations ?? 0;
    const clsScore = metrics?.clsScore ?? 0;
    const horizontalOverflow = metrics?.horizontalOverflow ?? false;

    // 1. HARD GATE: Compiler or Linter errors = Score 0.0
    if (compilerErrors > 0 || linterErrors > 0) {
      const reason = compilerErrors > 0
        ? `HARD GATE TRIGGERED: ${compilerErrors} TypeScript compiler (tsc) diagnostic error(s).`
        : `HARD GATE TRIGGERED: ${linterErrors} ESLint error(s).`;

      return {
        score: 0.0,
        passed: false,
        disgustLevel: 'unacceptable_garbage',
        breakdown: {
          hardGatePassed: false,
          hardGateFailureReason: reason,
          compilerDiagnosticsCount: compilerErrors,
          linterErrorsCount: linterErrors,
          testCoveragePercent: testCoverage,
          a11yViolationsCount: a11yViolations,
          visualLayoutShifts: clsScore,
          scoreFormulaSummary: `Score: 0.0/10.0 (Hard gate failure: Zero tolerance for syntax/compile/lint errors).`
        }
      };
    }

    let score = 10.0;
    const deductionLogs: string[] = [];

    // 2. Defect Deductions
    for (const defect of defects) {
      if (defect.severity === 'blocker') {
        score -= 2.5;
        deductionLogs.push(`Blocker defect (-2.5): ${defect.description}`);
      } else if (defect.severity === 'critical') {
        score -= 1.5;
        deductionLogs.push(`Critical defect (-1.5): ${defect.description}`);
      } else if (defect.severity === 'moderate') {
        score -= 0.5;
        deductionLogs.push(`Moderate defect (-0.5): ${defect.description}`);
      }
    }

    // 3. Accessibility (axe-core)
    if (a11yViolations > 0) {
      const a11yDeduction = Math.min(3.0, a11yViolations * 0.5);
      score -= a11yDeduction;
      deductionLogs.push(`Accessibility violations (-${a11yDeduction}): ${a11yViolations} axe-core issue(s)`);
    }

    // 4. Layout shifts & Overflow
    if (horizontalOverflow) {
      score -= 1.0;
      deductionLogs.push(`Visual layout (-1.0): Horizontal viewport overflow detected`);
    }
    if (clsScore > 0.1) {
      score -= 1.0;
      deductionLogs.push(`Visual stability (-1.0): Cumulative Layout Shift (CLS) is ${clsScore.toFixed(3)} (>0.1)`);
    }

    // 5. Test Coverage (Optional)
    if (typeof testCoverage === 'number' && testCoverage < 80) {
      score -= 1.0;
      deductionLogs.push(`Test coverage (-1.0): ${testCoverage}% is below the 80% threshold`);
    }

    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
    const passed = score >= archetype.minAcceptableScore;

    let disgustLevel: DisgustLevel = 'none';
    if (score < 6.0) {
      disgustLevel = 'unacceptable_garbage';
    } else if (score < 8.0) {
      disgustLevel = 'furious';
    } else if (score < archetype.minAcceptableScore) {
      disgustLevel = 'mildly_annoyed';
    } else if (score < 9.5) {
      disgustLevel = 'condescending_smirk';
    } else {
      disgustLevel = 'none';
    }

    const summary = deductionLogs.length === 0
      ? `Base score 10.0/10. Zero deductions. Passed all rubric checks.`
      : `Base 10.0 minus deductions: ${deductionLogs.join('; ')} -> Final: ${score}/10.`;

    return {
      score,
      passed,
      disgustLevel,
      breakdown: {
        hardGatePassed: true,
        compilerDiagnosticsCount: compilerErrors,
        linterErrorsCount: linterErrors,
        testCoveragePercent: testCoverage,
        a11yViolationsCount: a11yViolations,
        visualLayoutShifts: clsScore,
        scoreFormulaSummary: summary
      }
    };
  }
}
