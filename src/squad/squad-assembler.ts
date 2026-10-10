import { ArchetypeDefinition, ArchetypeId } from '../types.js';
import { ArchetypeRegistry } from '../archetypes/index.js';

export interface SquadMember {
  archetype: ArchetypeDefinition;
  responsibility: string;
  order: number;
}

export interface SquadPlan {
  squadName: string;
  objective: string;
  members: SquadMember[];
  executionPhases: {
    phase: string;
    leadMember: string;
    deliverable: string;
    acceptanceCriteria: string;
  }[];
}

export class SquadAssembler {
  /**
   * Intelligently assembles a specialized multi-persona squad for complex goals
   */
  public static assemble(goalDescription: string): SquadPlan {
    const lower = goalDescription.toLowerCase();

    // 1. Full-Stack SaaS / Startup Project
    if (/saas|startup|platform|web app|mvp|system|application/i.test(lower)) {
      return {
        squadName: 'Full-Stack SaaS Launch Squad',
        objective: goalDescription,
        members: [
          {
            archetype: ArchetypeRegistry.get('startup-founder'),
            responsibility: 'Unit economics, product defensibility, and ICP definition',
            order: 1
          },
          {
            archetype: ArchetypeRegistry.get('growth-marketer'),
            responsibility: 'Hero value proposition, conversion funnels, and primary CTA strategy',
            order: 2
          },
          {
            archetype: ArchetypeRegistry.get('frontend-lead'),
            responsibility: 'Awwwards-level UI architecture, fluid animations, and mobile responsiveness',
            order: 3
          },
          {
            archetype: ArchetypeRegistry.get('backend-architect'),
            responsibility: 'Clean Architecture, typed API contracts, and database schema',
            order: 4
          },
          {
            archetype: ArchetypeRegistry.get('security-officer'),
            responsibility: 'Authentication, input sanitization, and OWASP defense audit',
            order: 5
          }
        ],
        executionPhases: [
          {
            phase: 'Phase 1: Product Strategy & Unit Economics',
            leadMember: 'Startup Founder',
            deliverable: 'Core customer problem statement, pricing tiers, and 60-second Aha-moment map',
            acceptanceCriteria: 'Unambiguous monetization and defensible moat verified'
          },
          {
            phase: 'Phase 2: Growth Messaging & Offer Crafting',
            leadMember: 'Growth Marketer',
            deliverable: 'Hero headline, social proof anchors, and 1-click CTA flow',
            acceptanceCriteria: '5-second test passed with zero vague corporate buzzwords'
          },
          {
            phase: 'Phase 3: Frontend Craft & Motion Design',
            leadMember: 'Frontend Lead',
            deliverable: 'Production UI code with smooth micro-interactions and clean Tailwind',
            acceptanceCriteria: 'Playwright visual audit score >= 9.0/10 with zero horizontal overflow'
          },
          {
            phase: 'Phase 4: Backend Architecture & Security Lock',
            leadMember: 'Security Officer & Backend Architect',
            deliverable: 'Zod-validated API endpoints with zero exposed keys and parameterized queries',
            acceptanceCriteria: 'Zero OWASP vulnerabilities and 100% typed domain entities'
          }
        ]
      };
    }

    // 2. High-Converting Marketing & Paid Traffic Campaign
    if (/marketing|campaign|ads|traffic|leads|sales funnel|conversion|launch/i.test(lower)) {
      return {
        squadName: 'High-Velocity Growth & Conversion Squad',
        objective: goalDescription,
        members: [
          {
            archetype: ArchetypeRegistry.get('growth-marketer'),
            responsibility: 'Offer positioning, irresistible value proposition, and lead capture',
            order: 1
          },
          {
            archetype: ArchetypeRegistry.get('cro-specialist'),
            responsibility: 'Frictionless checkout paths and visual eye-tracking hierarchy',
            order: 2
          },
          {
            archetype: ArchetypeRegistry.get('paid-ads-buyer'),
            responsibility: 'Scroll-stopping ad hooks and message continuity',
            order: 3
          },
          {
            archetype: ArchetypeRegistry.get('copy-editor'),
            responsibility: 'Deleting AI clichés and ensuring authentic human voice',
            order: 4
          }
        ],
        executionPhases: [
          {
            phase: 'Phase 1: Offer & Value Positioning',
            leadMember: 'Growth Marketer',
            deliverable: 'Core hook, customer pain-point agitations, and primary CTA',
            acceptanceCriteria: 'Clear risk-reversal guarantee present'
          },
          {
            phase: 'Phase 2: Funnel Optimization & CRO Polish',
            leadMember: 'CRO Specialist',
            deliverable: 'Zero-friction checkout page with high-contrast buttons',
            acceptanceCriteria: 'Single dominant action per viewport scroll'
          },
          {
            phase: 'Phase 3: Editorial Fluff Cleanse',
            leadMember: 'Copy Editor',
            deliverable: 'Ruthlessly punchy active copy with zero AI cliches',
            acceptanceCriteria: 'Hemingway readability index and authentic human tone'
          }
        ]
      };
    }

    // 3. Default Engineering Perfection Squad
    return {
      squadName: 'Elite Engineering Quality Squad',
      objective: goalDescription,
      members: [
        {
          archetype: ArchetypeRegistry.get('code-reviewer'),
          responsibility: 'Clean code, SOLID principles, and zero stubs',
          order: 1
        },
        {
          archetype: ArchetypeRegistry.get('security-officer'),
          responsibility: 'OWASP vulnerability scanning and secret sanitation',
          order: 2
        },
        {
          archetype: ArchetypeRegistry.get('sre-devops'),
          responsibility: 'Containerization, health probes, and runtime reliability',
          order: 3
        }
      ],
      executionPhases: [
        {
          phase: 'Phase 1: Implementation & Type Hardening',
          leadMember: 'Code Reviewer',
          deliverable: 'Robust, fully realized code with zero any types and complete unit tests',
          acceptanceCriteria: 'Strict compiler verification passed'
        },
        {
          phase: 'Phase 2: Security & Reliability Audit',
          leadMember: 'Security Officer',
          deliverable: 'Sanitized configurations and least-privilege runtime security',
          acceptanceCriteria: 'Audit score >= 9.2/10'
        }
      ]
    };
  }
}
