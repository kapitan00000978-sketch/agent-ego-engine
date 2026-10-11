import { DefectItem, SlopDnaReport, SlopDnaMetric } from '../types.js';

export class SlopDnaScanner {
  public static scan(code: string, fileName = 'input'): { slopReport: SlopDnaReport; extractedDefects: DefectItem[] } {
    const metrics: SlopDnaMetric[] = [];
    const extractedDefects: DefectItem[] = [];
    const lines = code.split('\n');

    // 1. Placeholder & Stub Slop Detection
    const placeholderMatches: string[] = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (/\/\/\s*(TODO|FIXME|IMPLEMENT|implement later|add more|placeholder|stub|fill in)/i.test(trimmed)) {
        placeholderMatches.push(`${fileName}:${idx + 1} -> "${trimmed}"`);
        extractedDefects.push({
          severity: 'blocker',
          category: 'sloppiness',
          description: `Disgraceful lazy placeholder: "${trimmed}"`,
          fileOrLocation: `${fileName}:${idx + 1}`,
          remedy: 'Never leave stubs. Fully implement the function or remove the unused construct.'
        });
      }
    });

    if (placeholderMatches.length > 0) {
      metrics.push({
        name: 'Placeholder & Incomplete Stubs',
        category: 'placeholder_slop',
        scoreImpact: Math.min(4.0, placeholderMatches.length * 1.5),
        detectedCount: placeholderMatches.length,
        snippets: placeholderMatches.slice(0, 5),
        verdict: 'Rage-inducing sloppiness. AI models leaving // TODO comments instead of writing actual code.'
      });
    }

    // 2. Type Evasion (as any, : any, @ts-ignore)
    const typeEvasionMatches: string[] = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if ((/:\s*any\b|as\s+any\b|<any>|@ts-ignore|@ts-nocheck/i.test(trimmed)) && !trimmed.startsWith('//')) {
        typeEvasionMatches.push(`${fileName}:${idx + 1} -> "${trimmed}"`);
        extractedDefects.push({
          severity: 'critical',
          category: 'architecture',
          description: `Type evasion sin: "${trimmed}"`,
          fileOrLocation: `${fileName}:${idx + 1}`,
          remedy: 'Define strongly typed interfaces, discriminated unions, or strict generic bounds.'
        });
      }
    });

    if (typeEvasionMatches.length > 0) {
      metrics.push({
        name: 'Type Evasion & any Escapes',
        category: 'type_evasion',
        scoreImpact: Math.min(3.0, typeEvasionMatches.length * 1.0),
        detectedCount: typeEvasionMatches.length,
        snippets: typeEvasionMatches.slice(0, 5),
        verdict: 'Cowardly typing. Throwing "any" at the compiler instead of modeling data with integrity.'
      });
    }

    // 3. Shallow / Swallowed Error Handling
    const shallowErrorMatches: string[] = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (/catch\s*\([^)]*\)\s*\{\s*\}|catch\s*\([^)]*\)\s*\{\s*console\.(log|error)\([^)]*\);\s*\}/i.test(trimmed)) {
        shallowErrorMatches.push(`${fileName}:${idx + 1} -> "${trimmed}"`);
        extractedDefects.push({
          severity: 'blocker',
          category: 'architecture',
          description: `Swallowed or primitive catch block: "${trimmed}"`,
          fileOrLocation: `${fileName}:${idx + 1}`,
          remedy: 'Introduce structured error logging with domain error recovery, telemetry, or typed exceptions.'
        });
      }
    });

    if (shallowErrorMatches.length > 0) {
      metrics.push({
        name: 'Silent Exception Swallowing',
        category: 'shallow_error_handling',
        scoreImpact: Math.min(3.5, shallowErrorMatches.length * 1.5),
        detectedCount: shallowErrorMatches.length,
        snippets: shallowErrorMatches.slice(0, 5),
        verdict: 'Disastrous fragility. Hiding runtime failures under the rug like a junior intern.'
      });
    }

    // 4. AI Marketing Buzzword Slop
    const aiBuzzwords = [
      "in today's fast-paced world",
      "delve into the world of",
      "rich tapestry of",
      "stand as a testament to",
      "game-changing revolutionary solution",
      "revolutionize how you work",
      "all-in-one platform for all your needs",
      "seamlessly integrates into your workflow",
      "unleash the power of",
      "empowering modern businesses"
    ];

    const buzzwordMatches: string[] = [];
    lines.forEach((line, idx) => {
      const lower = line.toLowerCase();
      for (const phrase of aiBuzzwords) {
        if (lower.includes(phrase)) {
          buzzwordMatches.push(`${fileName}:${idx + 1} -> "${phrase}"`);
          extractedDefects.push({
            severity: 'critical',
            category: 'marketing',
            description: `Cheap generic AI buzzword detected: "${phrase}"`,
            fileOrLocation: `${fileName}:${idx + 1}`,
            remedy: 'Replace with bold, specific value proposition, real numbers, and crisp human voice.'
          });
          break;
        }
      }
    });

    if (buzzwordMatches.length > 0) {
      metrics.push({
        name: 'AI Copywriting Clichés & Fluff',
        category: 'marketing_bullshit',
        scoreImpact: Math.min(3.0, buzzwordMatches.length * 1.0),
        detectedCount: buzzwordMatches.length,
        snippets: buzzwordMatches.slice(0, 5),
        verdict: 'Soulless ChatGPT copywriting that will make customers cringe and bounce instantly.'
      });
    }

    // 5. Insecure Security Sins
    const securityMatches: string[] = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (/(api_key|secret|token|password|auth_token)\s*=\s*['"][a-zA-Z0-9_\-]{8,}['"]/i.test(trimmed)) {
        securityMatches.push(`${fileName}:${idx + 1} -> Hardcoded credentials`);
        extractedDefects.push({
          severity: 'blocker',
          category: 'security',
          description: 'Hardcoded plaintext secret in source code',
          fileOrLocation: `${fileName}:${idx + 1}`,
          remedy: 'Move secrets to environment variables and inject via secure vault or .env.'
        });
      }
      if (/(SELECT|INSERT|UPDATE|DELETE)\s+.*(\+|\$\{)/i.test(trimmed)) {
        securityMatches.push(`${fileName}:${idx + 1} -> String-interpolated SQL query`);
        extractedDefects.push({
          severity: 'blocker',
          category: 'security',
          description: 'SQL Injection vector: direct query string interpolation',
          fileOrLocation: `${fileName}:${idx + 1}`,
          remedy: 'Use parameterized queries or an established ORM query builder.'
        });
      }
    });

    if (securityMatches.length > 0) {
      metrics.push({
        name: 'Flagrant Security Vulnerabilities',
        category: 'security_sin',
        scoreImpact: Math.min(4.0, securityMatches.length * 2.0),
        detectedCount: securityMatches.length,
        snippets: securityMatches.slice(0, 5),
        verdict: 'Criminal negligence. Direct pathways to data breach and unauthorized system compromise.'
      });
    }

    // Calculate Purity Index (100% = Pure Art, 0% = Toxic Slop)
    const totalImpact = metrics.reduce((acc, m) => acc + m.scoreImpact, 0);
    const overallSlopPurity = Math.max(0, Math.min(100, Math.round((10 - totalImpact) * 10)));

    const detectedPatterns = metrics.map((m) => `[${m.name}]: ${m.verdict} (${m.detectedCount} instances)`);

    return {
      slopReport: {
        overallSlopPurity,
        metrics,
        detectedPatterns
      },
      extractedDefects
    };
  }
}
