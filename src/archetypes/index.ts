import { ArchetypeId, ArchetypeDefinition } from '../types.js';
import { FrontendLeadArchetype } from './frontend-lead.js';
import { BackendArchitectArchetype } from './backend-architect.js';
import { SecurityOfficerArchetype } from './security-officer.js';
import { CodeReviewerArchetype } from './code-reviewer.js';
import { CopyEditorArchetype } from './copy-editor.js';

export const ALL_ARCHETYPES: Record<ArchetypeId, ArchetypeDefinition> = {
  'frontend-lead': FrontendLeadArchetype,
  'backend-architect': BackendArchitectArchetype,
  'security-officer': SecurityOfficerArchetype,
  'code-reviewer': CodeReviewerArchetype,
  'copy-editor': CopyEditorArchetype
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

  /**
   * Intelligently selects the best matching archetype based on prompt semantics
   */
  public static detectFromPrompt(prompt: string): ArchetypeDefinition {
    const lower = prompt.toLowerCase();
    
    // Security triggers
    if (/auth|jwt|password|security|sanitize|owasp|crypto|permission|vulnerability|audit|token/i.test(lower)) {
      return SecurityOfficerArchetype;
    }

    // Frontend / UI triggers
    if (/frontend|ui|ux|css|tailwind|html|react|vue|web|page|design|animation|motion|button|card|portfolio/i.test(lower)) {
      return FrontendLeadArchetype;
    }

    // Backend / DB triggers
    if (/backend|database|sql|postgres|mysql|sqlite|api|endpoint|server|microservice|kafka|redis|schema/i.test(lower)) {
      return BackendArchitectArchetype;
    }

    // Writing / Copy triggers
    if (/article|essay|copy|text|blog|pitch|readme|documentation|post|write/i.test(lower)) {
      return CopyEditorArchetype;
    }

    // Default to strict code reviewer
    return CodeReviewerArchetype;
  }
}
