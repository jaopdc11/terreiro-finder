import { config } from 'dotenv';
import path from 'node:path';

export default async function globalSetup() {
  config({ path: path.resolve(process.cwd(), '.env.test') });
}
