import { DefectItem, ArchetypeDefinition } from '../types.js';
import { SlopDnaScanner } from './slop-dna-scanner.js';

export class CodeInspector {
  public static inspect(code: string, fileName = 'input', archetype?: ArchetypeDefinition): DefectItem[] {
    const defects: DefectItem[] = [];

    // 1. Run Slop DNA Scan
    const { extractedDefects } = SlopDnaScanner.scan(code, fileName);
    defects.push(...extractedDefects);

    // 2. Stray Console Logs in production
    const lines = code.split('\n');
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (/console\.log\s*\(/i.test(trimmed) && !trimmed.startsWith('//')) {
        defects.push({
          severity: 'moderate',
          category: 'sloppiness',
          description: `Stray console.log statement found: "${trimmed}"`,
          fileOrLocation: `${fileName}:${lineNum}`,
          remedy: 'Remove debug logging or replace with structured production logger.'
        });
      }
    });

    // 3. Landing Page / Marketing Checks for HTML / JSX
    if (fileName.endsWith('.html') || fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
      if (!/<button|<a\b[^>]*class=["'][^"']*btn/i.test(code)) {
        defects.push({
          severity: 'blocker',
          category: 'conversion',
          description: 'No Call-To-Action (CTA) button found in web component',
          fileOrLocation: fileName,
          remedy: 'Add prominent primary Call To Action button above the fold.'
        });
      }
    }

    // Deduplicate defects by description + fileOrLocation
    const seen = new Set<string>();
    return defects.filter((d) => {
      const key = `${d.description}-${d.fileOrLocation}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

