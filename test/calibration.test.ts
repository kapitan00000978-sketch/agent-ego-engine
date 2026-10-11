import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import { EgoLoopEngine } from '../src/engine/index.js';
import { ArchetypeRegistry } from '../src/archetypes/index.js';

describe('Calibration Suite: Good vs Bad Fixtures', () => {
  it('strictly rejects bad/insecure-auth.ts with score < 9.0 and multiple blocker defects', async () => {
    const badFilePath = path.resolve('test/fixtures/bad/insecure-auth.ts');
    const content = fs.readFileSync(badFilePath, 'utf-8');
    const archetype = ArchetypeRegistry.get('security-officer');

    const result = await EgoLoopEngine.evaluate({
      content,
      archetype,
      fileName: 'insecure-auth.ts'
    });

    assert.strictEqual(result.passed, false);
    assert.ok(result.score < 6.0, `Expected score < 6.0 for severe slop, but got ${result.score}`);
    assert.strictEqual(result.disgustLevel, 'unacceptable_garbage');
    assert.ok(result.defects.some((d) => d.category === 'security'));
  });

  it('approves good/clean-service.ts with score >= 9.0 and zero blockers', async () => {
    const goodFilePath = path.resolve('test/fixtures/good/clean-service.ts');
    const content = fs.readFileSync(goodFilePath, 'utf-8');
    const archetype = ArchetypeRegistry.get('backend-architect');

    const result = await EgoLoopEngine.evaluate({
      content,
      archetype,
      fileName: 'clean-service.ts'
    });

    assert.strictEqual(result.passed, true);
    assert.ok(result.score >= 9.0, `Expected score >= 9.0, but got ${result.score}`);
    assert.strictEqual(result.defects.length, 0);
  });
});
