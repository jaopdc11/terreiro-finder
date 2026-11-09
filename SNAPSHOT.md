# Snapshot — fim de 2026-05-18

> Continuar daqui na próxima sessão. Banco local preservado (não dar `db reset`).

## Onde paramos exatamente

**Setup Supabase Cloud em andamento** — projeto criado, falta configurar SMTP no Dashboard, aplicar migrations e adicionar GitHub Secrets.

- **Project ref:** `mtkithxshskxgqkzfrpi`
- **Project URL:** `https://mtkithxshskxgqkzfrpi.supabase.co`
- **Anon key:** já salva no chat (`eyJ...P3_1R7dylg1iXA8N0ZyUJzWwGup7Ryi0wYOVlenIjw8`)

### Próximos passos manuais (tu faz amanhã antes de me chamar)

1. **SMTP no Dashboard** → Authentication → Settings → SMTP Settings → Enable Custom SMTP
   - Sender email: `noreply@encruza.jaopd.dev`
   - Sender name: `Encruza`
   - Host: `smtp.resend.com` · Port: `587` · Username: `resend`
   - Password: API key Resend
2. **URL Configuration** → Site URL: `https://encruza.jaopd.dev` · Redirect URLs: `https://encruza.jaopd.dev/**`
3. **Aplicar migrations no banco prod** (terminal local):
   ```
   supabase link --project-ref mtkithxshskxgqkzfrpi
   supabase db push
   ```
   Senha do banco entra interativamente (não cola no chat).
4. **GitHub Secrets** (repo → Settings → Secrets → Actions):
   - `VITE_SUPABASE_URL` = `https://mtkithxshskxgqkzfrpi.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = anon key
5. Criar conta admin via **SQL Editor** do Dashboard (eu te passo o SQL).
6. Cadastrar 2-3 casas reais antes de divulgar.
7. **API key Resend exposta neste chat — revogar e gerar nova depois.**

---

## O que rolou na sessão (2026-05-17 + 18)

### Commit já feito (`cb7bc0a`)

- Rebrand "terreiros" → **Encruza** (UI, meta, package, user-agent, storage keys, e-mail)
- Tridente 🔱 + favicon SVG + token `--terra-ouro`
- Multi-cidade: `MapaCasas` com `fitBounds` (fallback Brasil), wizard/indicar sem `defaultValue=Itajaí`, eyebrow dinâmico
- Lighthouse-CI configurado (matrix mobile+desktop)
- SMTP Resend em `supabase/config.toml` (enabled=false, lê env)
- Fix migration `0010` (faltava migrar `indicacoes_casa` no enum reset)
- Fix 2 specs de integração (campo `site` em fixtures)

### Não-commitado ainda (40+ arquivos modificados / novos)

#### Feature: Agenda da casa
- Migration `0013_casa_agenda.sql` — tabela com tipo (gira/evento), dia_semana, data, data_texto, RLS
- Migration `0014_casa_agenda_semanas.sql` — `semanas_do_mes smallint[]` pra rotação mensal
- Domínio: `src/features/agenda/` (entity, schemas Zod, repository, hooks)
- UI: `AbaAgenda.tsx` (criar + editar + remover gira/evento, pílulas pra semana do mês)
- Ficha pública: `CardAgendaCasa.tsx` (giras + próximos eventos + sem data confirmada)
- Testes: unit (16) + integração (7) + e2e (1)

#### Feature: "Perto de mim" (geolocalização)
- `src/shared/lib/distancia.ts` — Haversine + `formataDistancia` + spec
- `src/features/busca/hooks/useGeolocalizacao.ts` — orquestra browser API com tradução PT de erros
- `src/features/busca/components/ModalPermissaoGeo.tsx` — modal de consentimento PT antes do prompt nativo
- `pinVoceAqui` em `PinIcons.ts` (círculo azul)
- Botão "Perto de mim" no `Buscar.tsx` + sort por distância + label "a X km de você"
- `MapaCasas` aceita prop `localizacaoUsuario`, centraliza em zoom 14 quando ativo

#### Feature: ViaCEP no form de endereço
- `src/shared/lib/ViaCepClient.ts` + spec
- `src/shared/hooks/useEnderecoPorCep.ts` (TanStack Query, cache 24h)
- `src/shared/lib/cep.ts` — `formatarCep` (máscara `88308-600`) + spec
- `AbaEndereco.tsx` e `PassoEndereco.tsx`: CEP no topo, autocomplete, geocode automático
- **Fix sutil em `ViaCepClient` e `GeocodingService`**: `fetch` precisa de wrapping `(...args) => fetch(...args)` pra preservar `this=globalThis` em browser

#### Feature: Mapa interativo no AbaEndereco
- `MapaSeletorPino.tsx` — mini-mapa Leaflet com pin arrastável (substitui inputs lat/lng numéricos)
- Pin do geocode automático aparece, usuário arrasta pra ajustar

#### Refatorações de UI
- **Painel layout**: abas sticky (top-14 abaixo do header global), coluna lateral vazia removida
- Lista de casas no painel: cards com border arredondado + hover sutil + botão "Cadastrar outra casa" (suporte a N casas)
- Header: removida condição `mostrarCadastrar = ... && casas.length === 0` (sempre mostra "Cadastrar casa" pra autenticados)

#### Auth UX
- `AuthService.ts`: helper `traduzirErroAuth` mapeia ~12 mensagens cruas do Supabase pra PT-BR ("Invalid login credentials" → "E-mail ou senha incorretos.")

#### Combobox de papel dirigência
- `src/shared/ui/combobox.tsx` — substitui `<datalist>` HTML por dropdown estilizado
- `sugestoesPapel.ts` refatorado: cada termo mapeado às tradições aplicáveis
- Babalorixá/Iyalorixá só aparecem com Candomblé selecionado, Tata Quimbanda só com Quimbanda, etc

#### Remove "MVP" da UI (jargão)
- Landing eyebrow: "MVP · Itajaí / SC" → "Itajaí · SC"
- Footer: "MVP Itajaí/SC." → "Itajaí (SC)."

#### Testes E2E sincronizados
- Storage key `terreiros.onboarding` → `encruza.onboarding` em todos specs
- Smoke spec ajustado (logo agora usa Inter, não Fraunces)

---

## Estado do banco local

### Casas (4)
| Slug | Status | Tradição |
|---|---|---|
| `tenda-pai-joao` | aprovada | umbanda |
| `ile-ase-de-oxossi` | aprovada | candomble |
| `casa-indicada-fazenda` | aprovada | umbanda |
| `casa-pendente-quimbanda` | pendente | quimbanda |

> Slugs sem marker `[SEED]` — testes E2E não vão limpá-las.

### Usuários (3, senha `senha123`)
| Email | Role | Vinculado a |
|---|---|---|
| `admin@encruza.dev` | admin | — |
| `dirigente@encruza.dev` | dirigente | Tenda Pai João |
| `visitante@encruza.dev` | visitante | — |

### Migrations aplicadas (14)
`0001_init` → `0014_casa_agenda_semanas`. Local up-to-date.

---

## Verificação local

- `pnpm typecheck` ✓
- `pnpm lint` ✓
- `pnpm test:unit` — 151 verdes
- `pnpm test:integration` — 75 verdes (último run; rodar de novo após mudanças)
- `pnpm test:e2e` — NÃO rodado full nesta sessão (só `agenda.spec` e `smoke.spec`)
- `pnpm build` — funciona, mas bundle JS é **932 KB num chunk só** (Vite avisa)

---

## Pendências técnicas pra ficar "produto"

### Bloqueia ir ao ar
1. Setup Supabase Cloud (em andamento, ver topo)
2. SMTP em prod (depende #1)
3. Conta admin em prod (depende #1)
4. DNS apontando pro hosting (GitHub Pages)
5. Pelo menos 2-3 casas reais

### Polish técnico
6. **Code-split do Leaflet** — `lazy()` em `/mapa` tira ~250-350 KB do first paint. Lighthouse mobile vai cobrar.
7. **Meta OG tags + favicon PNG fallback** — link no WhatsApp aparece feio sem.
8. **Sentry DSN em prod** — SDK integrado, falta DSN no GitHub Secrets.
9. **Suite E2E full verde** — não rodado completo nesta sessão, podem ter regressões dos refactors.
10. **API key Resend exposta no chat — revogar e gerar nova.**

### Próximas features de produto (alinhado com usuário)
- 🥈 **Múltiplos contatos com papéis** (whatsapp/telefone/email + papel: mãe pequena, ogã, etc) — não feito
- 🥉 **Galeria de fotos** com cap 5 — `casa_fotos` table já existe, falta refinar UI
- 4️⃣ **Linhagem/doutrina + casa-mãe** (ex.: "Umbanda Pés no Chão", filha do Terreiro Pai Maneco) — não feito
- 5️⃣ **Acessibilidade física** (acessível / parcial / não) — não feito
- Tier 2: busca por nome de dirigente, orixás Candomblé, ano de fundação — não feitos

---

## Decisões da sessão pra lembrar

- **Não rodar `supabase db reset` nesta máquina** — apaga dados que o user cadastrou via UI. Usar `supabase migration up` (memória salva).
- **Não usar `[SEED]` no nome das casas reais** — teardown dos testes E2E limpa pelo marker.
- **Bundle 932 KB** é o débito técnico mais óbvio. Não bloqueia, mas vai pegar no Lighthouse-CI.
- **Tridente do logo** é emoji 🔱 via fonte do SO (não SVG manual). Funcionou melhor que tentativas de SVG.
- **SMTP local** fica `enabled = false` no `config.toml` por padrão — Inbucket pega tudo em `127.0.0.1:54324`. Ativar só quando quiser testar real.
