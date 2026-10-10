import { ArchetypeDefinition, EvaluationResult, DefectItem } from '../types.js';
import { CodeInspector } from '../sensory/code-inspector.js';
import { VisualInspector } from '../sensory/visual-inspector.js';
import { DisgustCalculator } from '../gatekeeper/disgust-calculator.js';
import { CritiqueGenerator } from '../gatekeeper/critique-generator.js';

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

    // 1. Code sensory audit
    const codeDefects = CodeInspector.inspect(content, fileName, archetype);
    allDefects.push(...codeDefects);

    // 2. Visual sensory audit (if HTML and requested)
    if (isHtml && runVisualCheck) {
      try {
        const visual = await VisualInspector.inspectHtml(content);
        allDefects.push(...visual.defects);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        allDefects.push({
          severity: 'moderate',
          category: 'style',
          description: `Visual inspection skipped due to error: ${msg}`,
          remedy: 'Verify HTML syntax and local rendering environment.'
        });
      }
    }

    // 3. Gatekeeper Score & Disgust calculation
    const calc = DisgustCalculator.calculate(allDefects, archetype);

    // 4. Generate Internal Rant and Correction directives
    const critique = CritiqueGenerator.generateInternalRant(
      archetype,
      allDefects,
      calc.disgustLevel,
      calc.score
    );

    return {
      score: calc.score,
      passed: calc.passed,
      disgustLevel: calc.disgustLevel,
      defects: allDefects,
      innerRant: critique.innerRant,
      instructionsForNextPass: critique.instructionsForNextPass,
      inspectedAt: new Date().toISOString()
    };
  }
}
