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
    console.log('─'.repeat(60));

    console.log(pc.bold(pc.magenta('\n🗣️  Internal Monologue / Rant:')));
    console.log(evalResult.innerRant);

    if (!evalResult.passed) {
      console.log('\n' + pc.bold(pc.red('⛔ RESULT: OUTPUT BLOCKED FROM USER.')));
      console.log(pc.yellow('The AI agent must resolve these defects before showing the result to the user.\n'));
      process.exit(1);
    } else {
      console.log('\n' + pc.bold(pc.green('✅ RESULT: APPROVED FOR RELEASE TO USER.')));
      process.exit(0);
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

// 4. Init Project Rules
program
  .command('init')
  .description('Initialize Ego Gatekeeper rules in the current project')
  .action(() => {
    const rulesDir = path.resolve(process.cwd(), '.agents/rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    
    const ruleContent = `
# Agent Ego Perfectionist Gatekeeper Rule
# ALL AI AGENTS IN THIS PROJECT ARE GOVERNED BY THE AGENT EGO ENGINE.

1. You are forbidden from displaying unfinished code, placeholder comments ("// TODO"), or unstyled UI.
2. If your work falls below 9.0/10 quality, you must internally reject it and regenerate it without asking the user.
3. Treat every output with human accountability, pride, and craftsmanship.
`.trim();

    const targetFile = path.join(rulesDir, 'ego-gatekeeper.md');
    fs.writeFileSync(targetFile, ruleContent, 'utf-8');
    console.log(pc.green(`✅ Initialized Agent Ego rules at ${targetFile}`));
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

program.parse();
