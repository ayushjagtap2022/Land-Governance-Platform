import { createClient } from '../src';

async function main() {
  // 1. Initialize client
  const client = createClient({
    baseUrl: 'http://127.0.0.1:8000/api/v1',
  });

  // 2. Health check
  const health = await client.health.check();
  console.log('System Status:', health);

  // 3. User Login
  try {
    const auth = await client.auth.login({
      email: 'officer@dolr.gov.in',
      password: 'SecurePassword123!',
    });
    console.log('Logged in as:', auth.user.full_name, `[Role: ${auth.user.role}]`);

    // 4. Search Central Repository
    const docs = await client.repository.list({
      query: 'cadastral drone survey',
      state: 'Maharashtra',
      search_mode: 'semantic',
    });
    console.log(`Found ${docs.length} matching policy documents.`);
    if (docs[0]) {
      console.log('Top match:', docs[0].title, `(Ref: ${docs[0].ref_id})`);
    }

    // 5. Query Conversational Policy Assistant (RAG)
    const ragAnswer = await client.assistant.chat('What is the mandatory spatial accuracy for SVAMITVA drone surveys?');
    console.log('\nAI Policy Brief:');
    ragAnswer.bullets.forEach((b) => console.log(' •', b));
    console.log('Citations:', ragAnswer.citations.map((c) => `${c.title} (p.${c.page})`));
  } catch (error: any) {
    console.error('API Error:', error.message);
  }
}

main();
