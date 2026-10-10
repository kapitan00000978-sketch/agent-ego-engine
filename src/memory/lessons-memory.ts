import * as fs from 'fs';
import * as path from 'path';
import { ArchetypeId } from '../types.js';

export interface LessonEntry {
  id: string;
  archetypeId: ArchetypeId;
  defectCategory: string;
  description: string;
  learnedRule: string;
  occurrences: number;
  lastUpdated: string;
}

export class LessonsMemory {
  private static storagePath = path.resolve(
    process.env.USERPROFILE || 'C:\\Users\\Kapitan',
    '.gemini/agent_manager/data/lessons_memory.json'
  );

  private static loadMemory(): Record<string, LessonEntry> {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    return {};
  }

  private static saveMemory(data: Record<string, LessonEntry>): void {
    try {
      const dir = path.dirname(this.storagePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save lessons memory:', e);
    }
  }

  /**
   * Records a defect as a learned lesson so the agent never repeats it
   */
  public static recordMistake(
    archetypeId: ArchetypeId,
    defectCategory: string,
    description: string,
    remedy: string
  ): void {
    const memory = this.loadMemory();
    const key = `${archetypeId}:${defectCategory}:${description.substring(0, 40)}`;

    if (memory[key]) {
      memory[key].occurrences += 1;
      memory[key].lastUpdated = new Date().toISOString();
    } else {
      memory[key] = {
        id: key,
        archetypeId,
        defectCategory,
        description,
        learnedRule: `Never repeat: "${description}". Mandatory standard: ${remedy}`,
        occurrences: 1,
        lastUpdated: new Date().toISOString()
      };
    }

    this.saveMemory(memory);
  }

  /**
   * Retrieves historical lessons for an archetype to inject into the active prompt
   */
  public static getLessonsForArchetype(archetypeId: ArchetypeId, limit = 5): LessonEntry[] {
    const memory = this.loadMemory();
    const entries = Object.values(memory).filter((e) => e.archetypeId === archetypeId);
    return entries.sort((a, b) => b.occurrences - a.occurrences).slice(0, limit);
  }

  /**
   * Formats lessons as bullet points for prompt injection
   */
  public static formatLessonsPrompt(archetypeId: ArchetypeId): string {
    const lessons = this.getLessonsForArchetype(archetypeId);
    if (lessons.length === 0) return '';

    const lines = lessons.map(
      (l, idx) => `${idx + 1}. [Remember past lesson]: ${l.learnedRule} (Flagged ${l.occurrences}x previously)`
    );

    return `\n## 🧬 HARD-EARNED LESSONS FROM PAST REJECTIONS (DO NOT REPEAT):\n${lines.join('\n')}\n`;
  }
}
