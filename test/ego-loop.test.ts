import { EgoLoopEngine } from '../src/engine/ego-loop.js';
import { FrontendLeadArchetype } from '../src/archetypes/frontend-lead.js';
import { BackendArchitectArchetype } from '../src/archetypes/backend-architect.js';
import { ArchetypeRegistry } from '../src/archetypes/index.js';

async function runTests() {
  console.log('🧪 Starting Agent Ego Engine Tests...\n');

  // Test 1: Slop Code Rejection
  console.log('Test 1: Testing Slop Code Detection & Rejection...');
  const sloppyCode = `
    function processUser(id: any) {
      // TODO: implement database lookup later
      const api_key = "secret_123456789";
      console.log("Fetching user...");
      return null;
    }
  `;

  const backendArch = BackendArchitectArchetype;
  const result1 = await EgoLoopEngine.evaluate({
    content: sloppyCode,
    archetype: backendArch,
    fileName: 'user-service.ts'
  });

  console.log(`   Score: ${result1.score}/10`);
  console.log(`   Passed: ${result1.passed}`);
  console.log(`   Disgust Level: ${result1.disgustLevel}`);
  console.log(`   Defects count: ${result1.defects.length}`);

  if (result1.passed) {
    throw new Error('Test 1 Failed: Sloppy code was erroneously approved!');
  }
  if (result1.defects.length < 3) {
    throw new Error('Test 1 Failed: Expected at least 3 defects.');
  }
  console.log('   ✅ Test 1 Passed: Slop was ruthlessly rejected!\n');

  // Test 2: High-Quality Code Acceptance
  console.log('Test 2: Testing Clean Production Code Acceptance...');
  const cleanCode = `
    import { z } from 'zod';

    export const UserSchema = z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      name: z.string().min(2)
    });

    export type User = z.infer<typeof UserSchema>;

    export class UserService {
      constructor(private readonly db: DatabaseClient) {}

      public async findById(id: string): Promise<User | null> {
        const record = await this.db.query('SELECT id, email, name FROM users WHERE id = $1', [id]);
        if (!record) {
          return null;
        }
        return UserSchema.parse(record);
      }
    }
  `;

  const result2 = await EgoLoopEngine.evaluate({
    content: cleanCode,
    archetype: backendArch,
    fileName: 'clean-user-service.ts'
  });

  console.log(`   Score: ${result2.score}/10`);
  console.log(`   Passed: ${result2.passed}`);
  console.log(`   Disgust Level: ${result2.disgustLevel}`);

  if (!result2.passed) {
    throw new Error(`Test 2 Failed: Clean code was rejected with score ${result2.score}`);
  }
  console.log('   ✅ Test 2 Passed: Clean code scored >= 9.0 and was approved!\n');

  // Test 3: Archetype Auto-Detection
  console.log('Test 3: Testing Semantic Archetype Detection...');
  const arch1 = ArchetypeRegistry.detectFromPrompt('build a modern hero animation with tailwind');
  const arch2 = ArchetypeRegistry.detectFromPrompt('optimize postgres queries and add foreign keys');
  const arch3 = ArchetypeRegistry.detectFromPrompt('audit JWT authentication against OWASP vulnerabilities');

  if (arch1.id !== 'frontend-lead') throw new Error(`Expected frontend-lead, got ${arch1.id}`);
  if (arch2.id !== 'backend-architect') throw new Error(`Expected backend-architect, got ${arch2.id}`);
  if (arch3.id !== 'security-officer') throw new Error(`Expected security-officer, got ${arch3.id}`);

  console.log(`   Auto-detected correctly: ${arch1.id}, ${arch2.id}, ${arch3.id}`);
  console.log('   ✅ Test 3 Passed: Semantic detection working!\n');

  // Test 4: Online Marketing Cliché Rejection
  console.log('Test 4: Testing Marketing Cliché & Slop Rejection...');
  const lameMarketingCopy = `
    Welcome to our startup. In today's fast-paced digital world, our revolutionary all-in-one platform for all your needs seamlessly integrates.
  `;
  const growthArch = ArchetypeRegistry.get('growth-marketer');
  const result4 = await EgoLoopEngine.evaluate({
    content: lameMarketingCopy,
    archetype: growthArch,
    fileName: 'landing-copy.txt'
  });

  console.log(`   Marketing Score: ${result4.score}/10`);
  console.log(`   Passed: ${result4.passed}`);
  console.log(`   Disgust Level: ${result4.disgustLevel}`);
  if (result4.passed) {
    throw new Error('Test 4 Failed: Lame AI marketing clichés should have been rejected!');
  }
  console.log('   ✅ Test 4 Passed: Growth Marketer archetype rejected AI marketing fluff!\n');

  // Test 5: Verify all 14 archetypes across 6 domains
  const allArchetypes = ArchetypeRegistry.list();
  console.log(`Test 5: Verifying total domain archetypes loaded: ${allArchetypes.length}...`);
  if (allArchetypes.length < 14) {
    throw new Error(`Expected at least 14 archetypes, found ${allArchetypes.length}`);
  }
  console.log('   ✅ Test 5 Passed: All 14 professional domain archetypes active!\n');

  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! AGENT EGO ENGINE IS FULLY OPERATIONAL ACROSS ALL DOMAINS.');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
