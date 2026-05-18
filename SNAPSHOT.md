# Snapshot do projeto

Estado em **2026-05-18 00:18 -0300**.

## Tempo de desenvolvimento

- **Início:** 2026-05-17 13:35:17 -0300 (commit `chore: bootstrap Fase 0 + Fase 1`)
- **Último commit:** 2026-05-18 00:18:00 -0300 (commit `feat: rótulo de foto, link de site, e toggle do mapa`)
- **Tempo de calendário (wall-clock):** ~10h43min em uma única sessão corrida
- **Total de commits:** 36

> Wall-clock inclui pausas, leitura de docs e discussão. Tempo de digitação efetiva é menor.

## Onde paramos

### Última ação completa
Commit `8d84742` — três ajustes pequenos:
1. "Foto parcial" renomeado para "Foto com restrições" (badge, painel, wizard).
2. Campo **Site da casa** adicionado:
   - Migration `0012_casa_site.sql` (coluna `site text` em `casas`).
   - Zod schemas atualizados (`casaRowSchema`, `cadastroSchema`).
   - `Contato` VO ganhou propriedade `site` (não conta como contato direto).
   - `PerfilCasaInput` + `NovaCasaDeDirigencia` incluem `site`.
   - Input no wizard (passo 3) e no painel (aba Perfil).
   - Card "Site da casa" na ficha pública.
3. Clicar de novo no card já ativo (na aside do `/mapa`) **deseleciona e reseta o zoom** pro centro de Itajaí (via `resetTicker` + componente interno `ResetDoMapa`).

### Bloqueio pendente
Usuário reportou "cade os terreiros" logo após o commit. Suspeita:
- Migration `0012_casa_site.sql` ainda não foi aplicada localmente.
- `CasasRepository.CAMPOS_SELECT` já inclui `site`, então o Postgres responde `column "site" does not exist` e a lista vem vazia.

**Próximo passo do usuário:** rodar `supabase db reset` (ou `supabase migration up`) para aplicar a migration 0012.

## O que está pronto

### Fases finalizadas (do plano original)
- Fase 0 + 1: bootstrap, schema, auth, domínio
- Fase 2: busca + mapa + ficha pública + advisor fixes
- Fase 3: indicação visitante + admin moderation
- Fase 4: cadastro de conta de dirigência + painel + reivindicação + cadastro direto (com contato cruzado)
- Fase 5 (parcial): polimento, a11y, blocos por tradição, favoritos, design rework

### Tarefas concluídas no #88 (Design rework)
Tentativas até calibrar:
1. ~~Brutalista com cards sem-sombra~~ — usuário: "quase igual"
2. ~~Minimalista geométrico radical~~ — usuário: "ta uma bosta"
3. ~~Brutalista uppercase tracking-widest~~ — usuário: "isso parece site profissional?"
4. **Linear/Vercel-like** — usuário: "começou a ficar bom"
5. **+ Identidade afro abstrata** (ornamentos geométricos, citação editorial, hero gradient terra) — bem aceito
6. **+ Tom formal de português** (sem "Salve", "tu", "manda pra gente") — bem aceito
7. **+ Split layout no `/mapa`** (aside lateral + mapa) — aceito
8. **+ Card seleciona pin (não navega)** + voltar ao mapa na ficha — bem aceito ("bom dms")

### Componentes / pages chave do estado atual
- `src/shared/components/Marca.tsx` — ponto pemba com anel cinza (logotipo)
- `src/shared/components/ornamentos/Ornamentos.tsx` — Riscos, Trama, Encontro, PontosGrade, FioComNo, Arco
- `src/app/pages/Landing.tsx` — `/` agora é landing page (hero + mock + manifesto + features + princípios + CTA)
- `src/features/busca/pages/Buscar.tsx` — `/mapa` com split layout (aside 24rem + mapa) dentro do container
- Header sticky claro com backdrop-blur, navegação sentence-case com `Mapa` + `Indicar` + `Sobre`
- Footer Linear-like grid 12 cols
- `.eyebrow-ornado`, `.display-serif`, `.hero-gradient`, `.card-soft` como utilities reutilizáveis
- Popup do Leaflet com CSS overrides + componente JSX com identidade

## Tarefas pendentes (gates manuais — dependem de credenciais externas)

| # | Tarefa |
|---|---|
| #85 | SMTP externo (Resend) no Supabase Auth prod |
| #86 | Analytics privacy-friendly (Plausible ou Umami) |
| #87 | Lighthouse-CI mobile ≥90 |

## Verificação local atual

- `pnpm exec tsc --noEmit` — verde
- `pnpm lint` — verde
- `pnpm test:unit` — 114 testes verdes
- `pnpm test:integration` e `pnpm test:e2e` — não rodados nesta sessão (Docker sem permissão na máquina; usuário aplica em ambiente próprio)

## Migrations pendentes de aplicar
- `0010_drop_tambor_de_mina.sql`
- `0011_quimbanda_raiz_linhagem.sql`
- `0012_casa_site.sql` ← **necessária para o `/mapa` voltar a listar casas**
