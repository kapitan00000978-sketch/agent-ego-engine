import { DefectItem, DisgustLevel, ArchetypeDefinition } from '../types.js';

export class DisgustCalculator {
  public static calculate(
    defects: DefectItem[],
    archetype: ArchetypeDefinition
  ): { score: number; passed: boolean; disgustLevel: DisgustLevel } {
    let score = 10.0;

    for (const defect of defects) {
      if (defect.severity === 'blocker') {
        score -= 2.5;
      } else if (defect.severity === 'critical') {
        score -= 1.5;
      } else if (defect.severity === 'moderate') {
        score -= 0.5;
      }
    }

    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
    const passed = score >= archetype.minAcceptableScore;

    let disgustLevel: DisgustLevel = 'none';
    if (score < 4.0) {
      disgustLevel = 'unacceptable_garbage';
    } else if (score < 7.0) {
      disgustLevel = 'furious';
    } else if (score < archetype.minAcceptableScore) {
      disgustLevel = 'mildly_annoyed';
    }

    return {
      score,
      passed,
      disgustLevel
    };
  }
}
