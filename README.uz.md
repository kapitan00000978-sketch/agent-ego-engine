# 🛡️ Agent Ego Engine (`agent-ego`) — O'zbekcha Qo'llanma
> **AI Agentlar uchun Deterministik Sifat Gatekeeperi va Kontekst Qobig'i.**
> [English version: README.md](README.md)

---

## ⚡ Tezkor Boshlash (30 Soniyada)

### O'rnatish
```bash
npm install -g agent-ego-engine
# Yoki to'g'ridan-to'g'ri npx orqali:
npx agent-ego audit src/index.ts
```

### Loyihani Initsializatsiya Qilish
Har qanday loyihada bitta buyruq orqali Antigravity, Cursor, Git hook va GitHub Actions fayllarini yarating:
```bash
agent-ego init
```

---

## 🔍 Before / After Taqqoslashi

### ❌ Oddiy AI Chiqarishi (Gatekeepersiz)
```typescript
// TODO: implement real logic later
export function authenticate(req: any) {
  try {
    const user = db.query("SELECT * FROM users WHERE id = " + req.id);
    return user;
  } catch (e) {} // yutilgan xato
}
```
* **Ball**: `2.5 / 10.0`
* **Xulosa**: ⛔ **FOYDALANUVCHIDAN BLOKLANDI**.

---

### ✅ Mukammal Natija (Agent Ego Gatekeeper orqali o'tgan)
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
      throw new AppError('USER_NOT_FOUND', 'Autentifikatsiya muvaffaqiyatsiz', 404);
    }
    return user;
  } catch (err: unknown) {
    logger.error('Ma\'lumotlar bazasi so\'rovi muvaffaqiyatsiz tugadi', { error: err });
    throw new AppError('AUTH_FAILURE', 'Tizim xatoligi', 500);
  }
}
```
* **Ball**: `10.0 / 10.0`
* **Xulosa**: ✅ **FOYDALANUVCHIGA CHIQARISHGA RUXSAT ETILDI**.

---

## ⚖️ Deterministik Ball Formulasi

| Tekshiruv | Dvigatel / Asbob | Ballga Ta'siri | Qoida |
| :--- | :--- | :--- | :--- |
| **Compiler Xatolari** | `tsc` sintaksis/tip diagnostikasi | **Ball = 0.0** | **Hard Gate** (Kechirilmaydi) |
| **Linter Xatolari** | ESLint xatoliklar soni | **Ball = 0.0** | **Hard Gate** (*Sozlanmagan bo'lsa N/A*) |
| **Blocker Nuqson** | Xavfsizlik teshigi / SQL qo'shilishi | **-2.5 ball** | Chegirma |
| **Critical Nuqson** | Yutilgan xatolar, tipdan qochish | **-1.5 ball** | Chegirma |
| **Accessibility (a11y)** | `axe-core` qoidabuzarliklari | **-0.5 ball** (-3.0 gacha) | Chegirma |
| **Visual CLS** | CLS > 0.1 | **-1.0 ball** | Chegirma |
| **Viewport Overflow** | `scrollWidth > clientWidth` | **-1.0 ball** | Chegirma |
| **Test Coverage** | Qamrov foizi | **-1.0 ball** (<80% bo'lsa) | **N/A siyosati** (*Sozlanmagan bo'lsa N/A*) |

---

## 📦 Antigravity Pluginini O'rnatish

Plaginni Google Antigravity ichida ishlatish:
```bash
cp -r plugin ~/.gemini/config/plugins/agent-ego-plugin
```

## 📄 Litsenziya

MIT License. Muallif: Kapitan (c) 2026.
