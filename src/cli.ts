#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { ArchetypeRegistry } from './archetypes/index.js';
import { ArchetypeId } from './types.js';
import { ContextInjector, EgoLoopEngine } from './engine/index.js';

const program = new Command();

program
  .name('agent-ego')
  .description('Autonomous Human Temperament & Perfectionist Self-Critique Engine for AI Agents')
  .version('1.0.0');

// 1. Audit Command
program
  .command('audit <filePath>')
  .description('Audit a file or component against the perfectionist gatekeeper')
  .option('-a, --archetype <id>', 'Archetype ID (frontend-lead, backend-architect, security-officer, code-reviewer, copy-editor)')
  .option('-v, --visual', 'Run Playwright visual inspection if HTML/web component', false)
  .option('--json', 'Output machine-readable JSON report', false)
  .action(async (filePath, options) => {

    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(pc.red(`❌ File not found: ${filePath}`));
      process.exit(1);
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const ext = path.extname(fullPath).toLowerCase();
    const isHtml = ext === '.html' || ext === '.htm' || ext === '.jsx' || ext === '.tsx';

    const archetype = options.archetype
      ? ArchetypeRegistry.get(options.archetype as ArchetypeId)
      : ArchetypeRegistry.detectFromPrompt(content + ' ' + path.basename(filePath));

    console.log(pc.bold(pc.cyan(`\n🧠  Agent Ego Engine: Evaluating through ${archetype.avatar} ${archetype.title}...`)));

    const evalResult = await EgoLoopEngine.evaluate({
      content,
      archetype,
      isHtml,
      runVisualCheck: options.visual,
      fileName: path.basename(filePath)
    });

    console.log('\n' + '─'.repeat(60));
    console.log(pc.bold(`Score: `) + (evalResult.passed ? pc.green(`${evalResult.score}/10 [PASSED]`) : pc.red(`${evalResult.score}/10 [REJECTED]`)));
    console.log(pc.bold(`Disgust Level: `) + pc.yellow(evalResult.disgustLevel));
    if (evalResult.slopDna) {
      const purityColor = evalResult.slopDna.overallSlopPurity >= 90 ? pc.green : (evalResult.slopDna.overallSlopPurity >= 70 ? pc.yellow : pc.red);
      console.log(pc.bold(`Slop Purity Index: `) + purityColor(`${evalResult.slopDna.overallSlopPurity}% Craftsmanship`));
    }
    console.log('─'.repeat(60));

    console.log(pc.bold(pc.magenta('\n🗣️  Internal Monologue / Rant:')));
    console.log(evalResult.innerRant);

    if (evalResult.craftsmanshipSeal) {
      console.log('\n' + pc.bold(pc.cyan('🏅 ' + evalResult.craftsmanshipSeal.sealTitle)));
      console.log(pc.dim(`Rationale: ${evalResult.craftsmanshipSeal.uncompromisingRationale}`));
      evalResult.craftsmanshipSeal.architecturalHighlights.forEach((h) => console.log(`  ✓ ${h}`));
    }

    if (options.json) {
      const outputJson = {
        file: filePath,
        passed: evalResult.passed,
        score: evalResult.score,
        hardGateFailure: evalResult.breakdown?.hardGatePassed === false,
        breakdown: evalResult.breakdown,
        diagnostics: evalResult.defects.map((d) => ({
          file: d.fileOrLocation || filePath,
          severity: d.severity,
          category: d.category,
          rule: d.description,
          remedy: d.remedy
        }))
      };
      console.log(JSON.stringify(outputJson, null, 2));
      process.exit(evalResult.passed ? 0 : 1);
    } else {
      if (!evalResult.passed) {
        console.log('\n' + pc.bold(pc.red('⛔ RESULT: OUTPUT BLOCKED FROM USER.')));
        console.log(pc.yellow('The AI agent must resolve these defects before showing the result to the user.\n'));
        process.exit(1);
      } else {
        console.log('\n' + pc.bold(pc.green('✅ RESULT: APPROVED FOR RELEASE TO USER.')));
        process.exit(0);
      }
    }
  });




// 2. Wrap Prompt Command
program
  .command('wrap <prompt>')
  .description('Wrap a user request into a strict persona & perfectionist mandate')
  .option('-a, --archetype <id>', 'Force a specific archetype')
  .action((promptText, options) => {
    const archetype = options.archetype
      ? ArchetypeRegistry.get(options.archetype as ArchetypeId)
      : ArchetypeRegistry.detectFromPrompt(promptText);

    const wrapped = ContextInjector.inject(promptText, archetype);
    console.log(wrapped);
  });

// 3. List Archetypes
program
  .command('list')
  .description('List all available archetypes grouped by domain')
  .action(() => {
    console.log(pc.bold(pc.cyan('\n🎭 Available Agent Ego Archetypes (All Professional Domains):\n')));
    
    const categories = [
      { key: 'marketing', name: '🚀 Online Marketing, Growth & Funnels' },
      { key: 'engineering', name: '⚙️ Software Engineering, Cloud & Security' },
      { key: 'product', name: '🧭 Product Management & User Experience' },
      { key: 'business', name: '💼 Startup Venture & Unit Economics' },
      { key: 'data-ai', name: '📊 Data Science & Machine Learning' },
      { key: 'creative', name: '🎨 Creative Direction & Copywriting' }
    ] as const;

    for (const cat of categories) {
      const archs = ArchetypeRegistry.listByCategory(cat.key as any);
      if (archs.length > 0) {
        console.log(pc.bold(pc.yellow(`\n=== ${cat.name} ===`)));
        archs.forEach((a) => {
          console.log(`\n${a.avatar}  ${pc.bold(a.title)} [${pc.green(a.id)}]`);
          console.log(`   ${pc.dim(a.role)}`);
          console.log(`   ${pc.cyan('Temperament:')} ${a.temperament}`);
          console.log(`   ${pc.red('Disgust threshold:')} Minimum score ${a.minAcceptableScore}/10 required`);
        });
      }
    }
    console.log('\n');
  });

// 4. Init Project Rules (Multi-Platform Distribution)
program
  .command('init')
  .description('Deploy Gatekeeper configurations across Antigravity, Cursor, Claude Code, Git hooks, and GitHub Actions')
  .action(() => {
    const cwd = process.cwd();

    // A. Antigravity / Shared AGENTS.md
    const agentsMdContent = `
# Deterministic Quality Gatekeeper Directive (AGENTS.md)
# All AI agents operating in this repository are bound by deterministic quality criteria.

1. Hard Gate: Code containing syntax, TypeScript compiler errors, or unhandled linter failures will be rejected with score 0.0.
2. Zero Placeholder Slop: Do not emit "// TODO", "// implement later", or empty stubs. All emitted units must be complete.
3. Type Safety: Explicit type parameters and validated schemas (Zod/Pydantic) are required. "any" types and type-evasions are blocked.
4. UI & Accessibility: Web components must provide valid alt text, accessible ARIA attributes, and zero horizontal viewport overflows.
5. Exit Standard: Only outputs achieving >= 9.0/10 verified score may be presented to the user.
`.trim();
    fs.writeFileSync(path.join(cwd, 'AGENTS.md'), agentsMdContent, 'utf-8');
    console.log(pc.green(`  ✓ Created AGENTS.md (Root Project Gatekeeper Directive)`));

    // B. Cursor Rules (.cursor/rules/agent-ego.mdc)
    const cursorDir = path.join(cwd, '.cursor', 'rules');
    fs.mkdirSync(cursorDir, { recursive: true });
    const cursorContent = `
---
description: Deterministic Gatekeeper and Zero-Slop Rules for Cursor Agent
globs: *
alwaysApply: true
---
# Cursor Agent Gatekeeper Rules
- Hard compile gate: Verify syntax before completing response.
- Do not emit stub code or "// TODO".
- Adhere to the minimum 9.0/10 craftsmanship standard.
`.trim();
    fs.writeFileSync(path.join(cursorDir, 'agent-ego.mdc'), cursorContent, 'utf-8');
    console.log(pc.green(`  ✓ Created .cursor/rules/agent-ego.mdc (Cursor Rules)`));

    // C. Git Pre-Commit Hook (.git/hooks/pre-commit)
    const gitHooksDir = path.join(cwd, '.git', 'hooks');
    if (fs.existsSync(gitHooksDir)) {
      const hookContent = `#!/bin/sh
# Agent Ego Pre-Commit Quality Gatekeeper
echo "🛡️ Running Agent Ego Gatekeeper audit..."
npx agent-ego audit .
if [ $? -ne 0 ]; then
  echo "❌ Commit rejected by Agent Ego Gatekeeper: Score fell below 9.0/10."
  exit 1
fi
echo "✅ Quality Gatekeeper approved commit."
exit 0
`;
      const hookPath = path.join(gitHooksDir, 'pre-commit');
      fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
      console.log(pc.green(`  ✓ Created .git/hooks/pre-commit (Git Pre-Commit Gatekeeper Hook)`));
    }

    // D. GitHub Actions CI Workflow (.github/workflows/gatekeeper.yml)
    const ghWorkflowDir = path.join(cwd, '.github', 'workflows');
    fs.mkdirSync(ghWorkflowDir, { recursive: true });
    const workflowContent = `name: Agent Ego Quality Gatekeeper CI

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  gatekeeper-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install Dependencies
        run: npm ci
      - name: Run TypeScript & ESLint Hard Gates
        run: npx tsc --noEmit
      - name: Run Agent Ego Gatekeeper Audit
        run: npx agent-ego audit src/
`.trim();
    fs.writeFileSync(path.join(ghWorkflowDir, 'gatekeeper.yml'), workflowContent, 'utf-8');
    console.log(pc.green(`  ✓ Created .github/workflows/gatekeeper.yml (GitHub Actions CI Workflow)`));

    console.log(pc.bold(pc.cyan(`\n🎉 Project successfully configured with Agent Ego Gatekeeper across all platforms!\n`)));
  });


// 5. Dashboard Command (Local Stealth Lab)
program
  .command('dashboard')
  .description('Launch the local stealth laboratory web dashboard')
  .option('-p, --port <number>', 'Port to listen on', '3333')
  .action(async (options) => {
    const { startDashboardServer } = await import('./dashboard/server.js');
    startDashboardServer(parseInt(options.port, 10));
  });

// 6. Watch Command
program
  .command('watch [directory]')
  .description('Launch the auto-watcher daemon on a directory')
  .action(async (directory) => {
    const { startAutoWatcher } = await import('./watcher/watcher.js');
    startAutoWatcher({ directory });
  });

// 7. Full Lab Command (Dashboard + Watcher)
program
  .command('lab [directory]')
  .description('Launch both the Stealth Web Dashboard and the Auto-Watcher concurrently')
  .option('-p, --port <number>', 'Port for dashboard', '3333')
  .action(async (directory, options) => {
    const { startDashboardServer } = await import('./dashboard/server.js');
    const { startAutoWatcher } = await import('./watcher/watcher.js');
    startDashboardServer(parseInt(options.port, 10));
    startAutoWatcher({ directory });
  });

// 8. Squad Assembler Command
program
  .command('squad <goal>')
  .description('Automatically assemble a specialized multi-persona squad for a project')
  .action(async (goal) => {
    const { SquadAssembler } = await import('./squad/squad-assembler.js');
    const plan = SquadAssembler.assemble(goal);

    console.log(pc.bold(pc.cyan(`\n👥  ${plan.squadName}`)));
    console.log(pc.dim(`Goal: "${plan.objective}"\n`));

    console.log(pc.bold(pc.yellow('Assigned Squad Members:')));
    plan.members.forEach((m) => {
      console.log(`  ${m.order}. ${m.archetype.avatar} ${pc.bold(m.archetype.title)}: ${pc.dim(m.responsibility)}`);
    });

    console.log(pc.bold(pc.magenta('\nExecution Phases & Hand-offs:')));
    plan.executionPhases.forEach((p, idx) => {
      console.log(`\n  [Phase ${idx + 1}] ${pc.bold(p.phase)} (Lead: ${pc.green(p.leadMember)})`);
      console.log(`    ↳ Deliverable: ${p.deliverable}`);
      console.log(`    ↳ Criteria: ${pc.yellow(p.acceptanceCriteria)}`);
    });
    console.log('\n');
  });

// 9. Self-Healing Auto-Fixer Command
program
  .command('fix <filePath>')
  .description('Surgically auto-repair mechanical defects in a file')
  .action(async (filePath) => {
    const { AutoFixer } = await import('./fixer/auto-fixer.js');
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(pc.red(`❌ File not found: ${filePath}`));
      process.exit(1);
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const result = AutoFixer.fix(content, path.basename(filePath));

    if (result.modified) {
      fs.writeFileSync(fullPath, result.content, 'utf-8');
      console.log(pc.bold(pc.green(`\n🩹 Self-Healing Repair applied to ${filePath}:`)));
      result.appliedFixes.forEach((f) => console.log(`  ✓ ${f}`));
    } else {
      console.log(pc.cyan(`\n✨ No mechanical defects found in ${filePath}. Code is already clean.`));
    }
  });

// 10. Lessons Memory Command
program
  .command('memory [archetypeId]')
  .description('Display learned lessons from past rejections')
  .action(async (archetypeId) => {
    const { LessonsMemory } = await import('./memory/lessons-memory.js');
    if (archetypeId) {
      const lessons = LessonsMemory.getLessonsForArchetype(archetypeId as any);
      console.log(pc.bold(pc.cyan(`\n🧬 Learned Lessons for [${archetypeId}]:`)));
      if (lessons.length === 0) {
        console.log(pc.dim('  No historical mistakes recorded yet for this archetype.'));
      } else {
        lessons.forEach((l, i) => {
          console.log(`  ${i + 1}. [Flagged ${l.occurrences}x]: ${pc.yellow(l.learnedRule)}`);
        });
      }
    } else {
      console.log(pc.bold(pc.cyan('\n🧬 Global Lessons Memory Overview:\n')));
      const archetypes = (await import('./archetypes/index.js')).ArchetypeRegistry.list();
      let total = 0;
      archetypes.forEach((a) => {
        const l = LessonsMemory.getLessonsForArchetype(a.id);
        if (l.length > 0) {
          total += l.length;
          console.log(`${a.avatar} ${pc.bold(a.title)}: ${l.length} lesson(s) learned`);
        }
      });
      if (total === 0) {
        console.log(pc.dim('Lessons memory is ready. Mistakes will be automatically recorded during audits.'));
      }
    }
    console.log('\n');
  });

// 11. Cross-Archetype Psychological War-Room Debate
program
  .command('debate <topicOrGoal>')
  .description('Pit opposing archetypes against each other in a psychological war-room to forge a consensus')
  .option('-p, --personas <ids...>', 'Force specific archetype IDs (e.g., startup-founder security-officer frontend-lead)')
  .action(async (topicOrGoal, options) => {
    const { WarRoomDebater } = await import('./debate/war-room-debater.js');
    const result = WarRoomDebater.debate(topicOrGoal, options.personas);

    console.log(pc.bold(pc.cyan(`\n⚔️  PSYCHOLOGICAL WAR-ROOM: "${topicOrGoal}"`)));
    console.log(pc.dim(`Consensus Score: ${result.consensusScore}/10 | Participants: ${result.participants.length}\n`));

    console.log(pc.bold(pc.yellow('Debate Transcript & Clash:')));
    result.debateTranscript.forEach((turn) => {
      let heatBadge = pc.cyan(`[${turn.heatLevel}]`);
      if (turn.heatLevel === 'fiery_clash') heatBadge = pc.red(`[🔥 FIERY CLASH]`);
      if (turn.heatLevel === 'consensus_achieved') heatBadge = pc.green(`[🤝 CONSENSUS]`);
      console.log(`\n${turn.avatar} ${pc.bold(turn.speaker)} ${heatBadge}:`);
      console.log(`  "${turn.statement}"`);
    });

    console.log('\n' + pc.bold(pc.magenta('⚖️  UNCOMPROMISING SYNTHESIS:')));
    console.log(`  ${result.uncompromisingSynthesis}`);

    console.log('\n' + pc.bold(pc.green('📋 ACTIONABLE WAR-ROOM DIRECTIVES:')));
    result.actionableDirectives.forEach((dir, i) => {
      console.log(`  ${i + 1}. ${dir}`);
    });
    console.log('\n');
  });

// 12. Deep Slop DNA Scanner Command
program
  .command('slop <filePath>')
  .description('Dissect a file for AI slop, placeholder DNA, and generic fluff')
  .action(async (filePath) => {
    const { SlopDnaScanner } = await import('./sensory/slop-dna-scanner.js');
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(pc.red(`❌ File not found: ${filePath}`));
      process.exit(1);
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const { slopReport } = SlopDnaScanner.scan(content, path.basename(filePath));

    console.log(pc.bold(pc.cyan(`\n🧬  Slop DNA Scanner: ${path.basename(filePath)}`)));
    const purityColor = slopReport.overallSlopPurity >= 90 ? pc.green : (slopReport.overallSlopPurity >= 70 ? pc.yellow : pc.red);
    console.log(`Craftsmanship Purity: ${purityColor(slopReport.overallSlopPurity + '%')}\n`);

    if (slopReport.metrics.length === 0) {
      console.log(pc.green('✨ Zero slop detected! High-purity craftsmanship throughout.'));
    } else {
      console.log(pc.bold(pc.red('Detected Slop Patterns:')));
      slopReport.metrics.forEach((m) => {
        console.log(`\n  🚨 [${pc.bold(m.name)}] - Impact: -${m.scoreImpact} pts`);
        console.log(`     ${pc.dim(m.verdict)}`);
        m.snippets.forEach((s) => console.log(`     ↳ ${pc.yellow(s)}`));
      });
    }
    console.log('\n');
  });

program.parse();

