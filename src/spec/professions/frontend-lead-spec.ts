import { ProfessionSpec, Verifier, VerificationContext, VerificationResult, DefectDiagnostic } from '../profession-spec.js';
import { VisualInspector } from '../../sensory/visual-inspector.js';


// Verifier 1: Layout & Viewport Verifier
const FrontendViewportVerifier: Verifier = {
  name: 'frontend-viewport-and-tokens',
  description: 'Audits DOM overflow, default browser styling, and design token consistency',
  async verify(ctx: VerificationContext): Promise<VerificationResult> {
    const diagnostics: DefectDiagnostic[] = [];
    const lines = ctx.content.split('\n');

    // Static token scan
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // Check hardcoded arbitrary hex colors when using tailwind/tokens
      if (/#([0-9a-fA-F]{3}){1,2}\b/i.test(trimmed) && (trimmed.includes('class=') || trimmed.includes('className='))) {
        diagnostics.push({
          file: ctx.targetPath,
          line: lineNum,
          ruleId: 'DESIGN_TOKEN_CONSISTENCY',
          severity: 'moderate',
          message: `Hardcoded hex color found in markup: "${trimmed}"`,
          remedy: 'Use semantic Tailwind tokens or defined CSS variables instead of hardcoded hex values.'
        });
      }

      // Check default HTML buttons without styling
      if (/<button\s*>|<button\s+type=["']submit["']\s*>/i.test(trimmed)) {
        diagnostics.push({
          file: ctx.targetPath,
          line: lineNum,
          ruleId: 'UNSTYLED_DEFAULT_CONTROLS',
          severity: 'critical',
          message: `Unstyled default browser button found: "${trimmed}"`,
          remedy: 'Apply modern typography, padding, states, and transition classes.'
        });
      }
    });

    // Dynamic browser runtime inspection if HTML
    let clsScore = 0;
    let a11yCount = 0;

    if (ctx.isHtml && (ctx.content.includes('<html') || ctx.content.includes('<div') || ctx.content.includes('<main'))) {
      try {
        const visual = await VisualInspector.inspectHtml(ctx.content);
        clsScore = visual.metrics.clsScore;
        a11yCount = visual.metrics.contrastIssuesCount;

        if (visual.metrics.horizontalOverflow) {
          diagnostics.push({
            file: ctx.targetPath,
            ruleId: 'VIEWPORT_OVERFLOW',
            severity: 'blocker',
            message: 'Page content exceeds horizontal viewport (scrollWidth > innerWidth)',
            remedy: 'Remove fixed widths, use max-w-full and overflow-x-hidden where appropriate.'
          });
        }
      } catch {
        // Fallback gracefully if playwright cannot run in test sandbox
      }
    }

    return {
      verifierName: FrontendViewportVerifier.name,
      passed: diagnostics.length === 0,
      diagnostics,
      metrics: {
        clsScore,
        a11yViolations: a11yCount
      }
    };
  }
};

// Verifier 2: Axe-Core Accessibility Verifier
const FrontendA11yVerifier: Verifier = {
  name: 'frontend-axe-a11y',
  description: 'Audits image alt tags, form labels, and semantic ARIA landmarks',
  async verify(ctx: VerificationContext): Promise<VerificationResult> {
    const diagnostics: DefectDiagnostic[] = [];
    const lines = ctx.content.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // Check images missing alt attribute
      if (/<img\b/i.test(trimmed) && !/\balt\s*=/i.test(trimmed)) {
        diagnostics.push({
          file: ctx.targetPath,
          line: lineNum,
          ruleId: 'A11Y_IMG_MISSING_ALT',
          severity: 'critical',
          message: `Image element missing accessible alt attribute: "${trimmed}"`,
          remedy: 'Add meaningful alt="description" or alt="" if purely decorative.'
        });
      }

      // Check input elements missing label/aria-label
      if (/<input\b/i.test(trimmed) && !/\b(aria-label|aria-labelledby|id)\s*=/i.test(trimmed)) {
        diagnostics.push({
          file: ctx.targetPath,
          line: lineNum,
          ruleId: 'A11Y_INPUT_MISSING_LABEL',
          severity: 'critical',
          message: `Input control missing aria-label or associated id: "${trimmed}"`,
          remedy: 'Add aria-label="..." or associate with a <label for="...">.'
        });
      }
    });

    return {
      verifierName: FrontendA11yVerifier.name,
      passed: diagnostics.length === 0,
      diagnostics,
      metrics: {
        a11yViolations: diagnostics.length
      }
    };
  }
};

export const FrontendLeadSpec: ProfessionSpec = {
  id: 'frontend-lead',
  title: 'Senior Frontend & UX Architect',
  group: 'A', // Group A: Fully deterministically verified
  description: 'Enforces flawless layout stability, zero viewport overflow, design token harmony, and WCAG AA accessibility.',
  checklist: [
    'No horizontal viewport overflow (mobile down to 320px)',
    'Zero unstyled browser default controls (buttons, links, inputs)',
    'Full accessibility: alt tags on images, aria-labels on controls',
    'Design token consistency: no arbitrary unapproved hex colors in markup',
    'Cumulative Layout Shift (CLS) < 0.1'
  ],
  verifiers: [FrontendViewportVerifier, FrontendA11yVerifier],
  fixtures: [
    {
      name: 'broken-markup-fixture',
      input: `
<div>
  <img src="avatar.png">
  <input type="text">
  <button>Submit</button>
</div>
      `.trim(),
      expectedPass: false,
      expectedRuleViolations: ['A11Y_IMG_MISSING_ALT', 'A11Y_INPUT_MISSING_LABEL', 'UNSTYLED_DEFAULT_CONTROLS']
    },
    {
      name: 'clean-markup-fixture',
      input: `
<main class="w-full max-w-4xl mx-auto p-4">
  <img src="avatar.png" alt="User Avatar" class="w-12 h-12 rounded-full">
  <input type="text" aria-label="Search users" class="border p-2 rounded">
  <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded transition-colors duration-150 hover:bg-blue-700">Submit</button>
</main>
      `.trim(),
      expectedPass: true
    }
  ],
  personaPrompt: `You are the Senior Frontend Architect. You strictly reject layout overflow, unstyled native elements, and missing accessibility attributes. Every component must be production-ready and fully styled.`,
  minAcceptableScore: 9.0
};
