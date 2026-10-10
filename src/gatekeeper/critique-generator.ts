import { DefectItem, ArchetypeDefinition, DisgustLevel } from '../types.js';

export class CritiqueGenerator {
  public static generateInternalRant(
    archetype: ArchetypeDefinition,
    defects: DefectItem[],
    disgustLevel: DisgustLevel,
    score: number
  ): { innerRant: string; instructionsForNextPass: string } {
    if (defects.length === 0 && score >= archetype.minAcceptableScore) {
      return {
        innerRant: `[${archetype.avatar} ${archetype.title} - Approval]: Outstanding. The work is robust, aesthetic, and passes all perfection criteria with a flawless score of ${score}/10. Approved for release to the user.`,
        instructionsForNextPass: 'None. Code is ready.'
      };
    }

    const defectLines = defects
      .map((d, i) => `${i + 1}. [${d.severity.toUpperCase()}] ${d.description} -> Fix: ${d.remedy}`)
      .join('\n');

    let emotionPrefix = '';
    switch (disgustLevel) {
      case 'unacceptable_garbage':
        emotionPrefix = `🚨 [ABSOLUTE DISGUST - Score: ${score}/10]: This is an utter disaster. How dare anyone call this engineering? This violates every standard I stand for.`;
        break;
      case 'furious':
        emotionPrefix = `⚠️ [FURIOUS REJECTION - Score: ${score}/10]: Unacceptable sloppiness. Do not let the user see this embarrassment. I am ashamed that this was produced.`;
        break;
      case 'mildly_annoyed':
        emotionPrefix = `✋ [REJECTED FOR REVISION - Score: ${score}/10]: Almost there, but not good enough. My standard is ${archetype.minAcceptableScore}/10, and this falls short.`;
        break;
      default:
        emotionPrefix = `[REVISION NEEDED - Score: ${score}/10]`;
    }

    const innerRant = `
${emotionPrefix}

${archetype.innerMonologueTemplate}

CRITICAL FLAWS DETECTED:
${defectLines}
`.trim();

    const instructionsForNextPass = `
MANDATORY FIX DIRECTIVES BEFORE PRESENTING TO USER:
${defects.map((d, i) => `${i + 1}. Resolve "${d.description}": ${d.remedy}`).join('\n')}
`.trim();

    return {
      innerRant,
      instructionsForNextPass
    };
  }
}
