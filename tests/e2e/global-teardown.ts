import { config } from 'dotenv';
import path from 'node:path';
import { seedItajai } from './fixtures/seed-helpers';

export default async function globalTeardown() {
  config({ path: path.resolve(process.cwd(), '.env.test') });
  await seedItajai().limpar();
}
