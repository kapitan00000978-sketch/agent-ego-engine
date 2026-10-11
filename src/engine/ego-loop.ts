import { ArchetypeDefinition, EvaluationResult, DefectItem } from '../types.js';
import { CodeInspector } from '../sensory/code-inspector.js';
import { SlopDnaScanner } from '../sensory/slop-dna-scanner.js';
import { VisualInspector } from '../sensory/visual-inspector.js';
import { DisgustCalculator } from '../gatekeeper/disgust-calculator.js';
import { CritiqueGenerator } from '../gatekeeper/critique-generator.js';
import { LessonsMemory } from '../memory/lessons-memory.js';
import { CraftsmanshipCertifier } from '../certifier/craftsmanship-certifier.js';

export interface EgoEvaluateOptions {
  content: string;
  archetype: ArchetypeDefinition;
  isHtml?: boolean;
  runVisualCheck?: boolean;
  fileName?: string;
}

export class EgoLoopEngine {
  public static async evaluate(options: EgoEvaluateOptions): Promise<EvaluationResult> {
    const { content, archetype, isHtml = false, runVisualCheck = false, fileName = 'snippet' } = options;
    const allDefects: DefectItem[] = [];

    // 1. Deep Slop DNA Scan
    const { slopReport, extractedDefects: slopDefects } = SlopDnaScanner.scan(content, fileName);
    allDefects.push(...slopDefects);

    // 2. Code sensory audit (additional checks)
    const codeDefects = CodeInspector.inspect(content, fileName, archetype);
    allDefects.push(...codeDefects);

    // Deduplicate defects
    const seen = new Set<string>();
    const uniqueDefects = allDefects.filter((d) => {
      const key = `${d.description}-${d.fileOrLocation}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 3. Visual sensory audit (if HTML and requested)
    if (isHtml && runVisualCheck) {
      try {
        const visual = await VisualInspector.inspectHtml(content);
        uniqueDefects.push(...visual.defects);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        uniqueDefects.push({
          severity: 'moderate',
          category: 'style',
          description: `Visual inspection skipped due to error: ${msg}`,
          remedy: 'Verify HTML syntax and local rendering environment.'
        });
      }
    }

    // 4. Gatekeeper Score & Disgust calculation (incorporating Slop Purity)
    const calc = DisgustCalculator.calculate(uniqueDefects, archetype);

    // Commit mistakes into persistent Lessons Memory so the agent never repeats them
    if (uniqueDefects.length > 0) {
      uniqueDefects.forEach((d) => {
        LessonsMemory.recordMistake(archetype.id, d.category, d.description, d.remedy);
      });
    }

    // 5. Generate Internal Rant and Correction directives
    const critique = CritiqueGenerator.generateInternalRant(
      archetype,
      uniqueDefects,
      calc.disgustLevel,
      calc.score
    );

    // 6. If passed with high score (>= 9.0), issue Craftsmanship Seal
    const craftsmanshipSeal = calc.passed
      ? CraftsmanshipCertifier.certify(archetype, calc.score, fileName)
      : undefined;

    return {
      score: calc.score,
      passed: calc.passed,
      disgustLevel: calc.disgustLevel,
      defects: uniqueDefects,
      innerRant: critique.innerRant,
      instructionsForNextPass: critique.instructionsForNextPass,
      inspectedAt: new Date().toISOString(),
      slopDna: slopReport,
      craftsmanshipSeal
    };
  }
}

