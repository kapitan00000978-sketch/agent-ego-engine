import { DefectDiagnostic, GatekeeperCycleResult, ProfessionSpec, VerificationContext } from '../spec/profession-spec.js';
import { AutoFixer } from '../fixer/auto-fixer.js';

export class DeterministicGatekeeperEngine {
  /**
   * Executes the strict iterative loop:
   * Write/Receive -> Verify -> Report (file:line -> rule -> remedy) -> Auto-Repair / Rewrite
   * Maximum N iterations, then hands off remaining unresolved diagnostics to user.
   */
  public static async executeCycle(
    initialContent: string,
    targetPath: string,
    spec: ProfessionSpec,
    maxIterations = 3
  ): Promise<GatekeeperCycleResult> {
    let currentContent = initialContent;
    let iteration = 0;
    let finalScore = 0;
    let passed = false;
    let hardGateFailure = false;
    let lastDiagnostics: DefectDiagnostic[] = [];
    const auditHistory: GatekeeperCycleResult['auditHistory'] = [];

    while (iteration < maxIterations) {
      iteration++;
      const context: VerificationContext = {
        targetPath,
        content: currentContent,
        isHtml: /\.(html|htm|jsx|tsx)$/i.test(targetPath)
      };

      // 1. Run all deterministic verifiers attached to this profession
      const diagnostics: DefectDiagnostic[] = [];
      let totalCompilerErrors = 0;
      let totalLinterErrors = 0;
      let totalA11yViolations = 0;
      let totalCls = 0;
      let coverageValue: number | 'N/A' = 'N/A';

      for (const verifier of spec.verifiers) {
        try {
          const res = await verifier.verify(context);
          diagnostics.push(...res.diagnostics);
          if (res.metrics.compilerErrors) totalCompilerErrors += res.metrics.compilerErrors;
          if (res.metrics.linterErrors) totalLinterErrors += res.metrics.linterErrors;
          if (res.metrics.a11yViolations) totalA11yViolations += res.metrics.a11yViolations;
          if (res.metrics.clsScore) totalCls = Math.max(totalCls, res.metrics.clsScore);
          if (res.metrics.testCoverage !== undefined) coverageValue = res.metrics.testCoverage;
        } catch (err: unknown) {
          diagnostics.push({
            file: targetPath,
            ruleId: 'VERIFIER_EXECUTION_FAILURE',
            severity: 'moderate',
            message: `Verifier "${verifier.name}" execution failed: ${err instanceof Error ? err.message : String(err)}`,
            remedy: 'Check runtime environment dependencies.'
          });
        }
      }

      // 2. Score Computation (Hard Gate & Weighted Rubric)
      if (totalCompilerErrors > 0 || totalLinterErrors > 0) {
        hardGateFailure = true;
        finalScore = 0.0;
        passed = false;
      } else {
        hardGateFailure = false;
        let score = 10.0;
        for (const d of diagnostics) {
          if (d.severity === 'hard_gate') score -= 10.0;
          else if (d.severity === 'blocker') score -= 2.5;
          else if (d.severity === 'critical') score -= 1.5;
          else if (d.severity === 'moderate') score -= 0.5;
          // 'advisory' does not deduct score in Group C
        }

        if (totalA11yViolations > 0) {
          score -= Math.min(3.0, totalA11yViolations * 0.5);
        }
        if (totalCls > 0.1) {
          score -= 1.0;
        }
        if (typeof coverageValue === 'number' && coverageValue < 80) {
          score -= 1.0;
        }

        finalScore = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
        passed = finalScore >= spec.minAcceptableScore;
      }

      lastDiagnostics = diagnostics;
      auditHistory.push({
        iteration,
        score: finalScore,
        diagnosticsCount: diagnostics.length
      });

      // If passed or max iteration reached, exit loop
      if (passed || iteration >= maxIterations) {
        break;
      }

      // 3. Auto-Repair attempt for next iteration
      const fixRes = AutoFixer.fix(currentContent, targetPath);
      if (fixRes.modified && fixRes.syntaxValid) {
        currentContent = fixRes.content;
      } else {
        // If fixer cannot modify further, stop burning iterations
        break;
      }
    }

    // 4. Generate Machine-Readable Report
    const machineReport = DeterministicGatekeeperEngine.formatMachineReport(
      targetPath,
      spec,
      finalScore,
      passed,
      hardGateFailure,
      lastDiagnostics,
      iteration,
      maxIterations
    );

    return {
      iterationCount: iteration,
      maxIterations,
      finalScore,
      passed,
      hardGateFailure,
      unresolvedDiagnostics: lastDiagnostics,
      auditHistory,
      machineReadableReport: machineReport
    };
  }

  public static formatMachineReport(
    filePath: string,
    spec: ProfessionSpec,
    score: number,
    passed: boolean,
    hardGateFailure: boolean,
    diagnostics: DefectDiagnostic[],
    iterations: number,
    maxIterations: number
  ): string {
    const lines: string[] = [];
    lines.push(`--- GATEKEEPER INSPECTION REPORT ---`);
    lines.push(`Target: ${filePath}`);
    lines.push(`Profession: [${spec.group}] ${spec.title} (ID: ${spec.id})`);
    lines.push(`Status: ${passed ? 'APPROVED' : 'REJECTED'} (Score: ${score}/10.0 | Min Required: ${spec.minAcceptableScore}/10.0)`);
    lines.push(`Iterations Completed: ${iterations}/${maxIterations}`);
    if (hardGateFailure) {
      lines.push(`HARD GATE: FAILED. Output contains compilation/syntax/linter errors. Immediate rejection.`);
    }

    lines.push(`\nUNRESOLVED DIAGNOSTICS (${diagnostics.length}):`);
    if (diagnostics.length === 0) {
      lines.push(`  (None. All deterministic verifiers passed).`);
    } else {
      diagnostics.forEach((d, i) => {
        const loc = d.line ? `${d.file}:${d.line}${d.column ? `:${d.column}` : ''}` : d.file;
        lines.push(`${i + 1}. [${d.severity.toUpperCase()}] ${loc} -> Rule: ${d.ruleId}`);
        lines.push(`   Issue: ${d.message}`);
        lines.push(`   Remedy: ${d.remedy}`);
      });
    }

    lines.push(`------------------------------------`);
    return lines.join('\n');
  }
}
