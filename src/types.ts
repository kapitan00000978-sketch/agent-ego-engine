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

export type DisgustLevel = 
  | 'none' 
  | 'condescending_smirk'   // 9.0 - 9.4 (Great, but points out subtle nuances)
  | 'mildly_annoyed'        // 8.0 - 8.9 (Sub-standard, amateurish)
  | 'furious'               // 6.0 - 7.9 (Rage against carelessness, architectural violations)
  | 'unacceptable_garbage'; // < 6.0 (Pure slop, placeholders, security sins)

export interface SlopDnaMetric {
  name: string;
  category: 'placeholder_slop' | 'type_evasion' | 'shallow_error_handling' | 'boring_layout' | 'security_sin' | 'marketing_bullshit';
  scoreImpact: number;
  detectedCount: number;
  snippets: string[];
  verdict: string;
}

export interface SlopDnaReport {
  overallSlopPurity: number; // 0% (Pure Slop) to 100% (Pure Craftsmanship)
  metrics: SlopDnaMetric[];
  detectedPatterns: string[];
}

export interface CraftsmanshipSeal {
  certifiedBy: ArchetypeId;
  sealTitle: string;
  score: number;
  uncompromisingRationale: string;
  architecturalHighlights: string[];
  guaranteeTimestamp: string;
}

export interface DebateParticipant {
  archetype: ArchetypeDefinition;
  stance: 'advocate' | 'challenger' | 'realist' | 'absolutist';
  openingArgument: string;
  objections: string[];
  concessions: string[];
}

export interface CrossArchetypeDebateResult {
  topicOrCode: string;
  participants: DebateParticipant[];
  debateTranscript: Array<{
    speaker: string;
    avatar: string;
    statement: string;
    heatLevel: 'cold_logic' | 'fiery_clash' | 'grudging_respect' | 'consensus_achieved';
  }>;
  consensusScore: number;
  uncompromisingSynthesis: string;
  actionableDirectives: string[];
}

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
  slopDna?: SlopDnaReport;
  craftsmanshipSeal?: CraftsmanshipSeal;
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

