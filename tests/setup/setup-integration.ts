import { config } from 'dotenv';
import path from 'node:path';

// Carrega .env.test antes de qualquer teste de integração.
config({ path: path.resolve(process.cwd(), '.env.test') });
