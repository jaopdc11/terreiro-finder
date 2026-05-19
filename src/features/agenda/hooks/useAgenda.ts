import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { AgendaRepository } from '../api/AgendaRepository';
import type { EventoAgenda, EventoAgendaInput } from '../domain/EventoAgenda';

const qk = (casaId: string) => ['agenda', casaId] as const;

function useAgendaRepo(): AgendaRepository {
  const { client } = useServices();
  return useMemo(() => new AgendaRepository(client), [client]);
}

export function useAgendaDaCasa(casaId: string | null | undefined) {
  const repo = useAgendaRepo();
  return useQuery({
    queryKey: qk(casaId ?? ''),
    queryFn: () => repo.listarDaCasa(casaId!),
    enabled: !!casaId,
  });
}

export function useAdicionarEvento(casaId: string) {
  const qc = useQueryClient();
  const repo = useAgendaRepo();
  return useMutation({
    mutationFn: (input: EventoAgendaInput) => repo.criar(casaId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(casaId) }),
  });
}

export function useEditarEvento(casaId: string) {
  const qc = useQueryClient();
  const repo = useAgendaRepo();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EventoAgendaInput }) =>
      repo.atualizar(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(casaId) }),
  });
}

export function useRemoverEvento(casaId: string) {
  const qc = useQueryClient();
  const repo = useAgendaRepo();
  return useMutation({
    mutationFn: (evento: EventoAgenda) => repo.excluir(evento.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(casaId) }),
  });
}
