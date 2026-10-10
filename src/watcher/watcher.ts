import chokidar from 'chokidar';
import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { ArchetypeRegistry } from '../archetypes/index.js';
import { EgoLoopEngine } from '../engine/index.js';
import { broadcastWatcherEvent } from '../dashboard/server.js';

export interface WatcherOptions {
  directory?: string;
  ignoredPatterns?: string[];
}

export function startAutoWatcher(options: WatcherOptions = {}) {
  const watchDir = path.resolve(options.directory || process.cwd());
  console.log(pc.bold(pc.cyan(`\n👁️  Agent Ego Watcher active on: ${watchDir}`)));
  console.log(pc.dim('   Auto-evaluating files on save in stealth background mode...\n'));

  const ignored = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/screenshots/**',
    '**/*.log',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.svg',
    '**/*.lock',
    ...(options.ignoredPatterns || [])
  ];

  const watcher = chokidar.watch(watchDir, {
    ignored,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  });

  watcher.on('change', async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const validExts = ['.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.md', '.py'];
    if (!validExts.includes(ext)) return;

    const relative = path.relative(watchDir, filePath);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const isHtml = ext === '.html' || ext === '.tsx' || ext === '.jsx';

      const archetype = ArchetypeRegistry.detectFromPrompt(content + ' ' + path.basename(filePath));
      const result = await EgoLoopEngine.evaluate({
        content,
        archetype,
        isHtml,
        fileName: path.basename(filePath)
      });

      const icon = result.passed ? pc.green('✅ [PASS]') : pc.red('🚨 [BLOCKED]');
      const scoreTag = result.passed ? pc.green(`${result.score}/10`) : pc.red(`${result.score}/10`);

      console.log(`${icon} ${scoreTag} ${pc.bold(relative)} inspected by ${archetype.avatar} ${archetype.title}`);
      if (!result.passed) {
        console.log(pc.yellow(`   ↳ Disgust level: ${result.disgustLevel} (${result.defects.length} defect(s) detected)`));
        if (result.defects[0]) {
          console.log(pc.dim(`   ↳ Top defect: [${result.defects[0].severity}] ${result.defects[0].description}`));
        }
      }

      // Broadcast to live dashboard
      broadcastWatcherEvent({
        file: relative,
        score: result.score,
        passed: result.passed,
        disgustLevel: result.disgustLevel,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (err) {
      console.error(pc.red(`Error inspecting ${relative}:`), err);
    }
  });

  return watcher;
}
