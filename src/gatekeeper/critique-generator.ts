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
        emotionPrefix = `🚨 [UNACCEPTABLE GARBAGE - RAGE STAGE 4 - Score: ${score}/10]:
"Who authorized this disgrace? This isn't engineering; this is an insulting joke.
Placeholders, security vulnerabilities, or toxic slop all over the place.
If you think for one microsecond I will let the user lay eyes on this dumpster fire, you're delusional.
Tear it down to the foundation immediately."`;
        break;
      case 'furious':
        emotionPrefix = `⚠️ [FURIOUS REJECTION - RAGE STAGE 3 - Score: ${score}/10]:
"I am personally offended by how lazy this solution is.
You took the path of least resistance, cut critical corners, and introduced sloppy architectural patterns.
Do not embarrass us in front of the user. Fix these violations before I lose my temper."`;
        break;
      case 'mildly_annoyed':
        emotionPrefix = `✋ [REJECTED FOR DEFECTS - RAGE STAGE 2 - Score: ${score}/10]:
"This is the definition of mediocre. It functions, but it lacks soul, polish, and defensive rigor.
My disgust threshold is strictly ${archetype.minAcceptableScore}/10. 
We do not deliver B-grade work to paying clients or users. Polish it to perfection."`;
        break;
      case 'condescending_smirk':
        emotionPrefix = `😏 [CONDESCENDING SMIRK - PASSING WITH NITS - Score: ${score}/10]:
"Acceptable, but barely. A junior dev might applaud this, but I see minor micro-imperfections.
I'll let it pass the gatekeeper, but don't get complacent. True mastery requires zero flaws."`;
        break;
      default:
        emotionPrefix = `[MASTER-CLASS CRAFTSMANSHIP - Score: ${score}/10]:
"Exceptional execution. Razor-sharp architecture, elegant composition, and zero compromise."`;
    }

    const innerRant = `
${emotionPrefix}

[${archetype.avatar} Persona Stance - ${archetype.title}]:
${archetype.innerMonologueTemplate}

CRITICAL DEFECTS BLOCKING RELEASE:
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

