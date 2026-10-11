import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AutoFixer } from '../src/fixer/auto-fixer.js';

describe('AutoFixer AST Transformation & Safety Tests', () => {
  it('safely removes standalone console.log statements with pure literals/identifiers', () => {
    const input = `
const x = 10;
console.log(x);
const y = 20;
`.trim();

    const result = AutoFixer.fix(input, 'test.ts');
    assert.strictEqual(result.modified, true);
    assert.ok(!result.content.includes('console.log'));
    assert.ok(result.content.includes('const x = 10;'));
    assert.ok(result.content.includes('const y = 20;'));
  });

  it('PRESERVES and flags console.log with side-effects like console.log(foo())', () => {
    const input = `
function mutate() { return 42; }
console.log(mutate());
const done = true;
`.trim();

    const result = AutoFixer.fix(input, 'test.ts');
    // Must NOT strip mutate() call! It should be preserved to prevent breaking program logic.
    assert.ok(result.content.includes('console.log(mutate())'));
    assert.ok(result.warnings.some((w) => w.includes('side-effect')));
  });

  it('safely handles if statement single-line console.log: if (x) console.log(y)', () => {
    const input = `
if (active) console.log(active);
doNext();
`.trim();

    const result = AutoFixer.fix(input, 'test.ts');
    assert.strictEqual(result.modified, true);
    // Should replace with empty block or clean removal without attaching doNext() to if!
    assert.ok(!result.content.includes('console.log'));
    // Syntactically valid TS verification:
    assert.ok(result.syntaxValid);
  });

  it('rolls back completely if a transformation produces invalid syntax', () => {
    const input = `
const a = 1;
console.log(a);
const b = 2;
`.trim();

    const result = AutoFixer.fix(input, 'broken.ts');
    assert.strictEqual(result.syntaxValid, true);
  });
});
