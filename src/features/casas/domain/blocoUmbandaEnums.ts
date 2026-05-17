import { z } from 'zod';

export const umbandaSincretismo = z.enum(['nenhum', 'parcial', 'forte']);
export type UmbandaSincretismo = z.infer<typeof umbandaSincretismo>;

export const umbandaKardecismo = z.enum(['nenhuma', 'parcial', 'acentuada']);
export type UmbandaKardecismo = z.infer<typeof umbandaKardecismo>;

export const umbandaSacralizacao = z.enum(['sim', 'nao', 'parcial']);
export type UmbandaSacralizacao = z.infer<typeof umbandaSacralizacao>;

export const SINCRETISMO_LABEL: Record<UmbandaSincretismo, string> = {
  nenhum: 'Sem sincretismo',
  parcial: 'Sincretismo parcial',
  forte: 'Sincretismo forte',
};

export const KARDECISMO_LABEL: Record<UmbandaKardecismo, string> = {
  nenhuma: 'Sem influência kardecista',
  parcial: 'Influência kardecista parcial',
  acentuada: 'Influência kardecista acentuada',
};

export const SACRALIZACAO_LABEL: Record<UmbandaSacralizacao, string> = {
  sim: 'Sacralização ritual',
  nao: 'Sem sacralização',
  parcial: 'Sacralização parcial',
};

/** Sugestões de linhas trabalhadas — usuário pode adicionar livre também. */
export const LINHAS_TRABALHADAS_SUGERIDAS = [
  'caboclo',
  'pretovelho',
  'crianca',
  'marinheiro',
  'exu',
  'pombagira',
  'baiano',
  'boiadeiro',
  'cigana',
] as const;

export const LINHAGEM_SUGERIDA = [
  'branca',
  'tracada',
  'omoloco',
  'paimanequense',
] as const;
