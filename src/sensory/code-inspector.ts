import { DefectItem } from '../types.js';

export class CodeInspector {
  public static inspect(code: string, fileName = 'input'): DefectItem[] {
    const defects: DefectItem[] = [];
    const lines = code.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // 1. Slop Placeholders
      if (/\/\/\s*(TODO|FIXME|IMPLEMENT|implement later|add more|placeholder|stub)/i.test(trimmed)) {
        defects.push({
          severity: 'blocker',
          category: 'sloppiness',
          description: `Lazy placeholder found: "${trimmed}"`,
          fileOrLocation: `${fileName}:${lineNum}`,
          remedy: 'Completely implement the function or logic; never leave stub comments.'
        });
      }

      // 2. Dangerous any casts
      if (/:\s*any\b|as\s+any\b|<any>/i.test(trimmed) && !trimmed.startsWith('//')) {
        defects.push({
          severity: 'critical',
          category: 'architecture',
          description: `Disgraceful use of "any" type: "${trimmed}"`,
          fileOrLocation: `${fileName}:${lineNum}`,
          remedy: 'Define explicit TypeScript interface, type union, or generic type parameter.'
        });
      }

      // 3. Hardcoded Secrets
      if (/(api_key|secret|token|password|auth_token)\s*=\s*['"][a-zA-Z0-9_\-]{8,}['"]/i.test(trimmed)) {
        defects.push({
          severity: 'blocker',
          category: 'security',
          description: `Exposed plain-text secret or key in source code`,
          fileOrLocation: `${fileName}:${lineNum}`,
          remedy: 'Extract secret to environment variable (process.env) and sanitize code.'
        });
      }

      // 4. Stray Console Logs in production
      if (/console\.log\s*\(/i.test(trimmed) && !trimmed.startsWith('//')) {
        defects.push({
          severity: 'moderate',
          category: 'sloppiness',
          description: `Stray console.log statement found: "${trimmed}"`,
          fileOrLocation: `${fileName}:${lineNum}`,
          remedy: 'Remove debug logging or replace with structured production logger.'
        });
      }

      // 5. Insecure SQL String Concatenation
      if (/(SELECT|INSERT|UPDATE|DELETE)\s+.*(\+|\$\{)/i.test(trimmed)) {
        defects.push({
          severity: 'blocker',
          category: 'security',
          description: `SQL Injection risk: string concatenation in query`,
          fileOrLocation: `${fileName}:${lineNum}`,
          remedy: 'Use parameterized queries ($1, ?), prepared statements, or ORM/query builder.'
        });
      }

      // 6. Empty catch blocks
      if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(trimmed)) {
        defects.push({
          severity: 'blocker',
          category: 'architecture',
          description: `Swallowed exception in empty catch block: "${trimmed}"`,
          fileOrLocation: `${fileName}:${lineNum}`,
          remedy: 'Handle exception explicitly, log with context, or re-throw typed domain error.'
        });
      }
    });

    return defects;
  }
}
