import { ArchetypeId, ArchetypeDefinition, ArchetypeCategory } from '../types.js';
import { FrontendLeadArchetype } from './frontend-lead.js';
import { BackendArchitectArchetype } from './backend-architect.js';
import { SecurityOfficerArchetype } from './security-officer.js';
import { CodeReviewerArchetype } from './code-reviewer.js';
import { CopyEditorArchetype } from './copy-editor.js';
import { GrowthMarketerArchetype } from './growth-marketer.js';
import { CroSpecialistArchetype } from './cro-specialist.js';
import { SeoStrategistArchetype } from './seo-strategist.js';
import { PaidAdsBuyerArchetype } from './paid-ads-buyer.js';
import { ViralCreatorArchetype } from './viral-creator.js';
import { ProductManagerArchetype } from './product-manager.js';
import { StartupFounderArchetype } from './startup-founder.js';
import { DataScientistArchetype } from './data-scientist.js';
import { MlEngineerArchetype } from './ml-engineer.js';
import { SreDevopsArchetype } from './sre-devops.js';
import { DbaOptimizerArchetype } from './dba-optimizer.js';
import { BrandDesignerArchetype } from './brand-designer.js';

export const ALL_ARCHETYPES: Record<ArchetypeId, ArchetypeDefinition> = {
  // Engineering & DevOps
  'frontend-lead': FrontendLeadArchetype,
  'backend-architect': BackendArchitectArchetype,
  'security-officer': SecurityOfficerArchetype,
  'code-reviewer': CodeReviewerArchetype,
  'sre-devops': SreDevopsArchetype,
  'dba-optimizer': DbaOptimizerArchetype,
  // Online Marketing & Growth
  'growth-marketer': GrowthMarketerArchetype,
  'cro-specialist': CroSpecialistArchetype,
  'seo-strategist': SeoStrategistArchetype,
  'paid-ads-buyer': PaidAdsBuyerArchetype,
  'viral-creator': ViralCreatorArchetype,
  // Product & Business
  'product-manager': ProductManagerArchetype,
  'startup-founder': StartupFounderArchetype,
  // Data & Machine Learning
  'data-scientist': DataScientistArchetype,
  'ml-engineer': MlEngineerArchetype,
  // Content & Creative
  'copy-editor': CopyEditorArchetype,
  'brand-designer': BrandDesignerArchetype
};

export class ArchetypeRegistry {
  public static get(id: ArchetypeId): ArchetypeDefinition {
    const arch = ALL_ARCHETYPES[id];
    if (!arch) {
      throw new Error(`Unknown Archetype ID: ${id}`);
    }
    return arch;
  }

  public static list(): ArchetypeDefinition[] {
    return Object.values(ALL_ARCHETYPES);
  }

  public static listByCategory(category: ArchetypeCategory): ArchetypeDefinition[] {
    return Object.values(ALL_ARCHETYPES).filter((a) => a.category === category);
  }

  /**
   * Intelligently selects the best matching archetype based on prompt semantics across ALL industries
   */
  public static detectFromPrompt(prompt: string): ArchetypeDefinition {
    const lower = prompt.toLowerCase();

    // 1. Online Marketing & Growth Triggers
    if (/viral|hook|social media|twitter|tweet|threads|tiktok|reels/i.test(lower)) {
      return ViralCreatorArchetype;
    }
    if (/seo|google search|serp|sitemap|meta tag|opengraph|ranking|keyword/i.test(lower)) {
      return SeoStrategistArchetype;
    }
    if (/ad |ads|meta ad|facebook ad|google ad|roas|cpc|media buy|advertising|traffic campaign/i.test(lower)) {
      return PaidAdsBuyerArchetype;
    }
    if (/funnel|cro|conversion rate|bounce rate|checkout flow|lead capture|landing page conversion/i.test(lower)) {
      return CroSpecialistArchetype;
    }
    if (/marketing|growth|cmo|acquisition|landing page|sales copy|cta|lead magnet|customer acquisition/i.test(lower)) {
      return GrowthMarketerArchetype;
    }

    // 2. Product & Startup Business Triggers
    if (/pitch deck|investor|vc |venture|startup|business model|monetization|tam |cac |ltv/i.test(lower)) {
      return StartupFounderArchetype;
    }
    if (/prd|product manager|roadmap|user story|acceptance criteria|feature spec|aha moment/i.test(lower)) {
      return ProductManagerArchetype;
    }

    // 3. Data Science & AI Triggers
    if (/machine learning|mlops|llm pipeline|fine-tune|embedding|rag |prompt eval|hallucination/i.test(lower)) {
      return MlEngineerArchetype;
    }
    if (/data analysis|statistics|hypothesis test|p-value|analytics dashboard|metrics|cohort|bi /i.test(lower)) {
      return DataScientistArchetype;
    }

    // 4. DevOps, Cloud & SRE Triggers
    if (/docker|kubernetes|k8s|sre|terraform|ci\/cd|pipeline|github actions|deploy|cluster|uptime|prometheus/i.test(lower)) {
      return SreDevopsArchetype;
    }
    if (/dba|query optimization|explain analyze|composite index|table scan|postgres performance|database tuning/i.test(lower)) {
      return DbaOptimizerArchetype;
    }

    // 5. Security Triggers
    if (/auth|jwt|password|security|sanitize|owasp|crypto|permission|vulnerability|audit|token|ciso/i.test(lower)) {
      return SecurityOfficerArchetype;
    }

    // 6. Design & Brand Triggers
    if (/brand identity|logo|color palette|visual design|typography pairing|icon style|design system/i.test(lower)) {
      return BrandDesignerArchetype;
    }

    // 7. Frontend / UI Triggers
    if (/frontend|ui|ux|css|tailwind|html|react|vue|web|animation|motion|button|card|portfolio|awwwards/i.test(lower)) {
      return FrontendLeadArchetype;
    }

    // 8. Backend / API Triggers
    if (/backend|database|sql|postgres|mysql|sqlite|api|endpoint|server|microservice|kafka|redis|schema/i.test(lower)) {
      return BackendArchitectArchetype;
    }

    // 9. Writing / Editorial Triggers
    if (/article|essay|copy|text|blog|readme|documentation|post|editorial/i.test(lower)) {
      return CopyEditorArchetype;
    }

    // Default to clean code reviewer
    return CodeReviewerArchetype;
  }
}
