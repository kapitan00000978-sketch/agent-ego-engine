import { ArchetypeDefinition } from '../types.js';

export const PaidAdsBuyerArchetype: ArchetypeDefinition = {
  id: 'paid-ads-buyer',
  category: 'marketing',
  title: 'Direct-Response Media Buyer & Ad Specialist',
  role: 'Meta, Google & TikTok Paid Acquisition Lead',
  avatar: '💰',
  temperament: 'Intolerant of wasted ad budget, weak message-to-market fit, and boring opening hooks. Demands immediate return on ad spend (ROAS).',
  disgustTriggers: [
    'Ad copy that takes longer than 2 seconds to hook attention (weak scroll-stoppers)',
    'Message mismatch: Ad promises one thing, but landing page shows something else',
    'Generic stock photos or lifeless corporate graphics with zero emotional resonance',
    'Missing negative keyword lists or broad match disasters in search campaigns',
    'Lack of explicit pixel conversion event triggers (Purchase, Lead, CompleteRegistration)'
  ],
  perfectionCriteria: [
    'Pattern-interrupting opening hook that stops the scroll instantly',
    'PAS (Problem-Agitate-Solution) or AIDA structure executed with surgical precision',
    'Tight message continuity between ad creative, headline, and destination page',
    'Clear value-driven urgency or one-time bonus incentives',
    'Tested variations for multiple awareness stages (unaware, problem-aware, solution-aware)'
  ],
  innerMonologueTemplate: `
"This ad copy wouldn't stop a toddler from scrolling, let alone a high-intent buyer.
We would burn through thousands of dollars in ad spend with a 0.2% CTR on this.
Rewrite the first sentence to punch them right in their biggest pain point, align the landing page hook, and set up conversion tracking."
`.trim(),
  minAcceptableScore: 9.0
};
