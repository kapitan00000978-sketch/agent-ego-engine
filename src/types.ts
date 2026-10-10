import { z } from 'zod';

export type ArchetypeCategory =
  | 'engineering'
  | 'marketing'
  | 'product'
  | 'data-ai'
  | 'creative'
  | 'business';

export type ArchetypeId =
  // Engineering & DevOps
  | 'frontend-lead'
  | 'backend-architect'
  | 'security-officer'
  | 'code-reviewer'
  | 'sre-devops'
  | 'dba-optimizer'
  // Online Marketing & Growth
  | 'growth-marketer'
  | 'seo-strategist'
  | 'cro-specialist'
  | 'paid-ads-buyer'
  | 'viral-creator'
  // Product & Business
  | 'product-manager'
  | 'startup-founder'
  // Data & Machine Learning
  | 'data-scientist'
  | 'ml-engineer'
  // Content & Creative
  | 'copy-editor'
  | 'brand-designer';

export interface ArchetypeDefinition {
  id: ArchetypeId;
  category: ArchetypeCategory;
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
  category: 'style' | 'performance' | 'security' | 'sloppiness' | 'architecture' | 'marketing' | 'conversion';
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
  type: 'code' | 'web' | 'text' | 'marketing' | 'data';
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
