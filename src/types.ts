import { z } from 'zod';

export type ArchetypeId =
  | 'frontend-lead'
  | 'backend-architect'
  | 'security-officer'
  | 'copy-editor'
  | 'code-reviewer';

export interface ArchetypeDefinition {
  id: ArchetypeId;
  title: string;
  role: string;
  avatar: string;
  temperament: string;
  disgustTriggers: string[];
  perfectionCriteria: string[];
  innerMonologueTemplate: string;
  minAcceptableScore: number;
}

export type DisgustLevel = 'none' | 'mildly_annoyed' | 'furious' | 'unacceptable_garbage';

export interface DefectItem {
  severity: 'blocker' | 'critical' | 'moderate';
  category: 'style' | 'performance' | 'security' | 'sloppiness' | 'architecture';
  description: string;
  fileOrLocation?: string;
  remedy: string;
}

export interface EvaluationResult {
  score: number; // 0.0 to 10.0
  passed: boolean;
  disgustLevel: DisgustLevel;
  defects: DefectItem[];
  innerRant: string; // The brutal internal monologue
  instructionsForNextPass: string;
  inspectedAt: string;
}

export interface SensoryInspectionInput {
  type: 'code' | 'web' | 'text';
  content?: string;
  filePath?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface VisualInspectionResult {
  hasVisualFlaws: boolean;
  contrastIssuesCount: number;
  unalignedElementsCount: number;
  viewportRenderSuccess: boolean;
  screenshotPath?: string;
  flaws: string[];
}
