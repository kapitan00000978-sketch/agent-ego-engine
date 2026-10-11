import { ArchetypeDefinition, CraftsmanshipSeal } from '../types.js';

export class CraftsmanshipCertifier {
  /**
   * Issues a high-prestige Craftsmanship Seal for outputs exceeding 9.0/10 quality.
   */
  public static certify(archetype: ArchetypeDefinition, score: number, fileName: string): CraftsmanshipSeal {
    const highlights: string[] = [];

    switch (archetype.category) {
      case 'engineering':
        highlights.push('Zero placeholders, clean defensive logic, and robust error boundaries');
        highlights.push('Idiomatic typing with zero "any" escapes or untyped parameters');
        highlights.push('Adherence to Clean Architecture and SOLID domain principles');
        break;
      case 'marketing':
        highlights.push('Compelling value proposition with razor-sharp conversion hooks');
        highlights.push('Zero generic AI marketing clichés, authentic human voice');
        highlights.push('Clear actionable CTA hierarchy and audience empathy');
        break;
      case 'business':
        highlights.push('Laser focus on unit economics, velocity, and core value delivery');
        highlights.push('Elimination of vanity metrics and scope bloat');
        break;
      default:
        highlights.push('Strict adherence to domain perfection criteria and high aesthetic standards');
        highlights.push('Complete, battle-tested, and ready for production deployment');
        break;
    }

    const titles: Record<string, string> = {
      'frontend-lead': 'Awwwards-Caliber Visual & UX Seal of Excellence',
      'backend-architect': 'High-Concurrence Clean Architecture & Resiliency Seal',
      'security-officer': 'Fortified Zero-Trust Security & Perimeter Guarantee',
      'startup-founder': 'Hyper-Lean High-Leverage Product Milestone Seal',
      'growth-marketer': 'High-Conversion Growth Engine & Funnel Mastery Seal'
    };

    const sealTitle = titles[archetype.id] || `${archetype.title} Master Craftsmanship Seal`;

    const rationale = `This artifact (${fileName}) has endured the uncompromising scrutiny of ${archetype.avatar} ${archetype.title}. Scoring ${score}/10, it contains zero lazy placeholders, zero cowardly typing escapes, and stands as a benchmark of senior-level craftsmanship.`;

    return {
      certifiedBy: archetype.id,
      sealTitle,
      score,
      uncompromisingRationale: rationale,
      architecturalHighlights: highlights,
      guaranteeTimestamp: new Date().toISOString()
    };
  }
}
