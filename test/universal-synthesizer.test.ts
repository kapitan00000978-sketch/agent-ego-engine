import { describe, it } from 'node:test';
import assert from 'node:assert';
import { UniversalProfessionSynthesizer } from '../src/spec/universal-synthesizer.js';
import { DeterministicGatekeeperEngine } from '../src/engine/deterministic-gatekeeper.js';

describe('UniversalProfessionSynthesizer Suite', () => {
  it('synthesizes specialized professions dynamically with appropriate character temperaments', () => {
    // 1. Nuclear Safety Engineer -> militant_standards_officer
    const nuclear = UniversalProfessionSynthesizer.synthesize({
      domainOrRole: 'Nuclear Power Safety Inspector'
    });
    assert.strictEqual(nuclear.group, 'A');
    assert.ok(nuclear.personaPrompt.includes('Militant Standards & Compliance Auditor'));

    // 2. Cryptographic Forensic Auditor -> paranoid_zero_trust
    const cryptoForensics = UniversalProfessionSynthesizer.synthesize({
      domainOrRole: 'Cryptographic Forensics Auditor'
    });
    assert.strictEqual(cryptoForensics.group, 'A');
    assert.ok(cryptoForensics.personaPrompt.includes('Paranoid Zero-Trust Sentinel'));

    // 3. Quantitative Risk Analyst -> cold_cynic
    const quant = UniversalProfessionSynthesizer.synthesize({
      domainOrRole: 'Quantitative Hedge Fund Analyst'
    });
    assert.ok(quant.personaPrompt.includes('Cold Cynic & Analytical Realist'));
  });

  it('evaluates and enforces standards using dynamically synthesized professions', async () => {
    const aviationSpec = UniversalProfessionSynthesizer.synthesize({
      domainOrRole: 'Avionics Embedded Engineer'
    });

    const badAvionicsCode = `
function calculateAltitudePitch() {
  // TODO: implement later
  const value = "magic happens here";
  return value;
}
    `.trim();

    const result = await DeterministicGatekeeperEngine.executeCycle(
      badAvionicsCode,
      'flight-control.c',
      aviationSpec,
      1
    );

    assert.strictEqual(result.passed, false);
    assert.ok(result.unresolvedDiagnostics.length >= 2);
    assert.ok(result.machineReadableReport.includes('Avionics Embedded Engineer'));
  });
});
