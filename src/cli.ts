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
  .description('List all available archetypes and their criteria')
  .action(() => {
    console.log(pc.bold(pc.cyan('\n🎭 Available Agent Ego Archetypes:\n')));
    const list = ArchetypeRegistry.list();
    list.forEach((a) => {
      console.log(`${a.avatar}  ${pc.bold(a.title)} (${pc.green(a.id)})`);
      console.log(`   ${pc.dim(a.role)}`);
      console.log(`   ${pc.yellow('Temperament:')} ${a.temperament}`);
      console.log(`   ${pc.red('Min Score:')} ${a.minAcceptableScore}/10\n`);
    });
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

program.parse();
