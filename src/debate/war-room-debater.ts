import { ArchetypeDefinition, CrossArchetypeDebateResult, DebateParticipant } from '../types.js';
import { ArchetypeRegistry } from '../archetypes/index.js';

export class WarRoomDebater {
  /**
   * Conduct a high-stakes psychological war-room debate between clashing archetypes.
   */
  public static debate(topicOrGoal: string, forceArchetypes?: string[]): CrossArchetypeDebateResult {
    // Select opposing viewpoints
    let archetypesToEngage: ArchetypeDefinition[] = [];

    if (forceArchetypes && forceArchetypes.length >= 2) {
      archetypesToEngage = forceArchetypes.map((id) => ArchetypeRegistry.get(id as any));
    } else {
      // Intelligently assemble a classic tri-force of tension:
      // 1. Engineering / Aesthetics (Frontend Lead or Backend Architect)
      // 2. Pragmatism & Commercial Growth (Startup Founder or Growth Marketer)
      // 3. Absolute Security & Governance (Security Officer or SRE)
      archetypesToEngage = [
        ArchetypeRegistry.get('startup-founder'),
        ArchetypeRegistry.get('security-officer'),
        ArchetypeRegistry.get('frontend-lead')
      ];
    }

    const participants: DebateParticipant[] = archetypesToEngage.map((arch, idx) => {
      let stance: 'advocate' | 'challenger' | 'realist' | 'absolutist' = 'realist';
      if (arch.category === 'business' || arch.category === 'marketing') stance = 'advocate';
      else if (arch.id === 'security-officer' || arch.id === 'dba-optimizer') stance = 'absolutist';
      else stance = 'challenger';

      return {
        archetype: arch,
        stance,
        openingArgument: WarRoomDebater.generateOpening(arch, topicOrGoal),
        objections: WarRoomDebater.generateObjections(arch, topicOrGoal),
        concessions: WarRoomDebater.generateConcessions(arch)
      };
    });

    // Conduct dynamic clash rounds
    const transcript: CrossArchetypeDebateResult['debateTranscript'] = [];

    // Round 1: Opening Salvo
    participants.forEach((p) => {
      transcript.push({
        speaker: p.archetype.title,
        avatar: p.archetype.avatar,
        statement: p.openingArgument,
        heatLevel: 'fiery_clash'
      });
    });

    // Round 2: Clash & Direct Cross-Examination
    transcript.push({
      speaker: participants[1].archetype.title,
      avatar: participants[1].archetype.avatar,
      statement: `Hold on! ${participants[0].archetype.title}'s approach is reckless. In our rush to deliver on "${topicOrGoal}", you are inviting catastrophic technical debt, loose boundaries, and compliance violations. I will veto any merge that compromises security invariants!`,
      heatLevel: 'fiery_clash'
    });

    transcript.push({
      speaker: participants[0].archetype.title,
      avatar: participants[0].archetype.avatar,
      statement: `If we lock down everything behind 15 layers of theoretical paranoia and take 3 months, the product is DEAD in the water. We need execution velocity and customer value now! But fine, give me zero-trust defaults that don't block development velocity.`,
      heatLevel: 'cold_logic'
    });

    if (participants[2]) {
      transcript.push({
        speaker: participants[2].archetype.title,
        avatar: participants[2].archetype.avatar,
        statement: `Both of you are ignoring the human on the other side of the glass. If the interface is clunky, sluggish, or looks like enterprise legacy software, nobody will care how secure your database is. We demand fluid 60fps UX, instant tactile feedback, and obsessive typographic hierarchy!`,
        heatLevel: 'fiery_clash'
      });
    }

    // Round 3: Uncompromising Synthesis & Consensus
    transcript.push({
      speaker: 'War-Room Consensus Engine',
      avatar: '⚖️',
      statement: `After ruthless cross-examination, all parties align on the Golden Standard: Rapid delivery with zero compromise on cryptographic boundaries and Awwwards-grade aesthetic polish. No stubs, no security shortcuts, no boring layouts.`,
      heatLevel: 'consensus_achieved'
    });

    const actionableDirectives = [
      `[Security Invariant]: Enforce strict boundary validation (Zod/schema) on all inputs; zero hardcoded secrets or raw queries.`,
      `[Velocity & Business]: Ship an ultra-lean, fully working core feature with immediate feedback loops, eliminating all scope bloat.`,
      `[Aesthetic & Experience]: Implement silky responsive layout with fluid transitions and complete absence of generic placeholders.`
    ];

    const synthesis = `The War-Room rejects all half-baked compromises. The team aligns behind a 9.5/10 execution plan: Security guarantees are baked in at compile time, UI aesthetics are elevated to top-tier craftsmanship, and business logic is razor-focused on user value.`;

    return {
      topicOrCode: topicOrGoal,
      participants,
      debateTranscript: transcript,
      consensusScore: 9.6,
      uncompromisingSynthesis: synthesis,
      actionableDirectives
    };
  }

  private static generateOpening(arch: ArchetypeDefinition, topic: string): string {
    switch (arch.id) {
      case 'startup-founder':
        return `"We don't have infinite time or budget. For '${topic}', we must deliver undeniable user value with extreme capital efficiency and zero slop."`;
      case 'security-officer':
        return `"Security is non-negotiable. Before anyone writes a single line for '${topic}', every attack surface, token flow, and data perimeter must be defended."`;
      case 'frontend-lead':
        return `"If the UI looks generic, amateurish, or lacks smooth tactile motion, the user will leave in seconds. Craftsmanship must be visible in every pixel."`;
      case 'backend-architect':
        return `"Clean Architecture, idempotent operations, and strict domain boundaries are required. No spaghetti logic or direct coupling to external SDKs."`;
      case 'growth-marketer':
        return `"Every screen and feature in '${topic}' must have a clear value hook, sharp conversion psychology, and measurable analytics tracking."`;
      default:
        return `"We must execute '${topic}' with zero tolerance for sloppy implementation and absolute adherence to domain perfection."`;
    }
  }

  private static generateObjections(arch: ArchetypeDefinition, topic: string): string[] {
    return arch.disgustTriggers.slice(0, 3).map((trigger) => `Unacceptable risk: ${trigger}`);
  }

  private static generateConcessions(arch: ArchetypeDefinition): string[] {
    return [
      `Will accept rapid iteration provided minimum score never drops below ${arch.minAcceptableScore}/10.`,
      `Demands automated verification before release.`
    ];
  }
}
