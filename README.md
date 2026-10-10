# 🧠 Agent Ego Engine (agent-ego)
> **Autonomous Human Temperament & Perfectionist Self-Critique Engine for AI Agents.**

Left unguided, AI agents naturally produce "lazy slop" — placeholders (`// TODO`), unstyled generic cards, and untested code.

**`agent-ego`** fixes this at the root. It injects **human pride, craft accountability, and visceral disgust** into AI agents. The agent self-evaluates its work through sensory inspection (code AST and Playwright headless browser rendering). If the work scores below the perfectionist threshold (**9.0/10**), the agent **refuses to show it to the user**, internally rants at itself, and re-executes until the output is immaculate.

---

## ⚡ The Architecture

```
[User Task]
     │
     ▼
1. 🎭 Archetype Selection (Frontend Lead, Backend Architect, Security CISO, Code Reviewer, Copy Editor)
     │
     ▼
2. ⚡ AI Generation (Drafting code / web component)
     │
     ▼
3. 👁️ Sensory Inspection (Code Inspector + Playwright Visual DOM rendering & screenshots)
     │
     ▼
4. 🛑 Disgust & Gatekeeper Calculator (Strict scoring against perfection criteria)
     ├─ Score < 9.0 (Disgust Level: Furious / Unacceptable)
     │    └──> 🔄 Output BLOCKED from user. Internal rant generated -> Re-execution loop.
     │
     └─ Score >= 9.0 (Disgust Level: None)
          └──> ✅ APPROVED. Delivered to user with zero back-and-forth required.
```

---

## 🚀 Quick Start & CLI Usage

### 1. Audit any file or component
```bash
# Automatically detects archetype and audits code
agent-ego audit src/user-service.ts

# Audit with Playwright visual rendering for HTML/React
agent-ego audit public/index.html --visual
```

### 2. Wrap user prompts with strict Archetype Mandates
```bash
agent-ego wrap "Create a payment checkout API with Stripe"
```

### 3. List available Human Archetypes
```bash
agent-ego list
```

### 4. Initialize Ego Gatekeeper in your project
```bash
agent-ego init
```

---

## 🎭 Built-in Human Archetypes

1. 🎨 **Awwwards Design & UI Architect** (`frontend-lead`):
   * Minimum Score: **9.0/10**
   * Disgust Triggers: Static boxes without micro-interactions, hardcoded hex colors, lazy bootstrap layouts.
2. ⚙️ **Distributed Systems & DB Architect** (`backend-architect`):
   * Minimum Score: **9.2/10**
   * Disgust Triggers: Unhandled promise rejections, N+1 query antipatterns, missing schema validations.
3. 🛡️ **Offensive Security Auditor** (`security-officer`):
   * Minimum Score: **9.5/10**
   * Disgust Triggers: String concatenation in SQL, hardcoded secrets, wildcard CORS, missing rate limiting.
4. 🔬 **Militant Senior Code Reviewer** (`code-reviewer`):
   * Minimum Score: **9.0/10**
   * Disgust Triggers: `any` types, missing unit tests, functions > 50 lines, dead code.
5. ✍️ **Pulitzer-Level Senior Copy Editor** (`copy-editor`):
   * Minimum Score: **9.0/10**
   * Disgust Triggers: AI clichés ("delve into", "tapestry"), robotic passive voice.

---

## 📦 Programmatic Usage

```typescript
import { EgoLoopEngine, ArchetypeRegistry } from 'agent-ego-engine';

const archetype = ArchetypeRegistry.get('frontend-lead');
const result = await EgoLoopEngine.evaluate({
  content: myComponentCode,
  archetype,
  isHtml: true,
  runVisualCheck: true
});

if (!result.passed) {
  console.log(`Blocked! Score: ${result.score}/10`);
  console.log(result.innerRant);
  // Feed result.instructionsForNextPass back into the agent!
}
```

---
*Created by Kapitan & Antigravity.*
