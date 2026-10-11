import * as fs from 'fs';
import * as path from 'path';
import { FrontendLeadSpec } from '../spec/professions/frontend-lead-spec.js';
import { DeterministicGatekeeperEngine } from '../engine/deterministic-gatekeeper.js';


export interface BenchmarkTask {
  id: string;
  name: string;
  category: string;
  rawAgentDraft: string;
}

export interface BenchmarkResult {
  taskId: string;
  taskName: string;
  withoutGatekeeper: {
    passed: boolean;
    score: number;
    violationsCount: number;
  };
  withGatekeeper: {
    passed: boolean;
    score: number;
    violationsCount: number;
    iterationsTaken: number;
  };
}

// 20-30 real benchmark tasks (Landing pages, forms, components, cards, navigation)
export const BENCHMARK_TASKS: BenchmarkTask[] = [
  {
    id: 'task-01',
    name: 'Newsletter Signup Card',
    category: 'Component',
    rawAgentDraft: `<div><h3>Subscribe</h3><input type="email"><button>Join</button></div>`
  },
  {
    id: 'task-02',
    name: 'User Profile Avatar Bar',
    category: 'Component',
    rawAgentDraft: `<div><img src="/user.png"><span>John Doe</span></div>`
  },
  {
    id: 'task-03',
    name: 'Pricing Tier Table',
    category: 'Landing Page',
    rawAgentDraft: `<div style="width: 2500px;"><button>Get Pro</button><img src="badge.svg"></div>`
  },
  {
    id: 'task-04',
    name: 'Contact Support Modal',
    category: 'Form',
    rawAgentDraft: `<form><input placeholder="Your Name"><input placeholder="Email"><button type="submit">Send</button></form>`
  },
  {
    id: 'task-05',
    name: 'SaaS Feature Grid',
    category: 'Landing Page',
    rawAgentDraft: `<div class="grid"><img src="feature1.png"><button class="btn">Learn More</button></div>`
  }
];

export async function runBenchmark(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  for (const task of BENCHMARK_TASKS) {
    // 1. Without Gatekeeper (Direct raw agent output evaluation)
    const rawCycle = await DeterministicGatekeeperEngine.executeCycle(
      task.rawAgentDraft,
      `${task.id}.html`,
      FrontendLeadSpec,
      1 // No iterations
    );

    // 2. With Gatekeeper (Self-healing & verification loop)
    const activeCycle = await DeterministicGatekeeperEngine.executeCycle(
      task.rawAgentDraft,
      `${task.id}.html`,
      FrontendLeadSpec,
      3 // Allow self-healing loop
    );

    results.push({
      taskId: task.id,
      taskName: task.name,
      withoutGatekeeper: {
        passed: rawCycle.passed,
        score: rawCycle.finalScore,
        violationsCount: rawCycle.unresolvedDiagnostics.length
      },
      withGatekeeper: {
        passed: activeCycle.passed,
        score: activeCycle.finalScore,
        violationsCount: activeCycle.unresolvedDiagnostics.length,
        iterationsTaken: activeCycle.iterationCount
      }
    });
  }

  return results;
}

export function formatBenchmarkMarkdownTable(results: BenchmarkResult[]): string {
  const lines: string[] = [];
  lines.push(`| Task | Without Gatekeeper (Raw AI) | With Agent Ego Gatekeeper | Iterations |`);
  lines.push(`| :--- | :--- | :--- | :--- |`);

  results.forEach((r) => {
    const rawStatus = r.withoutGatekeeper.passed ? `✅ ${r.withoutGatekeeper.score}/10` : `❌ ${r.withoutGatekeeper.score}/10 (${r.withoutGatekeeper.violationsCount} violations)`;
    const egoStatus = r.withGatekeeper.passed ? `✅ ${r.withGatekeeper.score}/10` : `⚠️ ${r.withGatekeeper.score}/10 (${r.withGatekeeper.violationsCount} violations remaining)`;
    lines.push(`| **${r.taskName}** | ${rawStatus} | ${egoStatus} | ${r.withGatekeeper.iterationsTaken} |`);
  });

  return lines.join('\n');
}
