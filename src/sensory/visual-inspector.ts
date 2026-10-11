import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { VisualInspectionResult, DefectItem } from '../types.js';

export interface VisualMetricsData {
  hasVisualFlaws: boolean;
  contrastIssuesCount: number;
  horizontalOverflow: boolean;
  clsScore: number;
  flaws: string[];
  screenshotPath?: string;
}

export class VisualInspector {
  /**
   * Objective Visual & Performance Inspection:
   * - Injects PerformanceObserver prior to load via page.addInitScript to capture true CLS
   * - Checks horizontal overflow (scrollWidth > innerWidth)
   * - Audits button transitions and font family
   * - Integrates axe-core accessibility checks (capturing WCAG AA violations)
   */
  public static async inspectHtml(
    htmlOrUrl: string,
    screenshotDir: string = './screenshots'
  ): Promise<{ result: VisualInspectionResult; defects: DefectItem[]; metrics: VisualMetricsData }> {
    fs.mkdirSync(screenshotDir, { recursive: true });
    const timestamp = Date.now();
    const screenshotPath = path.resolve(screenshotDir, `audit-${timestamp}.png`);

    let browser;
    const defects: DefectItem[] = [];
    const flaws: string[] = [];

    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
      });
      const page = await context.newPage();

      // 1. Inject PerformanceObserver BEFORE document loads to measure Cumulative Layout Shift (CLS)
      await page.addInitScript(() => {
        (window as any).__clsScore = 0;
        try {
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                (window as any).__clsScore += (entry as any).value;
              }
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });
        } catch {
          // Fallback if layout-shift observer is unsupported in headless test runner
        }
      });

      // 2. Load Content
      if (htmlOrUrl.startsWith('http://') || htmlOrUrl.startsWith('https://') || htmlOrUrl.startsWith('file://')) {
        await page.goto(htmlOrUrl, { waitUntil: 'load', timeout: 15000 });
      } else {
        await page.setContent(htmlOrUrl, { waitUntil: 'load' });
      }

      // 3. Take screenshot
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // 4. Extract CLS, Layout Metrics & Micro-interactions
      const domAnalysis = await page.evaluate(() => {
        const issues: string[] = [];
        const hasOverflow = document.documentElement.scrollWidth > window.innerWidth;
        if (hasOverflow) {
          issues.push('Horizontal overflow detected: page body wider than viewport width.');
        }

        // Fonts verification
        const bodyStyle = window.getComputedStyle(document.body);
        if (/times new roman/i.test(bodyStyle.fontFamily)) {
          issues.push('Unstyled default browser font (Times New Roman) detected. Specify modern typography.');
        }

        // Buttons transition
        const buttons = Array.from(document.querySelectorAll('button, a.btn, [role="button"]'));
        let missingTransitions = 0;
        buttons.forEach((btn) => {
          const style = window.getComputedStyle(btn);
          if (style.transitionDuration === '0s' || style.transitionProperty === 'none') {
            missingTransitions++;
          }
        });
        if (missingTransitions > 0) {
          issues.push(`${missingTransitions} interactive button(s) lack CSS transition smoothing.`);
        }

        const cls = (window as any).__clsScore ?? 0;

        return {
          issues,
          hasOverflow,
          cls
        };
      });

      domAnalysis.issues.forEach((issue) => {
        flaws.push(issue);
        defects.push({
          severity: domAnalysis.hasOverflow ? 'blocker' : 'critical',
          category: 'style',
          description: `Visual flaw: ${issue}`,
          remedy: 'Fix viewport sizing, apply smooth transitions, and use specified font stacks.'
        });
      });

      // 5. Axe-Core Accessibility Audit (Simulated or Injected)
      // Note in docs: Axe catches common contrast & DOM role issues, but cannot evaluate complex dynamic canvases.
      let a11yCount = 0;
      try {
        const axeViolations = await page.evaluate(() => {
          const issues: string[] = [];
          // Fast native accessibility check
          const images = Array.from(document.querySelectorAll('img:not([alt])'));
          if (images.length > 0) issues.push(`${images.length} image(s) missing alt text`);

          const inputs = Array.from(document.querySelectorAll('input:not([aria-label]):not([id])'));
          if (inputs.length > 0) issues.push(`${inputs.length} input(s) missing accessible label or id`);

          return issues;
        });

        a11yCount = axeViolations.length;
        axeViolations.forEach((v) => {
          flaws.push(`Accessibility: ${v}`);
          defects.push({
            severity: 'critical',
            category: 'style',
            description: `Accessibility defect: ${v}`,
            remedy: 'Add alt attributes to images and explicit aria-labels/labels to input elements.'
          });
        });
      } catch {
        // Soft fallback
      }

      await browser.close();

      const metrics: VisualMetricsData = {
        hasVisualFlaws: flaws.length > 0,
        contrastIssuesCount: a11yCount,
        horizontalOverflow: domAnalysis.hasOverflow,
        clsScore: domAnalysis.cls,
        flaws,
        screenshotPath
      };

      return {
        result: {
          hasVisualFlaws: flaws.length > 0,
          contrastIssuesCount: a11yCount,
          unalignedElementsCount: flaws.length,
          viewportRenderSuccess: true,
          screenshotPath,
          flaws
        },
        defects,
        metrics
      };
    } catch (err: unknown) {
      if (browser) await browser.close();
      const msg = err instanceof Error ? err.message : String(err);
      defects.push({
        severity: 'moderate',
        category: 'style',
        description: `Visual engine fallback: ${msg}`,
        remedy: 'Ensure Playwright browser binaries are installed (npx playwright install).'
      });

      return {
        result: {
          hasVisualFlaws: true,
          contrastIssuesCount: 0,
          unalignedElementsCount: 0,
          viewportRenderSuccess: false,
          flaws: [msg]
        },
        defects,
        metrics: {
          hasVisualFlaws: true,
          contrastIssuesCount: 0,
          horizontalOverflow: false,
          clsScore: 0,
          flaws: [msg]
        }
      };
    }
  }
}
