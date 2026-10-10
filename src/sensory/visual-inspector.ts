import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { VisualInspectionResult, DefectItem } from '../types.js';

export class VisualInspector {
  public static async inspectHtml(
    htmlOrUrl: string,
    screenshotDir: string = './screenshots'
  ): Promise<{ result: VisualInspectionResult; defects: DefectItem[] }> {
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

      if (htmlOrUrl.startsWith('http://') || htmlOrUrl.startsWith('https://') || htmlOrUrl.startsWith('file://')) {
        await page.goto(htmlOrUrl, { waitUntil: 'load', timeout: 15000 });
      } else {
        await page.setContent(htmlOrUrl, { waitUntil: 'load' });
      }

      // 1. Take snapshot
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // 2. DOM Evaluation for Design Defects
      const analysis = await page.evaluate(() => {
        const issues: string[] = [];
        
        // A. Horizontal body overflow check
        if (document.documentElement.scrollWidth > window.innerWidth) {
          issues.push('Horizontal overflow detected: page spills out of viewport bounds.');
        }

        // B. Check buttons for transition / micro-interaction
        const buttons = Array.from(document.querySelectorAll('button, a.btn, [role="button"]'));
        let missingTransitions = 0;
        buttons.forEach((btn) => {
          const style = window.getComputedStyle(btn);
          if (style.transitionDuration === '0s' || style.transitionProperty === 'none') {
            missingTransitions++;
          }
        });
        if (missingTransitions > 0) {
          issues.push(`${missingTransitions} interactive button(s) lack fluid CSS transitions/micro-interactions.`);
        }

        // C. Check for default Times New Roman / unstyled serif fonts
        const bodyStyle = window.getComputedStyle(document.body);
        if (/times new roman/i.test(bodyStyle.fontFamily)) {
          issues.push('Unstyled default browser font (Times New Roman) detected. Missing modern typography.');
        }

        // D. Check for generic unstyled blue links
        const links = Array.from(document.querySelectorAll('a'));
        const uglyLinks = links.filter((l) => {
          const style = window.getComputedStyle(l);
          return style.color === 'rgb(0, 0, 238)' && style.textDecorationLine === 'underline';
        });
        if (uglyLinks.length > 0) {
          issues.push(`${uglyLinks.length} unstyled browser-default blue link(s) detected.`);
        }

        return {
          issues,
          buttonCount: buttons.length
        };
      });

      analysis.issues.forEach((issue) => {
        flaws.push(issue);
        defects.push({
          severity: 'critical',
          category: 'style',
          description: `Visual flaw detected: ${issue}`,
          remedy: 'Apply modern typography, smooth transitions (ease-in-out), and prevent container overflow.'
        });
      });

      return {
        result: {
          hasVisualFlaws: flaws.length > 0,
          contrastIssuesCount: 0,
          unalignedElementsCount: flaws.length,
          viewportRenderSuccess: true,
          screenshotPath,
          flaws
        },
        defects
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      defects.push({
        severity: 'blocker',
        category: 'architecture',
        description: `Visual inspection failed to render: ${msg}`,
        remedy: 'Ensure valid HTML and that headless browser dependencies are present.'
      });

      return {
        result: {
          hasVisualFlaws: true,
          contrastIssuesCount: 0,
          unalignedElementsCount: 1,
          viewportRenderSuccess: false,
          flaws: [msg]
        },
        defects
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
