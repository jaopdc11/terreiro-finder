import { beforeEach, describe, expect, it } from 'vitest';
import { useOnboardingStore } from './onboardingStore';

beforeEach(() => {
  useOnboardingStore.getState().reset();
  localStorage.clear();
});

describe('onboardingStore', () => {
  it('começa no passo 0, sem bifurcação, não concluído', () => {
    const s = useOnboardingStore.getState();
    expect(s.passo).toBe(0);
    expect(s.bifurcacao).toBeNull();
    expect(s.concluido).toBe(false);
  });

  it('avancar incrementa até o passo final 2', () => {
    const s = useOnboardingStore.getState();
    s.avancar();
    s.avancar();
    s.avancar();
    expect(useOnboardingStore.getState().passo).toBe(2);
  });

  it('voltar não vai abaixo de zero', () => {
    useOnboardingStore.getState().voltar();
    expect(useOnboardingStore.getState().passo).toBe(0);
  });

  it('escolherBifurcacao salva a escolha sem avançar sozinho', () => {
    useOnboardingStore.getState().escolherBifurcacao('dirigencia');
    expect(useOnboardingStore.getState().bifurcacao).toBe('dirigencia');
    expect(useOnboardingStore.getState().passo).toBe(0);
  });

  it('pular conclui mesmo sem bifurcação', () => {
    useOnboardingStore.getState().pular();
    expect(useOnboardingStore.getState().concluido).toBe(true);
  });

  it('concluir exige bifurcação antes', () => {
    useOnboardingStore.getState().concluir();
    expect(useOnboardingStore.getState().concluido).toBe(false);
    useOnboardingStore.getState().escolherBifurcacao('visitante');
    useOnboardingStore.getState().concluir();
    expect(useOnboardingStore.getState().concluido).toBe(true);
  });

  it('persiste no localStorage com a chave do projeto', () => {
    useOnboardingStore.getState().escolherBifurcacao('visitante');
    useOnboardingStore.getState().concluir();
    const raw = localStorage.getItem('terreiros.onboarding');
    expect(raw).toBeTruthy();
    const persisted = JSON.parse(raw ?? '{}');
    expect(persisted.state.concluido).toBe(true);
  });
});
