// Navegador de quem entra como admin para de contar no analytics próprio:
// o index.html não carrega o script quando acha esta marca. Fica mesmo depois de sair.
export const MARCA_SEM_ANALYTICS = 'encruza-sem-analytics';

export function marcarSemAnalytics(): void {
  try {
    localStorage.setItem(MARCA_SEM_ANALYTICS, '1');
  } catch {
    // aba anônima ou armazenamento bloqueado: só não marca
  }
}
