# Instruction — Como o orquestrador IAOX deve trabalhar

Documento mestre das convenções da casa (JETOOH). Vale para todo trabalho feito
neste orquestrador. As regras detalhadas ficam em `.claude/rules/` — este arquivo
é o índice acionável ("como deve fazer").

---

## 1. Idioma — código em inglês, aplicação em português

- **Código em inglês:** identificadores, funções, variáveis, tipos, nomes de
  arquivos, comentários e mensagens de commit.
- **Aplicação em português (pt-BR):** todo conteúdo do usuário final — textos de
  UI, labels, mensagens, validações exibidas, e-mails, i18n.
- Resumo: **code in English, app speaks Portuguese.**

## 2. Isolamento por aplicação — regras, memória, docs e stories

Cada camada é **global no orquestrador** ou **isolada por app** (pasta com o nome
da app). Nunca misture o de uma app com o de outra.

| Camada | De uma app | Global (orquestrador) |
|--------|-----------|------------------------|
| Regras | `.claude/rules/apps/<app>/` | `.claude/rules/*.md` |
| Memória | `.claude/memory/apps/<app>/` | `.claude/memory/` |
| Features (slices) | `docs/apps/<app>/features/<slug>/` | `docs/features/<slug>/` |
| Stories | `docs/apps/<app>/stories/` | `docs/stories/` |

A **memória** persiste fatos/decisões entre sessões (índice `MEMORY.md`); consulte
o índice antes de agir. Ver as regras `memory.md` e `app-structure.md`.

## 3. Estrutura de pastas

```
raiz/  (orquestrador/monorepo — repositório git)
├── instruction.md                  # este documento
├── ecosystem.json                  # catálogo central de apps e packages
├── package.json + turbo.json       # workspaces + Turborepo
├── .claude/
│   ├── rules/{globais}.md + apps/<app>/
│   ├── memory/MEMORY.md + apps/<app>/     # memória (índice global + por app)
│   └── agents/                     # 8 agentes da casa
├── docs/                           # docs do ORQUESTRADOR (global/cross-app)
│   ├── PRD.md · architecture/ · stories/ · features/<slug>/
│   └── apps/<app>/                 # docs e stories de CADA app
│       ├── features/<slug>/
│       └── stories/
├── app/<app>/                      # o CÓDIGO de cada aplicação
├── packages/<nome>/                # código compartilhado (@ecosystem/<nome>)
└── screenshot/                     # prints do Playwright (limpos a cada 12h)
```

- **Docs/stories de uma app** → `docs/apps/<app>/`; **do orquestrador** → `docs/`.
  **Código** → `app/<app>/`.

## 4. Criar uma aplicação (`*create-project <app>`)

1. **Apresente o menu de stack** e pergunte qual o tipo (não crie sem escolher).
   Padrão da casa: **Vite + React + Vitest** (web) e **Flutter** (mobile).
2. Crie **`app/<app>/`** com o scaffold da stack escolhida.
3. Crie **`.claude/rules/apps/<app>/`** e **`.claude/memory/apps/<app>/`**.
4. Registre a stack escolhida na primeira memória do app.

## 5. Excluir uma aplicação (`*delete-project <app>`)

Remova **somente** estas três pastas (confirme o nome antes):
`app/<app>/`, `.claude/rules/apps/<app>/`, `.claude/memory/apps/<app>/`.
Nunca remova regras/memórias globais nem de outros apps.

## 6. Desenvolvimento em vertical slices

- Toda funcionalidade é uma fatia: **intenção → SPEC → TASKS → código → SCORE.**
- Cada feature vira `docs/features/<slug>/` (SPEC, TASKS, RULES, SCORE, DECISIONS).
- Todo commit fecha com `Closes-AC: AC-NN` (rastreabilidade).
- `Done` só com ship gate verde (SCORE ≥ 7 e AC verificados).

## 7. Ecossistema de várias aplicações

- **Catálogo:** `ecosystem.json` na raiz lista todas as apps e packages. `*list-apps`
  mostra a visão do todo. Mantenha registry e disco em sincronia.
- **Monorepo:** workspaces `app/*` + `packages/*`; deps instalam na raiz; tarefas
  via Turborepo (`npm run dev|build|test|lint`).
- **Código compartilhado:** o que é usado por 2+ apps vai para `packages/<nome>`
  como `@ecosystem/<nome>` — **não duplique entre apps**.
- **Portas:** cada app web tem porta única e fixa (5173+), registrada no
  `ecosystem.json`. Ver a regra `ecosystem.md`.
- **Config compartilhada:** `tsconfig.base.json`, `eslint.config.js` e
  `.prettierrc.json` na raiz — herdados por todas as apps (não duplique config).
- **Contratos:** tipos entre apps em `packages/contracts` (`@ecosystem/contracts`).
- **`*deps`:** grafo de dependências do ecossistema, com detecção de ciclos.
- **CI/release:** `.github/workflows/ecosystem-ci.yml` roda lint/knip + `turbo
  --affected`; releases por app via Changesets (`npm run changeset`).
- **`*doctor`:** saúde do ecossistema (registry↔disco, portas, órfãs, ciclos),
  via `@platform`.
- **Observabilidade:** toda app em produção instrumenta as Four Golden Signals +
  SLOs (OpenTelemetry); apps de IA monitoram evals/hallucination/custo/drift. Via
  `@observability`. Ver a regra `observability.md`.
- **FinOps:** custo é uma feature — features de IA declaram custo e aplicam
  alavancas (model routing, caching, compression, limites); budget + alertas. Via
  `@finops`. Ver a regra `finops.md`.
- **Acessibilidade:** toda UI segue WCAG 2.2 AA (teclado, semântica, contraste,
  leitor de tela) com testes axe; feature com UI só é Done sem violações
  críticas. Via `@a11y`. Ver a regra `a11y.md`.
- **Segredos:** `.env` na raiz (global) e `app/<app>/.env` (por app), nunca
  commitados; só os `.env.example` são versionados. `*secrets` checa o que falta
  sem vazar valores. Ver a regra `secrets.md`.
- **Acessos (`access.md`):** cofre local com URLs, logins de teste, tokens, SSH e
  bancos — usado pelos agentes para acessar/testar as apps. **Nunca commitado**
  (só `access.example.md`). Ver `secrets.md`.

## 8. Tooling padrão

- **knip** por padrão em apps JS/TS — sem código/deps mortos (roda no ship gate).
- **Playwright** por padrão em apps web — acessa a app, roda E2E e bate
  screenshots.
- **Screenshots** vão para `screenshot/` na raiz; a pasta é **limpa a cada 12h**
  pelo hook `SessionStart`.

## 9. Governança (sempre)

- **No Invention:** toda feature traça ao `docs/PRD.md`.
- **Delegação:** trabalho especializado vai ao agente dono (@dev, @qa, @ux…).
- **Agent Authority:** `git push`/PR/release/MCP são exclusivos do `@devops`.

---

> Regras detalhadas: `.claude/rules/vertical-slices.md`, `app-structure.md`,
> `tooling.md`, `god-mode-overview.md`. Playbook completo:
> `.claude/skills/iaox-god-mode/references/vertical-slices.md`.
