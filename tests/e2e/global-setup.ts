import { config } from 'dotenv';
import path from 'node:path';
import { adminClient, seedItajai } from './fixtures/seed-helpers';

export default async function globalSetup() {
  config({ path: path.resolve(process.cwd(), '.env.test') });
  // eslint-disable-next-line no-console
  console.log('[global-setup] populando seed…');
  const ids = await seedItajai().popularCasas();
  // eslint-disable-next-line no-console
  console.log('[global-setup] seed criado:', ids);

  // Sanity check antes dos testes começarem.
  const { count } = await adminClient()
    .from('casas')
    .select('id', { count: 'exact', head: true })
    .like('nome', '%[SEED]%');
  // eslint-disable-next-line no-console
  console.log('[global-setup] casas [SEED] visíveis:', count);
}
