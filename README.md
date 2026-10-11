# 🛡️ Agent Ego Engine (`agent-ego`)
> **Deterministic Quality Gatekeeper & Context Wrapper for AI Agents.**

Left unguided, LLMs produce unverified code: missing types, swallowed exceptions, broken viewport layouts, and superficial placeholders.

**`agent-ego`** is NOT a psychological intervention. LLMs do not possess psychological states. Instead, `agent-ego` operates as a **two-phase engineering gatekeeper**:
1. **Pre-execution Context Wrapper**: Injects strict domain invariants, constraints, and non-negotiable boundaries into the agent's prompt.
2. **Post-execution Deterministic Gatekeeper**: Evaluates outputs through deterministic static inspection, AST parsing, and browser runtime verification.

---

## ⚖️ Deterministic Scoring Rubric & Hard Gates

The evaluation is based on concrete, machine-verifiable weights:

| Check | Tool / Engine | Impact on Score | Rule Type |
| :--- | :--- | :--- | :--- |
| **Compiler Errors** | `tsc` compile diagnostics | **Score = 0.0** | **Hard Gate** (Zero tolerance) |
| **Linter Errors** | ESLint error count | **Score = 0.0** | **Hard Gate** (Zero tolerance) |
| **Blocker Defect** | Security vulnerability / SQL concatenation | **-2.5 pts** | Deduction |
| **Critical Defect** | Swallowed exceptions, type evasion | **-1.5 pts** | Deduction |
| **Accessibility (a11y)** | `axe-core` violations | **-0.5 pts** (up to -3.0) | Deduction |
| **Visual Stability** | CLS > 0.1 (via `PerformanceObserver`) | **-1.0 pts** | Deduction |
| **Viewport Overflow** | `scrollWidth > clientWidth` | **-1.0 pts** | Deduction |
| **Test Coverage** | Test runner coverage | **-1.0 pts** if <80% | **N/A policy** (Ignored if not configured) |

> **Hard Gate Rule**: If TypeScript syntax or compilation errors exist, the output is rejected immediately with a score of 0.0 regardless of other metrics.
> **Pass Threshold**: A minimum score of **9.0 / 10.0** is required for output approval.

---

## 🛠️ AST-Based Surgical Auto-Fixer (`agent-ego fix`)

The auto-fixer uses the **TypeScript Compiler AST API (`ts.transform`)**:
- **Side-Effect Preservation**: If a `console.log(foo())` contains a function call or expression with potential runtime side effects, it is **never** deleted — it is flagged as a warning.
- **Syntactic Context Safety**: In single-line branches like `if (x) console.log(y);`, replacing the statement safely creates an empty block (`{}`) so subsequent lines do not accidentally bind to the condition.
- **Rollback Mechanism**: The original content is preserved in memory. If post-transformation compilation produces diagnostic errors, the change is instantly rolled back.

---

## 👁️ Visual Inspector Metrikalari

Playwright orqali amalga oshiriladigan vizual audit quyidagi aniq metrikalarga tayanadi:
1. **CLS (Cumulative Layout Shift)**: Sahifa yuklanishidan oldin `page.addInitScript` orqali `PerformanceObserver` inyeksiya qilinadi va haqiqiy layout siljishlari o'lchanadi.
2. **Viewport Overflow**: `document.documentElement.scrollWidth > window.innerWidth` orqali gorizontal buzilishlar tekshiriladi.
3. **Accessibility**: `axe-core` orqali DOM atributlari va kontrast tahlil qilinadi. *(Eslatma: Axe-core kontrast muammolarining bir qismini ushlaydi, murakkab dynamic canvas yoki gradientlar inson nazoratini talab qiladi).*

---

## 🔒 Dashboard Xavfsizligi

Mahalliy panel (`src/dashboard/server.ts`):
- Faqat **`127.0.0.1`** (loopback) ga bog'langan (`0.0.0.0` ochiq emas).
- **DNS Rebinding Himoyasi**: `Host` header qat'iy tekshiriladi.
- **Cross-Site Hijacking Himoyasi**: `Origin` header tekshiriladi.
- **Session Token**: Ishga tushganda 48-belgili tasodifiy kriptografik token generatsiya qilinadi.

---

## 💻 CLI Buyruqlari (Jami 12 ta)

| Buyruq | Tavsif |
| :--- | :--- |
| `agent-ego audit <file>` | Faylni gatekeeper rubrikasi bo'yicha baholaydi |
| `agent-ego fix <file>` | AST orqali mexanik xatolarni xavfsiz tozalaydi |
| `agent-ego slop <file>` | Koddagi AI qoliplari va zaifliklar DNK sini tekshiradi |
| `agent-ego debate <goal>` | Arxetiplar o'rtasida konsensus tahlili o'tkazadi |
| `agent-ego squad <goal>` | Loyiha uchun arxetiplar jamoasini shakllantiradi |
| `agent-ego wrap <prompt>` | Promptni qat'iy domain invariantlariga o'raydi |
| `agent-ego memory [id]` | Tarixiy xatolar xotirasini ko'rsatadi |
| `agent-ego list` | 17 ta domain arxetiplari ro'yxatini chiqaradi |
| `agent-ego init` | Loyihaga `.agents/rules/ego-gatekeeper.md` ni joylaydi |
| `agent-ego dashboard` | Xavfsiz mahalliy laboratoriya veb-panelini ishga tushiradi |
| `agent-ego watch [dir]` | Papkani fonda kuzatuvchi daemon |
| `agent-ego lab [dir]` | Dashboard va Auto-Watcher'ni birgalikda ishga tushiradi |

---

## 📦 Sinovdan o'tkazish

```bash
# Barcha testlarni ishga tushirish:
npm test

# AST Auto-fixer testlari:
npx tsx test/auto-fixer.test.ts
```
