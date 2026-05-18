import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import {
  CasasRepository,
  type NovaCasaDeDirigencia,
} from '@/features/casas/api/CasasRepository';
import { GeocodingService } from '@/shared/lib/GeocodingService';
import type { NovaCasaDeProprioInput } from '../schemas';

export function useCadastrarCasa() {
  const { client, sessao } = useServices();
  const repo = useMemo(() => new CasasRepository(client), [client]);
  const geo = useMemo(() => new GeocodingService(), []);

  return useMutation({
    mutationFn: async (input: NovaCasaDeProprioInput): Promise<string> => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Você precisa estar logada(o) pra cadastrar.');

      // Geocoding best-effort com endereço completo
      let lat: number | null = input.coord_lat ?? null;
      let lng: number | null = input.coord_lng ?? null;
      if (lat == null || lng == null) {
        const partes = [
          input.logradouro,
          input.numero,
          input.bairro,
          input.cidade,
          input.estado,
          'Brasil',
        ].filter((p): p is string => !!p && p.trim().length > 0);
        try {
          const r = await geo.buscar(partes.join(', '));
          if (r) {
            lat = r.coordenadas.lat;
            lng = r.coordenadas.lng;
          }
        } catch {
          // best-effort
        }
      }

      const payload: NovaCasaDeDirigencia = {
        nome: input.nome,
        sacerdote_nome: input.sacerdote_nome ?? null,
        tradicao_principal: input.tradicao_principal,
        descricao: input.descricao ?? null,
        texto_antes_visita: input.texto_antes_visita ?? null,
        logradouro: input.logradouro ?? null,
        numero: input.numero ?? null,
        complemento: input.complemento ?? null,
        bairro: input.bairro,
        cidade: input.cidade,
        estado: input.estado,
        cep: input.cep ?? null,
        coord_lat: lat,
        coord_lng: lng,
        status: 'pendente',
        fonte: 'proprio',
        endereco_visibilidade: input.endereco_visibilidade,
        aceita_visitantes: input.aceita_visitantes,
        foto_registro: input.foto_registro,
        whatsapp: input.whatsapp ?? null,
        telefone: input.telefone ?? null,
        email_contato: input.email_contato ?? null,
        site: input.site ?? null,
        canal_validacao: input.canal_validacao,
        papel_dirigencia_proposto: input.papel_dirigencia,
      };

      return repo.criarComoDirigencia(payload, sess.userId);
    },
  });
}
