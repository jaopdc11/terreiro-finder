/**
 * Lighthouse-CI: gate de qualidade em PRs.
 *
 * Roda em duas configurações (mobile + desktop) via env `LIGHTHOUSE_PRESET`.
 * URLs testadas: Landing (`/`) e Sobre (`/sobre`). Não testamos `/mapa`
 * porque depende de Supabase rodando + Leaflet pesa em mobile (será
 * coberto separadamente quando virar gate específico).
 *
 * Critérios:
 *   Mobile  → performance ≥ 90, demais ≥ 95
 *   Desktop → todos ≥ 95
 */
const isDesktop = process.env.LIGHTHOUSE_PRESET === 'desktop';

const perfMin = isDesktop ? 0.95 : 0.9;

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm preview --port 4173 --strictPort',
      startServerReadyPattern: 'Local:',
      url: ['http://localhost:4173/', 'http://localhost:4173/sobre'],
      numberOfRuns: 3,
      settings: isDesktop ? { preset: 'desktop' } : {},
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: perfMin }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
