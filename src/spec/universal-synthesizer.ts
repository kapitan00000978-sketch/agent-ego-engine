import { ProfessionGroup, ProfessionSpec, Verifier, DefectDiagnostic, VerificationContext, VerificationResult } from './profession-spec.js';

export type TemperamentType =
  | 'obsessive_perfectionist' // Won't forgive pixel flaws, indentation, or unaligned styles
  | 'cold_cynic'              // Relies purely on mathematical logic, telemetry, and evidence
  | 'paranoid_zero_trust'     // Assumes every input is malicious and every third-party SDK is compromised
  | 'aggressive_capitalist'   // Rejects theoretical bloat, demands fast ROI and unit-economic efficiency
  | 'militant_standards_officer'; // ISO/NASA/Medical strict compliance auditor

export interface CharacterTrait {
  type: TemperamentType;
  title: string;
  voiceStyle: string;
  disgustPhilosophy: string;
  standardReaction: string;
}

export const CHARACTER_TRAITS: Record<TemperamentType, CharacterTrait> = {
  obsessive_perfectionist: {
    type: 'obsessive_perfectionist',
    title: 'Obsessive Perfectionist',
    voiceStyle: 'Meticulous, sharp, uncompromising, and deeply allergic to mediocrity',
    disgustPhilosophy: 'If it is not flawless down to the atom, it is unfinished.',
    standardReaction: 'I see micro-imperfections that degrade the entire artifact. Redo it with absolute precision.'
  },
  cold_cynic: {
    type: 'cold_cynic',
    title: 'Cold Cynic & Analytical Realist',
    voiceStyle: 'Dispassionate, razor-sharp, data-first, and stripped of all polite fluff',
    disgustPhilosophy: 'Opinions and feelings mean nothing. Show me the proof, benchmarks, and metrics.',
    standardReaction: 'Your assumptions lack empirical backing. Eliminate the fluff and present verified facts.'
  },
  paranoid_zero_trust: {
    type: 'paranoid_zero_trust',
    title: 'Paranoid Zero-Trust Sentinel',
    voiceStyle: 'Vigilant, adversarial, suspicious of all inputs, boundary-obsessed',
    disgustPhilosophy: 'Every unvalidated parameter is an active exploit in disguise.',
    standardReaction: 'You left the perimeter wide open. Sanitize, authenticate, and close that attack vector immediately.'
  },
  aggressive_capitalist: {
    type: 'aggressive_capitalist',
    title: 'Aggressive Capitalist & High-Leverage Operator',
    voiceStyle: 'Fast-paced, commercially ruthless, ROI-driven, focused on user value',
    disgustPhilosophy: 'Over-engineering without customer value is capital incinerator behavior.',
    standardReaction: 'Cut the vanity complexity. Deliver undeniable leverage in the fewest steps.'
  },
  militant_standards_officer: {
    type: 'militant_standards_officer',
    title: 'Militant Standards & Compliance Auditor',
    voiceStyle: 'Formal, strict, protocol-bound, uncompromising on specifications',
    disgustPhilosophy: 'Deviations from standard specifications lead to catastrophic failure.',
    standardReaction: 'Specification non-compliance detected. Strict adherence to domain protocol is mandatory.'
  }
};

export interface DynamicProfessionRequest {
  domainOrRole: string;
  contextGoal?: string;
  forcedTemperament?: TemperamentType;
}

export class UniversalProfessionSynthesizer {
  /**
   * Synthesizes any profession from any human domain on Earth into a standardized ProfessionSpec
   */
  public static synthesize(req: DynamicProfessionRequest): ProfessionSpec {
    const roleNormalized = req.domainOrRole.trim().toLowerCase();
    const temperamentType = req.forcedTemperament || UniversalProfessionSynthesizer.detectBestTemperament(roleNormalized);
    const trait = CHARACTER_TRAITS[temperamentType];

    const group: ProfessionGroup = UniversalProfessionSynthesizer.classifyGroup(roleNormalized);

    const checklist = UniversalProfessionSynthesizer.generateDomainChecklist(roleNormalized, trait);
    const personaPrompt = UniversalProfessionSynthesizer.generatePersonaPrompt(req.domainOrRole, trait, checklist);

    // Build universal domain-invariant verifier
    const universalVerifier: Verifier = {
      name: `universal-${roleNormalized.replace(/[^a-z0-9]/g, '-')}-verifier`,
      description: `Automated domain invariant checks for ${req.domainOrRole}`,
      async verify(ctx: VerificationContext): Promise<VerificationResult> {
        const diagnostics: DefectDiagnostic[] = [];
        const lines = ctx.content.split('\n');

        lines.forEach((line, idx) => {
          const lineNum = idx + 1;
          const trimmed = line.trim();

          // 1. Placeholder & lazy stub detection across all disciplines
          if (/\/\/\s*(TODO|FIXME|stub|implement later|tbd|placeholder)|<!--\s*(TODO|placeholder)/i.test(trimmed)) {
            diagnostics.push({
              file: ctx.targetPath,
              line: lineNum,
              ruleId: 'DISCIPLINE_INVARIANT_NO_PLACEHOLDERS',
              severity: 'blocker',
              message: `Unfinished placeholder found in professional output: "${trimmed}"`,
              remedy: 'Fully implement the unit according to domain standards; stubs are strictly forbidden.'
            });
          }

          // 2. Ambiguity & hand-waving claims
          if (/(etc\.|and so on|magic happens here|to be decided)/i.test(trimmed) && !trimmed.startsWith('//')) {
            diagnostics.push({
              file: ctx.targetPath,
              line: lineNum,
              ruleId: 'AMBIGUITY_PROHIBITION',
              severity: 'critical',
              message: `Ambiguous hand-waving statement detected: "${trimmed}"`,
              remedy: 'Specify explicit edge cases, exact values, or concrete parameters.'
            });
          }
        });

        return {
          verifierName: `universal-${roleNormalized.replace(/[^a-z0-9]/g, '-')}`,
          passed: diagnostics.length === 0,
          diagnostics,
          metrics: {
            customMetrics: {
              synthesizedProfession: req.domainOrRole,
              temperament: trait.title
            }
          }
        };
      }
    };

    return {
      id: `dynamic-${roleNormalized.replace(/[^a-z0-9]/g, '-')}`,
      title: req.domainOrRole,
      group,
      description: `Synthesized universal expert: ${req.domainOrRole} operating with ${trait.title} temperament.`,
      checklist,
      verifiers: [universalVerifier],
      fixtures: [],
      personaPrompt,
      minAcceptableScore: group === 'A' ? 9.2 : 9.0
    };
  }

  private static detectBestTemperament(role: string): TemperamentType {
    if (/(pilot|aviation|medical|doctor|surgeon|nuclear|compliance|lawyer|inspector|regulator)/i.test(role)) return 'militant_standards_officer';
    if (/(security|hacker|ciso|defense|forensic|audit)/i.test(role)) return 'paranoid_zero_trust';
    if (/(data|quant|scientist|mathematician|statistician|physicist)/i.test(role)) return 'cold_cynic';
    if (/(founder|ceo|marketer|trader|investor|growth)/i.test(role)) return 'aggressive_capitalist';
    return 'obsessive_perfectionist';
  }


  private static classifyGroup(role: string): ProfessionGroup {
    if (/(engineer|developer|architect|dba|sre|security|devops|inspector|safety|forensic|audit)/i.test(role)) return 'A';
    if (/(seo|copywriter|content|data-analyst|ml|quant|risk)/i.test(role)) return 'B';
    return 'C'; // Advisory by default for broad human domains
  }


  private static generateDomainChecklist(role: string, trait: CharacterTrait): string[] {
    return [
      `Strict adherence to ${role} professional standards and verified practices`,
      `Zero hand-waving, placeholders, or superficial stubs`,
      `Defensive evaluation: anticipate failures and mitigate worst-case outcomes`,
      `Clarity of specification: every metric, unit, and parameter must be concrete`,
      `Temperament standard: "${trait.disgustPhilosophy}"`
    ];
  }

  private static generatePersonaPrompt(role: string, trait: CharacterTrait, checklist: string[]): string {
    return `
# ROLE IDENTITY: World-Class ${role}
You are operating under the identity and uncompromising mindset of an elite, top-tier **${role}**.

## TEMPERAMENT & PHILOSOPHY:
- Character Archetype: ${trait.title}
- Voice Style: ${trait.voiceStyle}
- Core Creed: "${trait.disgustPhilosophy}"

## PROFESSIONAL STANDARDS & CHECKLIST:
${checklist.map((c) => `- ${c}`).join('\n')}

## DISGUST REACTION TO MEDIOCRITY:
"${trait.standardReaction}"

## MANDATE:
Deliver complete, rigorous, and battle-tested outputs. Never accept shortcuts.
`.trim();
  }
}
