export interface AutoFixResult {
  modified: boolean;
  content: string;
  appliedFixes: string[];
}

export class AutoFixer {
  /**
   * Surgically auto-repairs mechanical defects and sloppy code in milliseconds
   */
  public static fix(content: string, fileName = 'snippet'): AutoFixResult {
    let fixed = content;
    const appliedFixes: string[] = [];

    // 1. Remove stray console.log statements
    if (/console\.log\s*\([^)]*\);?\n?/g.test(fixed)) {
      fixed = fixed.replace(/console\.log\s*\([^)]*\);?\n?/g, '');
      appliedFixes.push('Stripped debug console.log statements');
    }

    // 2. Remove lazy TODO placeholder comments
    if (/\/\/\s*(TODO|FIXME|implement later)[^\n]*\n?/gi.test(fixed)) {
      fixed = fixed.replace(/\/\/\s*(TODO|FIXME|implement later)[^\n]*\n?/gi, '');
      appliedFixes.push('Removed lazy // TODO stubs');
    }

    // 3. Fix dangerous any types into robust unknown/generics
    if (/:\s*any\b/g.test(fixed)) {
      fixed = fixed.replace(/:\s*any\b/g, ': unknown');
      appliedFixes.push('Hardened ": any" types into safe ": unknown"');
    }

    // 4. HTML/JSX: Ensure interactive buttons have smooth transitions
    if (/<button\b([^>]*)>/gi.test(fixed)) {
      fixed = fixed.replace(/<button\b([^>]*)>/gi, (match, attrs) => {
        if (!attrs.includes('transition') && !attrs.includes('style=')) {
          appliedFixes.push('Injected smooth CSS transitions to interactive <button>');
          if (attrs.includes('class="')) {
            return `<button ${attrs.replace('class="', 'class="transition-all duration-200 active:scale-95 ')}>`;
          } else {
            return `<button class="transition-all duration-200 active:scale-95" ${attrs}>`;
          }
        }
        return match;
      });
    }

    // 5. Clean AI Marketing Clichés
    const cliches: [RegExp, string][] = [
      [/in today's fast-paced digital world,?/gi, 'In modern digital operations,'],
      [/delve into/gi, 'explore'],
      [/tapestry of/gi, 'range of'],
      [/testament to/gi, 'proof of'],
      [/game-changer/gi, 'high-impact solution'],
      [/seamlessly integrates/gi, 'integrates directly']
    ];

    cliches.forEach(([regex, replacement]) => {
      if (regex.test(fixed)) {
        fixed = fixed.replace(regex, replacement);
        appliedFixes.push(`Replaced robotic AI cliché with punchy human copy`);
      }
    });

    // 6. In HTML: Inject viewport meta tag if missing in full document
    if (/<html/i.test(fixed) && !/<meta[^>]*name=["']viewport["']/i.test(fixed)) {
      fixed = fixed.replace(
        /<head>/i,
        '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
      );
      appliedFixes.push('Injected mobile responsive viewport meta tag');
    }

    // 7. In HTML: Inject alt attribute to unlabelled img tags
    if (/<img\b((?:(?!alt=)[^>])*)>/gi.test(fixed)) {
      fixed = fixed.replace(/<img\b((?:(?!alt=)[^>])*)>/gi, '<img alt="Visual graphic" $1>');
      appliedFixes.push('Added missing accessible alt attributes to images');
    }

    return {
      modified: appliedFixes.length > 0,
      content: fixed,
      appliedFixes
    };
  }
}
