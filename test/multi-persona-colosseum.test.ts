import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MultiPersonaColosseumEngine } from '../src/spec/multi-persona-colosseum.js';

describe('MultiPersonaColosseumEngine Suite', () => {
  it('evaluates a security-critical UI task through multiple opposing expert personas concurrently', async () => {
    // Insecure UI component with SQL concatenation and missing alt tags
    const badCode = `
<div class="checkout-box">
  <img src="lock.png">
  <button onclick="pay()">Pay Now</button>
  <script>
    const query = "SELECT balance FROM wallets WHERE token = " + token;
  </script>
</div>
    `.trim();

    const panelReport = await MultiPersonaColosseumEngine.evaluatePanel(
      badCode,
      'checkout.html'
    );

    // Council size must be at least 3 complementary personas
    assert.ok(panelReport.participants.length >= 3);
    assert.strictEqual(panelReport.panelPassed, false);
    assert.strictEqual(panelReport.unanimousApproval, false);
    assert.ok(panelReport.dissentingOpinions.length > 0);
    assert.ok(panelReport.unifiedMandates.length > 0);

    // Verify machine-readable report contains breakdown
    assert.ok(panelReport.machineReadableReport.includes('MULTI-PERSONA EXPERT PANEL REPORT'));
  });

  it('unanimously approves clean and secure implementations', async () => {
    const cleanCode = `
export class SecureService {
  public static execute(input: string): string {
    return input.trim();
  }
}
    `.trim();

    const panelReport = await MultiPersonaColosseumEngine.evaluatePanel(
      cleanCode,
      'service.ts',
      ['Clean Architecture Staff Engineer', 'Paranoid Zero-Trust Security Officer']
    );

    assert.strictEqual(panelReport.participants.length, 2);
    assert.strictEqual(panelReport.panelPassed, true);
    assert.strictEqual(panelReport.unanimousApproval, true);
  });
});
