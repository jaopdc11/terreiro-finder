import type { TestProject } from 'vitest/node';
import { derrubarAmbiente, subirAmbiente } from './ambienteApi';

declare module 'vitest' {
  export interface ProvidedContext {
    apiUrl: string;
    dbUrl: string;
    logApi: string;
    origem: string;
  }
}

export default async function setup(project: TestProject) {
  const { ambiente, processos } = await subirAmbiente({ origem: 'http://localhost:5173' });
  project.provide('apiUrl', ambiente.apiUrl);
  project.provide('dbUrl', ambiente.dbUrl);
  project.provide('logApi', ambiente.logApi);
  project.provide('origem', ambiente.origem);
  return () => derrubarAmbiente(processos);
}
