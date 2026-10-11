import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
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
  // Generate high-entropy session security token
  const sessionToken = crypto.randomBytes(24).toString('hex');

  const server = http.createServer(async (req, res) => {
    // 1. Host Header Validation (Protection against DNS Rebinding attacks)
    const host = req.headers.host || '';
    const isAllowedHost = host.startsWith(`127.0.0.1:${port}`) || host.startsWith(`localhost:${port}`);
    if (!isAllowedHost) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden: Invalid Host header (DNS rebinding protection active).');
      return;
    }

    // 2. Origin Header Validation (CORS & Cross-Site WebSocket/Fetch hijacking defense)
    const origin = req.headers.origin;
    if (origin) {
      const isAllowedOrigin =
        origin === `http://127.0.0.1:${port}` ||
        origin === `http://localhost:${port}`;

      if (!isAllowedOrigin) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden: Cross-site request rejected (Origin header mismatch).');
        return;
      }
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    const url = new URL(req.url || '/', `http://${host}`);

    // Verify session token on API endpoints
    if (url.pathname.startsWith('/api/')) {
      const clientToken = req.headers['x-ego-token'] || url.searchParams.get('token');
      if (clientToken !== sessionToken) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized: Missing or invalid security token.' }));
        return;
      }
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Ego-Token');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Serve UI HTML with injected session token
    if (url.pathname === '/' && req.method === 'GET') {
      const htmlPath = path.resolve(__dirname, 'ui.html');
      if (fs.existsSync(htmlPath)) {
        let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        // Inject token into window object
        htmlContent = htmlContent.replace('</head>', `<script>window.__EGO_TOKEN__ = "${sessionToken}";</script></head>`);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(htmlContent);
      } else {
        res.writeHead(404);
        res.end('ui.html not found');
      }
      return;
    }

    // API: List Archetypes
    if (url.pathname === '/api/archetypes' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(ArchetypeRegistry.list()));
      return;
    }

    // API: Run Audit
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

    // API: Server-Sent Events (SSE)
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

  // Strictly bind ONLY to loopback 127.0.0.1 (Never 0.0.0.0)
  server.listen(port, '127.0.0.1', () => {
    console.log(`\n🔬 [Protected Loopback] Agent Ego Dashboard running at: http://127.0.0.1:${port}?token=${sessionToken}`);
    console.log(`🔒 Security active: Loopback bound (127.0.0.1), Host header checked, Token authenticated.`);
  });

  return server;
}
