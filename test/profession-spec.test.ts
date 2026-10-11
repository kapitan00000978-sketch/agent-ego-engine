import { describe, it } from 'node:test';
import assert from 'node:assert';
import { FrontendLeadSpec } from '../src/spec/professions/frontend-lead-spec.js';
import { DeterministicGatekeeperEngine } from '../src/engine/deterministic-gatekeeper.js';

describe('FrontendLeadSpec (Group A) Verifiers & Cycle Tests', () => {
  it('detects violations on broken-markup-fixture and reports machine-readable diagnostics', async () => {
    const fixture = FrontendLeadSpec.fixtures.find((f) => f.name === 'broken-markup-fixture')!;
    const result = await DeterministicGatekeeperEngine.executeCycle(
      fixture.input,
      'test-component.html',
      FrontendLeadSpec,
      1 // Single pass
    );

    assert.strictEqual(result.passed, false);
    assert.ok(result.finalScore < 9.0);
    assert.ok(result.unresolvedDiagnostics.length >= 3);

    const ruleIds = result.unresolvedDiagnostics.map((d) => d.ruleId);
    assert.ok(ruleIds.includes('A11Y_IMG_MISSING_ALT'));
    assert.ok(ruleIds.includes('A11Y_INPUT_MISSING_LABEL'));
    assert.ok(ruleIds.includes('UNSTYLED_DEFAULT_CONTROLS'));

    // Check machine readable report contains file:line format
    assert.ok(result.machineReadableReport.includes('test-component.html:'));
    assert.ok(result.machineReadableReport.includes('-> Rule:'));
  });

  it('approves clean-markup-fixture with score >= 9.0 on first pass', async () => {
    const fixture = FrontendLeadSpec.fixtures.find((f) => f.name === 'clean-markup-fixture')!;
    const result = await DeterministicGatekeeperEngine.executeCycle(
      fixture.input,
      'clean-component.html',
      FrontendLeadSpec,
      1
    );

    assert.strictEqual(result.passed, true);
    assert.strictEqual(result.finalScore, 10.0);
    assert.strictEqual(result.unresolvedDiagnostics.length, 0);
  });

  it('runs iterative repair cycle (Max N iterations)', async () => {
    const fixableInput = `
<div>
  <img src="pic.jpg">
</div>
    `.trim();

    const result = await DeterministicGatekeeperEngine.executeCycle(
      fixableInput,
      'auto-fix.html',
      FrontendLeadSpec,
      3
    );

    // Iteration count recorded
    assert.ok(result.iterationCount >= 1);
    assert.ok(result.auditHistory.length >= 1);
  });
});
