# 01 — Memória do Projeto

Espelho versionado da memória de trabalho do projeto. Fatos e estado
consolidados, com datas absolutas.

---

## Identidade

- **Pacote:** `@jetooh/iaox` v2.0.0 (ESM, Node ≥ 18). **Binário:** `iaox`.
- **Distribuição:** só via GitHub — `npx github:jetooh/iaox <nome>`. **Não** é
  publicado no npm.
- **Diretório:** `/Users/victordeziderio/meu-iaox-god-mode`
- **Tipo:** CLI instalador de **orquestradores**. Cada projeto gerado é um
  **ecossistema multi-app** (monorepo) com a **skill God Mode própria**.
- **Template instalado:** `lib/template/template.json` v0.3.0.

## Decisões fundamentais

1. **Skill própria** — não copiar a skill do gutomec; a nossa `SKILL.md` é a
   camada de roteamento/orquestração sobre os agentes reais do `aiox-core`.
2. **4 IDEs suportadas** — Claude Code, Codex, Cursor, Gemini CLI.
3. **Branding centralizado** em `lib/constants.js` (`CLI_NAME`, `DISPLAY_NAME`,
   `SKILL_NAME = iaox-god-mode`, `FRAMEWORK_PACKAGE = aiox-core`, `MCP_SERVERS`,
   `ECOSYSTEM`). `CLI_VERSION` é lida do `package.json` (fonte única da verdade).
   Renomear o projeto inteiro = editar só esse arquivo.
4. **God Mode persistente** — ativar `/iaox-god-mode` uma vez mantém o modo ativo
   pela sessão toda até `*exit`.
5. **Invocação autônoma** — a skill dispara o agente dono via Task tool com
   `subagent_type` (aiox-dev, aiox-qa, etc.).
6. **Ecossistema por padrão** — cada projeto nasce como monorepo (workspaces +
   Turborepo), com catálogo `ecosystem.json`, config compartilhada e isolamento
   por app.
7. **Vertical slices** — todo desenvolvimento é uma fatia rastreável
   (intenção → SPEC → TASKS → código → SCORE), com ship gate e `Closes-AC:`.
8. **Idioma** — código em inglês, aplicação em português (pt-BR).

## Arquitetura (resumo)

`bin/index.js` → `lib/cli.js` (commander: `init | update | doctor | add-squad`)
→ `lib/commands/` + `lib/core/` (framework-bootstrap, god-mode-installer,
ecosystem-installer, post-setup) + `lib/utils/` (tool-paths, validators,
platform, skill-converter) + `lib/ui/` + `lib/template/` (skill + rules + agents
+ config + root + instruction.md).

Pipeline `init` = **8 etapas**; o código próprio instala a skill, as regras da
casa, os agentes, os scaffolds, o monorepo/ecossistema e o tooling — as demais
etapas delegam para `aiox-core`, GSD e oh-my-claudecode. Ver
[02-ARCHITECTURE.md](02-ARCHITECTURE.md).

## O que cada projeto gerado ganha

- **Skill** `iaox-god-mode` (SKILL.md + referências + feature-templates +
  scaffolds) em cada IDE selecionada.
- **Regras da casa** (`.claude/rules/`) — **10 regras**: `god-mode-overview`,
  `vertical-slices`, `app-structure`, `tooling`, `ecosystem`, `secrets`,
  `observability`, `finops`, `a11y`, `memory`.
- **Agentes da casa** (`.claude/agents/`) — **8 agentes**: `scaffolder`,
  `security`, `e2e`, `i18n`, `platform` (guardião macro do ecossistema),
  `observability` (SRE + LLM observability), `finops` (custo cloud+IA), `a11y`
  (acessibilidade WCAG 2.2 AA).
- **Ecossistema/monorepo** (na raiz, de `lib/template/root/`): `ecosystem.json`,
  `package.json` (workspaces `app/*`+`packages/*`, scripts turbo/knip/changeset,
  `prepare: husky`, config lint-staged), `turbo.json`, `tsconfig.base.json`,
  `eslint.config.js` (flat real), `.prettierrc.json`, `knip.json` (config
  compartilhada da raiz), `packages/README.md`, `app/.gitkeep`,
  `access.example.md`.
- **Camada 3** do ecossistema: `.github/workflows/ecosystem-ci.yml` (CI
  "affected" — `turbo run test build --affected`), `.changeset/config.json`
  (release por app via Changesets), `.husky/pre-commit` (roda `lint-staged`).
- **Convenções** (`instruction.md` na raiz, referenciado via `@instruction.md`).
- **Tooling**: Husky + lint-staged (pre-commit auto-formata staged), Zod
  (scaffold Vite valida `import.meta.env` no boot via `src/env.ts`), Changesets,
  knip rodado da raiz do monorepo; hook `SessionStart` que limpa `screenshot/` a
  cada 12h (`iaox-clean-screenshots.cjs` + `settings.json`).
- **Memória do orquestrador** (`.claude/memory/`): índice `MEMORY.md` global +
  `apps/<app>/` por app — memória versionada e compartilhada com o time
  (distinta da memória pessoal do Claude Code). Regra `memory.md`.
- **Docs isolados por app**: `docs/apps/<app>/features/` e
  `docs/apps/<app>/stories/`; globais em `docs/features/` e `docs/stories/`.
- **Secrets**: `.gitignore` blinda `.env`/`access.md`; `access.md` criado de
  `access.example.md` (cofre local, ignorado pelo git).

## Mecanismo de persistência (o que faz "ficar ativo")

Três camadas que se reforçam, todas recarregadas a cada turno (sobrevivem à
compactação de contexto):

1. **`SKILL.md` → seção 0** "PERSISTENT SESSION MODE".
2. **Rule** `.claude/rules/god-mode-overview.md` (sempre carregada).
3. **Bloco injetado** no arquivo de instruções (`CLAUDE.md` / `AGENTS.md` /
   `GEMINI.md`) entre os marcadores `<!-- IAOX-GOD-MODE:START/END -->`
   (idempotente — não duplica em reinstalações). O bloco também aponta para
   `@instruction.md` (convenções da casa).

## Mapa de invocação (pedido → agente → subagente)

| Domínio | Agente | `subagent_type` |
|---------|--------|-----------------|
| Implementação | @dev (Dex) | `aiox-dev` |
| Testes/QA | @qa (Quinn) | `aiox-qa` |
| Arquitetura | @architect (Aria) | `aiox-architect` |
| PRD/epics | @pm (Morgan) | `aiox-pm` |
| Validação story | @po (Pax) | `aiox-po` |
| Criar stories | @sm (River) | `aiox-sm` |
| Pesquisa | @analyst (Alex) | `aiox-analyst` |
| Banco de dados | @data-engineer (Dara) | `aiox-data-engineer` |
| UX/UI | @ux-design-expert (Uma) | `aiox-ux` |
| Push/PR/CI/MCP | @devops (Gage) | `aiox-devops` |
| Governança | @aiox-master (Orion) | _(skill, não subagente)_ |

Além dos 11 agentes core, o projeto instala **8 agentes da casa**
(`@scaffolder`, `@security`, `@e2e`, `@i18n`, `@platform`, `@observability`,
`@finops`, `@a11y`).

## Estado atual

- **Rebrand para `@jetooh/iaox` v2.0.0** concluído (2026-07-01). Template v0.3.0.
- **Ecossistema Camadas 1, 2 e 3** implementado: monorepo, `ecosystem.json`,
  config compartilhada, isolamento por app (rules/memory/docs), vertical slices,
  scaffolds determinísticos (`vite-react-vitest`, `flutter`), 8 agentes da casa,
  tooling (Husky+lint-staged, Zod, Changesets, knip/Playwright/screenshots),
  CI "affected", release por app e secrets/access.
- **Sistema de memória do orquestrador** (`.claude/memory/`, regra `memory.md`):
  versionado e compartilhado, global + por app, com índice `MEMORY.md` e
  frontmatter tipado (project/decision/reference/feedback).
- **Modo `update`** distribui skill+rules+agents+instruction sobrescrevendo o
  framework mas **preservando dados do usuário** (ecosystem.json, config raiz,
  settings, memória).
- **Testes de integração**: 22 testes em 3 arquivos (`unit`, `smoke`, `install`),
  todos verdes. CI em Node 18/20/22. Ver [07-TESTING.md](07-TESTING.md).

## Fatos importantes do ambiente

- `aiox-core` no npm: o `init` é um **wizard interativo** (idioma → modo → tipo
  de projeto → IDEs → tech preset). Requer TTY real. A skill só é instalada nas
  **IDEs marcadas no wizard** (comportamento correto).
- **3 MCPs** configurados (`lib/constants.js::MCP_SERVERS`): `context7`,
  `21st-dev`, `nano-banana-pro` (este com `GEMINI_API_KEY`).
- Rodar sempre a partir do **diretório pai** para o projeto não aninhar.
