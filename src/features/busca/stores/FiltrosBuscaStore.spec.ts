import { beforeEach, describe, expect, it } from 'vitest';
import { FiltrosBuscaStore } from './FiltrosBuscaStore';
import { FiltrosBusca } from '../domain/FiltrosBusca';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('FiltrosBuscaStore', () => {
  it('começa vazio', () => {
    const store = new FiltrosBuscaStore();
    expect(store.atual().estaVazio()).toBe(true);
  });

  it('aplicar atualiza estado e URL', () => {
    const store = new FiltrosBuscaStore();
    const f = FiltrosBusca.vazio().comTradicao('umbanda').comCidade('Itajaí');
    store.aplicar(f);
    expect(store.atual().tradicao).toBe('umbanda');
    expect(window.location.search).toContain('tradicao=umbanda');
    expect(window.location.search).toContain('cidade=Itaja');
  });

  it('aplicar com filtros vazios limpa a URL', () => {
    const store = new FiltrosBuscaStore();
    store.aplicar(FiltrosBusca.vazio().comTradicao('umbanda'));
    store.aplicar(FiltrosBusca.vazio());
    expect(window.location.search).toBe('');
  });

  it('sincronizarComUrl lê filtros da URL existente', () => {
    window.history.replaceState(null, '', '/?tradicao=candomble&cidade=Itaja%C3%AD');
    const store = new FiltrosBuscaStore();
    store.sincronizarComUrl();
    expect(store.atual().tradicao).toBe('candomble');
    expect(store.atual().cidade).toBe('Itajaí');
  });

  it('sincronizarComUrl é idempotente', () => {
    const store = new FiltrosBuscaStore();
    store.sincronizarComUrl();
    store.sincronizarComUrl();
    expect(store.atual().estaVazio()).toBe(true);
  });
});
