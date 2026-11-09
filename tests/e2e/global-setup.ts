import { derrubarAmbiente, subirAmbiente } from '../setup/ambienteApi';
import { BancoTeste } from '../setup/BancoTeste';
import { SeedItajai } from '../setup/SeedItajai';
import { API_E2E, ORIGEM_E2E } from './ambiente';

/**
 * Sobe Postgres 17 (docker) + encruza-api e semeia as casas de Itajaí.
 * O que os workers precisam vai por process.env (o Playwright repassa).
 * A função devolvida é o teardown.
 */
export default async function globalSetup() {
  const { ambiente, processos } = await subirAmbiente({ origem: ORIGEM_E2E, portaApi: Number(new URL(API_E2E).port) });
  process.env.E2E_DB_URL = ambiente.dbUrl;
  process.env.E2E_LOG_API = ambiente.logApi;

  const banco = new BancoTeste(ambiente.dbUrl);
  const ids = await new SeedItajai(banco).popularCasas();
  await banco.fechar();
  console.log('[global-setup] seed criado:', ids);

  return () => derrubarAmbiente(processos);
}
