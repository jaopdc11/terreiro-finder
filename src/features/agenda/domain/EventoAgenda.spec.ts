import { describe, it, expect } from 'vitest';
import { DomainError } from '@/shared/lib/errors';
import { EventoAgenda } from './EventoAgenda';

const baseRow = {
  id: '00000000-0000-0000-0000-000000000001',
  casa_id: '00000000-0000-0000-0000-00000000aaaa',
  tipo: 'gira' as const,
  titulo: 'Pretos-Velhos',
  dia_semana: 1 as const, // segunda
  semanas_do_mes: null as number[] | null,
  data: null,
  data_texto: null,
  horario_inicio: '19:00',
  horario_fim: '22:00',
  descricao: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

describe('EventoAgenda', () => {
  describe('fromRow', () => {
    it('aceita gira válida', () => {
      const e = EventoAgenda.fromRow(baseRow);
      expect(e.ehGira()).toBe(true);
      expect(e.titulo).toBe('Pretos-Velhos');
      expect(e.diaSemana).toBe(1);
    });

    it('aceita evento com data', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        tipo: 'evento',
        titulo: 'Festa de Iemanjá',
        dia_semana: null,
        data: '2026-02-02',
      });
      expect(e.ehEvento()).toBe(true);
      expect(e.data).toBe('2026-02-02');
    });

    it('aceita evento com data_texto (sem data certa)', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        tipo: 'evento',
        titulo: 'Saída de iaô',
        dia_semana: null,
        data: null,
        data_texto: 'Fevereiro/2026',
      });
      expect(e.dataTexto).toBe('Fevereiro/2026');
    });

    it('rejeita row inválida', () => {
      expect(() =>
        EventoAgenda.fromRow({ ...baseRow, dia_semana: 99 }),
      ).toThrow(DomainError);
    });
  });

  describe('descricaoQuando', () => {
    it('formata gira com horário inteiro', () => {
      const e = EventoAgenda.fromRow(baseRow);
      expect(e.descricaoQuando()).toBe('Toda segunda às 19h');
    });

    it('formata gira com minutos', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        dia_semana: 6, // sábado
        horario_inicio: '20:30',
      });
      expect(e.descricaoQuando()).toBe('Toda sábado às 20h30');
    });

    it('formata gira sem horário', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        horario_inicio: null,
        horario_fim: null,
      });
      expect(e.descricaoQuando()).toBe('Toda segunda');
    });

    it('formata gira em 1ª semana do mês', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        titulo: 'Caboclo',
        semanas_do_mes: [1],
      });
      expect(e.descricaoQuando()).toBe('1ª segunda às 19h');
    });

    it('formata gira em 1ª e 3ª semana', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        semanas_do_mes: [3, 1],
      });
      // sort interno em fromRow garante ordem
      expect(e.descricaoQuando()).toBe('1ª e 3ª segunda às 19h');
    });

    it('formata gira em 3 semanas (vírgula + e)', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        semanas_do_mes: [1, 2, 4],
      });
      expect(e.descricaoQuando()).toBe('1ª, 2ª e 4ª segunda às 19h');
    });

    it('formata evento com data', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        tipo: 'evento',
        titulo: 'Festa',
        dia_semana: null,
        data: '2026-02-02',
        horario_inicio: '18:00',
      });
      expect(e.descricaoQuando()).toBe('02/02/2026 às 18h');
    });

    it('formata evento com data_texto', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        tipo: 'evento',
        titulo: 'Festa',
        dia_semana: null,
        data: null,
        data_texto: 'Fevereiro/2026',
        horario_inicio: null,
        horario_fim: null,
      });
      expect(e.descricaoQuando()).toBe('Fevereiro/2026');
    });
  });

  describe('descricaoHorario', () => {
    it('mostra janela quando há início e fim', () => {
      const e = EventoAgenda.fromRow(baseRow);
      expect(e.descricaoHorario()).toBe('19h às 22h');
    });

    it('mostra só início quando não há fim', () => {
      const e = EventoAgenda.fromRow({ ...baseRow, horario_fim: null });
      expect(e.descricaoHorario()).toBe('19h');
    });

    it('vazio quando sem horário', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        horario_inicio: null,
        horario_fim: null,
      });
      expect(e.descricaoHorario()).toBe('');
    });
  });

  describe('jaPassou', () => {
    it('evento com data passada → true', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        tipo: 'evento',
        dia_semana: null,
        data: '2020-01-01',
        titulo: 'Antiga',
      });
      expect(e.jaPassou(new Date('2026-05-18'))).toBe(true);
    });

    it('evento com data futura → false', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        tipo: 'evento',
        dia_semana: null,
        data: '2027-01-01',
        titulo: 'Futura',
      });
      expect(e.jaPassou(new Date('2026-05-18'))).toBe(false);
    });

    it('gira nunca passa', () => {
      const e = EventoAgenda.fromRow(baseRow);
      expect(e.jaPassou(new Date('2100-01-01'))).toBe(false);
    });

    it('evento sem data nunca passa', () => {
      const e = EventoAgenda.fromRow({
        ...baseRow,
        tipo: 'evento',
        dia_semana: null,
        data: null,
        data_texto: 'Em breve',
      });
      expect(e.jaPassou(new Date('2100-01-01'))).toBe(false);
    });
  });
});
