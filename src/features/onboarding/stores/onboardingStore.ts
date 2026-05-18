import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Bifurcacao = 'visitante' | 'dirigencia';

interface OnboardingState {
  passo: number;
  bifurcacao: Bifurcacao | null;
  concluido: boolean;
  avancar(): void;
  voltar(): void;
  escolherBifurcacao(b: Bifurcacao): void;
  pular(): void;
  concluir(): void;
  reset(): void;
}

const PASSO_FINAL = 2;

/**
 * Onboarding é estado plano com persistência local — Zustand puro
 * (sem domínio que justifique classe wrapper).
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      passo: 0,
      bifurcacao: null,
      concluido: false,
      avancar: () => set((s) => ({ passo: Math.min(PASSO_FINAL, s.passo + 1) })),
      voltar: () => set((s) => ({ passo: Math.max(0, s.passo - 1) })),
      escolherBifurcacao: (b) => set({ bifurcacao: b }),
      pular: () => set({ concluido: true }),
      concluir: () => {
        const estado = get();
        if (estado.bifurcacao === null) return;
        set({ concluido: true });
      },
      reset: () => set({ passo: 0, bifurcacao: null, concluido: false }),
    }),
    {
      name: 'encruza.onboarding',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
