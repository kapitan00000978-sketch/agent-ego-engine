import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ArchetypeRegistry } from '../archetypes/index.js';
import { ArchetypeId } from '../types.js';
import { EgoLoopEngine, ContextInjector } from '../engine/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface WatcherEvent {
  file: string;
  score: number;
  passed: boolean;
  disgustLevel: string;
  timestamp: string;
}

const sseClients: http.ServerResponse[] = [];

export function broadcastWatcherEvent(event: WatcherEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(data);
    } catch {
      // client disconnected
    }
  });
}

export function startDashboardServer(port = 3333): http.Server {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // Enable CORS for local laboratory
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // 1. Root: Serve UI HTML
    if (url.pathname === '/' && req.method === 'GET') {
      const htmlPath = path.resolve(__dirname, 'ui.html');
      if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(htmlPath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('ui.html not found');
      }
      return;
    }

    // 2. API: List Archetypes
    if (url.pathname === '/api/archetypes' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(ArchetypeRegistry.list()));
      return;
    }

    // 3. API: Run Audit
    if (url.pathname === '/api/audit' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          const archetype = payload.archetypeId
            ? ArchetypeRegistry.get(payload.archetypeId as ArchetypeId)
            : ArchetypeRegistry.detectFromPrompt(payload.content);

          const result = await EgoLoopEngine.evaluate({
            content: payload.content || '',
            archetype,
            isHtml: payload.isHtml || false,
            runVisualCheck: payload.visual || false
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: msg }));
        }
      });
      return;
    }

    // 4. API: Wrap Prompt
    if (url.pathname === '/api/wrap' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const archetype = payload.archetypeId
            ? ArchetypeRegistry.get(payload.archetypeId as ArchetypeId)
            : ArchetypeRegistry.detectFromPrompt(payload.prompt || '');

          const wrapped = ContextInjector.inject(payload.prompt || '', archetype);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ wrappedPrompt: wrapped }));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: msg }));
        }
      });
      return;
    }

    // 5. API: Server-Sent Events (SSE) for Watcher
    if (url.pathname === '/api/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });
      res.write('data: {"type":"connected"}\n\n');
      sseClients.push(res);

      req.on('close', () => {
        const idx = sseClients.indexOf(res);
        if (idx !== -1) sseClients.splice(idx, 1);
      });
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  server.listen(port, () => {
    console.log(`\n🔬 [Stealth Mode] Agent Ego Laboratory Dashboard running at: http://localhost:${port}`);
  });

  return server;
}
