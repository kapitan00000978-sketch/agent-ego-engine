# 🛡️ Agent Ego Engine (`agent-ego`)
> **Deterministic Quality Gatekeeper & Context Wrapper for AI Agents.**
> [O'zbekcha versiyasi: README.uz.md](README.uz.md)

[![CI](https://github.com/kapitan00000978-sketch/agent-ego-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/kapitan00000978-sketch/agent-ego-engine/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)

Left unguided, LLMs produce unverified code: missing types, swallowed exceptions, broken viewport layouts, and superficial placeholders.

**`agent-ego`** is NOT a psychological intervention. LLMs do not possess psychological states. Instead, `agent-ego` operates as a **two-phase deterministic engineering gatekeeper**:
1. **Pre-execution Context Wrapper**: Injects strict domain invariants, constraints, and non-negotiable boundaries into the agent's prompt.
2. **Post-execution Deterministic Gatekeeper**: Evaluates outputs through deterministic static inspection, AST parsing, and browser runtime verification.

---

## ⚡ Quick Start (30 Seconds)

### Installation
```bash
npm install -g agent-ego-engine
# Or run directly via npx:
npx agent-ego audit src/index.ts
```

### Initialize in Any Project
Deploy gatekeeper configurations across **Antigravity, Cursor, Git pre-commit hooks, and GitHub Actions**:
```bash
agent-ego init
```

---

## 🔍 Before / After Comparison

### ❌ Raw AI Agent Output (Without Gatekeeper)
```typescript
// TODO: implement real logic later
export function authenticate(req: any) {
  try {
    const user = db.query("SELECT * FROM users WHERE id = " + req.id);
    return user;
  } catch (e) {} // swallowed error
}
```
* **Score**: `2.5 / 10.0`
* **Gatekeeper Verdict**: ⛔ **BLOCKED FROM USER**.
* **Reason**: SQL concatenation (blocker), swallowed catch block (critical), `any` type (critical), `// TODO` placeholder (blocker).

---

### ✅ Hardened Output (Passed Through Agent Ego Gatekeeper)
```typescript
import { z } from 'zod';
import { db } from './db.js';
import { AppError } from './errors.js';

const AuthRequestSchema = z.object({
  id: z.string().uuid()
});

export interface UserSession {
  id: string;
  role: string;
}

export async function authenticate(req: unknown): Promise<UserSession> {
  const parsed = AuthRequestSchema.parse(req);
  try {
    const user = await db.query<UserSession>(
      'SELECT id, role FROM users WHERE id = $1',
      [parsed.id]
    );
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Authentication failed', 404);
    }
    return user;
  } catch (err: unknown) {
    logger.error('Database query failed during authentication', { error: err });
    throw new AppError('AUTH_FAILURE', 'Internal authentication failure', 500);
  }
}
```
* **Score**: `10.0 / 10.0`
* **Gatekeeper Verdict**: ✅ **APPROVED FOR RELEASE**.
* **Guarantees**: Parameterized query, explicit typing, runtime Zod validation, structured error logging.

---

## ⚖️ Deterministic Scoring Rubric & Hard Gates

Evaluation is based on concrete, machine-verifiable weights:

| Check | Tool / Engine | Impact on Score | Policy / Rule Type |
| :--- | :--- | :--- | :--- |
| **Compiler Errors** | `tsc` compile diagnostics | **Score = 0.0** | **Hard Gate** (Zero tolerance) |
| **Linter Errors** | ESLint diagnostics | **Score = 0.0** | **Hard Gate** (*N/A if unconfigured*) |
| **Blocker Defect** | Security vulnerability / SQL concatenation | **-2.5 pts** | Deduction |
| **Critical Defect** | Swallowed exceptions, type evasion | **-1.5 pts** | Deduction |
| **Accessibility (a11y)** | `axe-core` violations | **-0.5 pts** (up to -3.0) | Deduction (*DOM elements & landmarks*) |
| **Visual Stability** | CLS > 0.1 (via `PerformanceObserver`) | **-1.0 pts** | Deduction |
| **Viewport Overflow** | `scrollWidth > clientWidth` | **-1.0 pts** | Deduction |
| **Test Coverage** | Test runner coverage | **-1.0 pts** if <80% | **N/A policy** (*Ignored if unconfigured*) |

> **Hard Gate Rule**: If TypeScript syntax or compilation errors exist, the output is rejected immediately with a score of 0.0.
> **Pass Threshold**: A minimum score of **9.0 / 10.0** is required for output release.

---

## 🛠️ AST-Based Surgical Auto-Fixer (`agent-ego fix`)

The auto-fixer uses the **TypeScript Compiler AST API (`ts.transform`)**:
- **Side-Effect Preservation**: If a `console.log(foo())` contains a function call or expression with potential runtime side effects, it is **never** deleted — it is flagged as a warning.
- **Syntactic Context Safety**: In single-line branches like `if (x) console.log(y);`, replacing the statement safely creates an empty block (`{}`) so subsequent lines do not bind to the condition.
- **Rollback Mechanism**: The original content is preserved in memory. If post-transformation compilation produces diagnostic errors, the change is instantly rolled back.

---

## 👁️ Visual & Accessibility Inspector

Playwright audits operate on deterministic DOM metrics:
1. **CLS (Cumulative Layout Shift)**: Injects `PerformanceObserver` via `page.addInitScript` prior to document load to capture true layout shifts.
2. **Viewport Overflow**: Detects `document.documentElement.scrollWidth > window.innerWidth`.
3. **Accessibility**: Injects `@axe-core/playwright` to evaluate WCAG AA contrast and missing labels. *(Note: axe-core captures common DOM contrast & role issues; complex dynamic WebGL/canvas scenes require custom heuristics).*

---

## 🔒 Dashboard Security

The local laboratory dashboard (`src/dashboard/server.ts`):
- Binds strictly to **`127.0.0.1`** (loopback only; never `0.0.0.0`).
- **DNS Rebinding Defense**: Validates incoming `Host` header.
- **Cross-Site Hijacking Defense**: Rejects unauthorized `Origin` headers.
- **Session Security Token**: Generates a high-entropy 48-character cryptographic token upon startup.

---

## 💻 CLI Commands (12 Subcommands)

| Command | Description |
| :--- | :--- |
| `agent-ego audit <file>` | Audits file against deterministic rubric; blocks if score < 9.0 |
| `agent-ego fix <file>` | AST-based surgical repair of mechanical defects |
| `agent-ego slop <file>` | Dissects file for AI slop, placeholder DNA, and generic fluff |
| `agent-ego debate <goal>` | Multi-archetype war-room consensus analysis |
| `agent-ego squad <goal>` | Assembles domain squad and execution handoffs for a goal |
| `agent-ego wrap <prompt>` | Wraps user prompt into strict persona & domain constraints |
| `agent-ego memory [id]` | Displays persistent lessons learned from past rejections |
| `agent-ego list` | Lists all 17 domain archetypes |
| `agent-ego init` | Deploys AGENTS.md, Cursor rules, pre-commit hook, and CI workflow |
| `agent-ego dashboard` | Launches secure local laboratory web interface |
| `agent-ego watch [dir]` | Background file-watcher daemon |
| `agent-ego lab [dir]` | Launches dashboard and file-watcher concurrently |

---

## 📦 Antigravity Plugin Installation

To use `agent-ego` as a native plugin inside Google Antigravity:
1. Copy the bundled `plugin/` folder to your Antigravity plugin directory:
   ```bash
   cp -r plugin ~/.gemini/config/plugins/agent-ego-plugin
   ```
2. Antigravity will automatically load the plugin and enforce gatekeeper rules 24/7 across all sessions.

---

## 📄 License

MIT License. Copyright (c) 2026 Kapitan. See [LICENSE](LICENSE) for full details.
