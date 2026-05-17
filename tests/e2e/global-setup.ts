import { config } from 'dotenv';
import path from 'node:path';
import { adminClient, seedItajai } from './fixtures/seed-helpers';

export default async function globalSetup() {
  config({ path: path.resolve(process.cwd(), '.env.test') });
  console.log('[global-setup] populando seed…');
  const ids = await seedItajai().popularCasas();
  console.log('[global-setup] seed criado:', ids);

  const { count } = await adminClient()
    .from('casas')
    .select('id', { count: 'exact', head: true })
    .like('nome', '%[SEED]%');
  console.log('[global-setup] casas [SEED] visíveis:', count);
}
