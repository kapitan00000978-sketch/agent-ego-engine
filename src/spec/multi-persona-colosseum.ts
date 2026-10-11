import { ProfessionSpec, DefectDiagnostic } from './profession-spec.js';
import { UniversalProfessionSynthesizer } from './universal-synthesizer.js';
import { DeterministicGatekeeperEngine } from '../engine/deterministic-gatekeeper.js';

export interface MultiPersonaParticipant {
  role: string;
  spec: ProfessionSpec;
  openingCritique: string;
  vetoTriggered: boolean;
  score: number;
  unresolvedDefects: DefectDiagnostic[];
}

export interface MultiPersonaPanelReport {
  targetGoalOrFile: string;
  participants: MultiPersonaParticipant[];
  overallConsensusScore: number;
  panelPassed: boolean;
  unanimousApproval: boolean;
  dissentingOpinions: string[];
  unifiedMandates: string[];
  machineReadableReport: string;
}

export class MultiPersonaColosseumEngine {
  /**
   * Evaluates a single task or artifact through MULTIPLE opposing characters concurrently.
   * e.g., Task: "Build High-Frequency Crypto Trading Engine"
   * Engages:
   * 1. Quantitative Risk Analyst (Cold Cynic)
   * 2. Low-Latency C++ Architect (Obsessive Perfectionist)
   * 3. SEC Compliance & Audit Officer (Militant Standards Officer)
   * 4. Offensive Security Sentinel (Paranoid Zero-Trust)
   */
  public static async evaluatePanel(
    content: string,
    targetPath: string,
    rolesToEngage: string[] = []
  ): Promise<MultiPersonaPanelReport> {
    let roles = rolesToEngage;
    if (roles.length < 2) {
      roles = MultiPersonaColosseumEngine.detectComplementaryRoles(content, targetPath);
    }

    const participants: MultiPersonaParticipant[] = [];
    const dissentingOpinions: string[] = [];
    const unifiedMandates: string[] = [];

    let totalScore = 0;
    let anyVeto = false;

    for (const roleName of roles) {
      const spec = UniversalProfessionSynthesizer.synthesize({
        domainOrRole: roleName
      });

      const cycleResult = await DeterministicGatekeeperEngine.executeCycle(
        content,
        targetPath,
        spec,
        1
      );

      const veto = !cycleResult.passed || cycleResult.hardGateFailure;
      if (veto) anyVeto = true;

      totalScore += cycleResult.finalScore;

      let openingCritique = `[${spec.title}]: Approved with high standard score of ${cycleResult.finalScore}/10.`;
      if (veto) {
        openingCritique = `[${spec.title}]: VETO TRIGGERED! Scoring ${cycleResult.finalScore}/10. Found ${cycleResult.unresolvedDiagnostics.length} critical violation(s).`;
        dissentingOpinions.push(`${spec.title}: Rejects artifact due to ${cycleResult.unresolvedDiagnostics.map(d => d.ruleId).join(', ')}`);
      }

      cycleResult.unresolvedDiagnostics.forEach(d => {
        unifiedMandates.push(`[Enforced by ${spec.title}]: ${d.remedy} (${d.ruleId})`);
      });

      participants.push({
        role: roleName,
        spec,
        openingCritique,
        vetoTriggered: veto,
        score: cycleResult.finalScore,
        unresolvedDefects: cycleResult.unresolvedDiagnostics
      });
    }

    const consensusScore = Math.round((totalScore / participants.length) * 10) / 10;
    const panelPassed = !anyVeto && consensusScore >= 9.0;
    const unanimousApproval = !anyVeto;

    const reportLines: string[] = [];
    reportLines.push(`=== MULTI-PERSONA EXPERT PANEL REPORT ===`);
    reportLines.push(`Target: ${targetPath}`);
    reportLines.push(`Panel Size: ${participants.length} Active Expert Personas`);
    reportLines.push(`Consensus Score: ${consensusScore}/10.0 | Status: ${panelPassed ? 'APPROVED BY COUNCIL' : 'BLOCKED BY COUNCIL'}`);
    reportLines.push(`Unanimous Approval: ${unanimousApproval ? 'YES' : 'NO'}`);
    reportLines.push(`\nEXPERT BREAKDOWN:`);
    participants.forEach((p, idx) => {
      reportLines.push(`${idx + 1}. ${p.spec.title} -> Score: ${p.score}/10 [${p.vetoTriggered ? 'VETO / REJECTED' : 'APPROVED'}]`);
      reportLines.push(`   Stance: "${p.openingCritique}"`);
    });

    if (dissentingOpinions.length > 0) {
      reportLines.push(`\nDISSENTING VETOS:`);
      dissentingOpinions.forEach(d => reportLines.push(`  ❌ ${d}`));
    }

    if (unifiedMandates.length > 0) {
      reportLines.push(`\nUNIFIED COUNCIL MANDATES TO SATISFY ALL PERSONAS:`);
      const uniqueMandates = Array.from(new Set(unifiedMandates));
      uniqueMandates.forEach((m, idx) => reportLines.push(`  ${idx + 1}. ${m}`));
    }
    reportLines.push(`=========================================`);

    return {
      targetGoalOrFile: targetPath,
      participants,
      overallConsensusScore: consensusScore,
      panelPassed,
      unanimousApproval,
      dissentingOpinions,
      unifiedMandates,
      machineReadableReport: reportLines.join('\n')
    };
  }

  private static detectComplementaryRoles(content: string, targetPath: string): string[] {
    const isUi = /\.(html|jsx|tsx|vue|svelte)$/i.test(targetPath) || content.includes('<div') || content.includes('<button');
    const isSecuritySensitive = /(auth|crypto|payment|token|password|sql|secret)/i.test(content + targetPath);

    if (isUi && isSecuritySensitive) {
      return [
        'Awwwards Design & UI Architect',
        'Offensive Security Sentinel',
        'WCAG Accessibility & Compliance Auditor'
      ];
    } else if (isSecuritySensitive) {
      return [
        'Offensive Security Sentinel',
        'Distributed Systems Architect',
        'Regulatory Compliance Auditor'
      ];
    } else if (isUi) {
      return [
        'Awwwards Design & UI Architect',
        'Performance & CLS Optimization Engineer',
        'WCAG Accessibility & Compliance Auditor'
      ];
    }

    return [
      'Clean Architecture Staff Engineer',
      'Paranoid Zero-Trust Security Officer',
      'Production Reliability SRE'
    ];
  }
}
