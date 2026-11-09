import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtempSync, openSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Sobe o ambiente real pros testes de integração e e2e:
 *   Postgres 17 num container descartável + encruza-api (build local).
 * A API fica em ENCRUZA_API_DIR (padrão: ../encruza-api, irmão deste repo).
 * Nada aqui toca em banco de dev nenhum.
 */

export interface Ambiente {
  apiUrl: string;
  dbUrl: string;
  /** Log da API: em NODE_ENV=test os links de e-mail saem aqui. */
  logApi: string;
  origem: string;
}

export interface Processos {
  container: string;
  api: ChildProcess;
}

export function portaLivre(): Promise<number> {
  return new Promise((ok, falha) => {
    const s = createServer();
    s.once('error', falha);
    s.listen(0, '127.0.0.1', () => {
      const endereco = s.address();
      const porta = typeof endereco === 'object' && endereco ? endereco.port : 0;
      s.close(() => ok(porta));
    });
  });
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function esperar(desc: string, tentativa: () => boolean | Promise<boolean>, ms = 60_000) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    try {
      if (await tentativa()) return;
    } catch {
      // ainda subindo
    }
    await dormir(500);
  }
  throw new Error(`timeout esperando ${desc}`);
}

export async function subirAmbiente(opcoes: { origem: string; portaApi?: number }): Promise<{
  ambiente: Ambiente;
  processos: Processos;
}> {
  const dirApi = path.resolve(process.env.ENCRUZA_API_DIR ?? path.resolve(process.cwd(), '..', 'encruza-api'));
  if (!existsSync(path.join(dirApi, 'package.json'))) {
    throw new Error(`encruza-api não encontrada em ${dirApi} (defina ENCRUZA_API_DIR)`);
  }

  const portaPg = await portaLivre();
  const container = `encruza-teste-${process.pid}-${portaPg}`;
  execFileSync('docker', [
    'run', '-d', '--rm', '--name', container,
    '-e', 'POSTGRES_PASSWORD=teste', '-e', 'POSTGRES_DB=encruza',
    '-p', `127.0.0.1:${portaPg}:5432`, 'postgres:17',
  ], { stdio: 'ignore' });
  const dbUrl = `postgresql://postgres:teste@127.0.0.1:${portaPg}/encruza`;
  await esperar('postgres', () => {
    execFileSync('docker', ['exec', container, 'pg_isready', '-U', 'postgres', '-d', 'encruza'], { stdio: 'ignore' });
    return true;
  });
  // pg_isready responde antes do initdb terminar o restart; folga curta.
  await dormir(1500);

  if (!existsSync(path.join(dirApi, 'dist', 'index.js')) || process.env.ENCRUZA_API_BUILD === '1') {
    execFileSync('npm', ['run', 'build'], { cwd: dirApi, stdio: 'inherit' });
  }

  const portaApi = opcoes.portaApi ?? (await portaLivre());
  const apiUrl = `http://localhost:${portaApi}`;
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    PORT: String(portaApi),
    DATABASE_URL: dbUrl,
    ORIGENS: opcoes.origem,
    URL_FRONT: opcoes.origem,
    URL_API: apiUrl,
    DIRETORIO_FOTOS: mkdtempSync(path.join(tmpdir(), 'encruza-fotos-')),
    RESEND_API_KEY: '',
    COOKIE_SEGURO: '0',
  };
  await esperar('migrations', () => {
    execFileSync('node', ['dist/infra/db/migrar.js'], { cwd: dirApi, env, stdio: 'ignore' });
    return true;
  });

  const logApi = path.join(mkdtempSync(path.join(tmpdir(), 'encruza-log-')), 'api.log');
  const saida = openSync(logApi, 'a');
  const api = spawn('node', ['dist/index.js'], { cwd: dirApi, env, stdio: ['ignore', saida, saida] });
  await esperar('API', async () => (await fetch(`${apiUrl}/saude`)).ok);

  return { ambiente: { apiUrl, dbUrl, logApi, origem: opcoes.origem }, processos: { container, api } };
}

export function derrubarAmbiente(p: Processos): void {
  p.api.kill('SIGTERM');
  try {
    execFileSync('docker', ['rm', '-f', p.container], { stdio: 'ignore' });
  } catch {
    // já saiu
  }
}

/** Último link de e-mail (confirmação/redefinição) mandado pra `email`, lido do log da API. */
export function ultimoLinkPara(logApi: string, email: string): string | null {
  const linhas = readFileSync(logApi, 'utf8').split('\n').reverse();
  for (const linha of linhas) {
    if (!linha.includes('"link"')) continue;
    try {
      const j: unknown = JSON.parse(linha);
      if (typeof j === 'object' && j !== null && 'para' in j && 'link' in j && j.para === email && typeof j.link === 'string') {
        return j.link;
      }
    } catch {
      // linha que não é JSON
    }
  }
  return null;
}
