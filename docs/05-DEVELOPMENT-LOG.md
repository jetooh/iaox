# 05 — Log de Desenvolvimento

Cronologia. Concepção: **2026-06-30**. Evolução para orquestrador multi-app e
rebrand: **2026-07-01**. Camada 3, agentes de produção, memória e isolamento:
**2026-07-02**.

## Sessão 1 — Concepção e scaffold

1. **Análise** do `SynkraAI/aiox-core` (framework) e do
   `create-aiox-god-mode` (instalador, de gutomec). Constatado: o instalador é
   fino e delega; o valor está na curadoria + skill. O pacote do gutomec foi
   inspecionado via `npm pack` para entender a estrutura real (8 etapas,
   tool-paths, template, conversores).
2. **Decisões** coletadas com o usuário: skill própria; 4 IDEs; scaffold agora.
3. **Scaffold completo** criado: `bin/`, `lib/` (cli, constants, commands, core,
   utils, ui) e `lib/template/` (skill + 4 referências + rule + settings).
4. **Smoke-test** OK: `--help`, `--version`, validação de nome (sai 1), `doctor`.

## Sessão 2 — Persistência + invocação autônoma

Requisitos novos do usuário:
- Invocação **autônoma** (subagentes via Task).
- God Mode **persistente**: ativar uma vez = ativo a sessão toda até `*exit`.

Implementado:
- `SKILL.md` reescrita: seção 0 (modo persistente), seção 2 (Operation Engine com
  Task + tabela `subagent_type`).
- Rule `god-mode-overview.md` reforçada (persistência).
- `god-mode-installer.js`: `injectInstructions` insere bloco idempotente
  `<!-- IAOX-GOD-MODE:START/END -->` no arquivo de instruções de cada IDE.
- `agent-matrix.md`: coluna `subagent_type`.
- Versão da skill bumpada para `0.2.0`.

## Sessão 3 — E2E real (validado ✅)

Usuário rodou `node bin/index.js meu-iaox-god-mode-test` em terminal real.
- Wizard do `aiox-core` v5.2.9 respondido: PT, Modo Assistido, Greenfield,
  Claude Code, preset `nextjs-react`.
- Pipeline de 8 etapas concluído. `God Mode (claude-code) v0.2.0, 7 files`.
  GSD instalado; OMC opcional não instalado.
- No Claude Code, `/iaox-god-mode` **ativou e operou** como Operador persistente
  (status `🟢`, tabela de intents, lista de agentes, comandos). Objetivo central
  validado.
- Verificado no projeto: SKILL.md, 4 referências, bloco de persistência no
  `CLAUDE.md` (1 ocorrência), 3 MCPs em `.mcp.json`, rule presente, `.version` = 0.2.0.

Aprendizados (viraram [06-KNOWN-ISSUES.md](06-KNOWN-ISSUES.md)):
- Rodar `claude` na pasta certa do projeto (não no pai).
- `worklog-stop-hook.sh` é config global do usuário, não do CLI.
- Commit inicial podia falhar por hooks → corrigido com `--no-verify`.
- Skill só instala nas IDEs marcadas no wizard (correto).

## Sessão 4 — Flag `--dry-run` (validada ✅)

- Adicionada flag `--dry-run` + `--ide a,b,c` ao `init`.
- `scaffoldDryRun` cria esqueleto mínimo (core-config.yaml + CLAUDE.md).
- Etapas de rede (find-skills/GSD/OMC) e npm/git puladas; código próprio roda.
- Testado com `--ide claude-code,cursor,gemini`: skill nas 3 IDEs; bloco de
  persistência em `CLAUDE.md`/`AGENTS.md`/`GEMINI.md`; MCP em `.mcp.json` e
  `.cursor/mcp.json` (gemini avisa que não suporta); idempotente (re-run não
  duplica o bloco).

## Sessão 5 — Rebrand `@jetooh/iaox` v2.0.0 + orquestrador multi-app (2026-07-01)

Grande salto: de "instalador `create-*`" para um **CLI de orquestradores**.

- **Rebrand:** pacote `@jetooh/iaox` v2.0.0, binário `iaox`, distribuído só via
  GitHub (`npx github:jetooh/iaox <nome>`). `CLI_VERSION` passou a ler do
  `package.json` (fonte única). Template bumpado para `0.3.0`.
- **Vertical slices internalizado** (inspirado no `vertical-slices-md-dev-kit` de
  Rafael Melo): regra `vertical-slices.md`, playbook em `references/`,
  `feature-templates/` (SPEC/TASKS/RULES/SCORE/DECISIONS), ship gate e
  `Closes-AC:`.
- **Ecossistema (Camadas 1 e 2):** `lib/template/root/` → monorepo com workspaces
  (`app/*`+`packages/*`) + Turborepo, `ecosystem.json` (catálogo), config
  compartilhada (`tsconfig.base.json`, `eslint.config.js` flat, `.prettierrc.json`),
  isolamento por app (`.claude/rules|memory/apps/<app>/`), portas únicas e
  contratos. Regras `ecosystem.md` e `app-structure.md`.
- **Agentes da casa:** `@scaffolder`, `@security`, `@e2e`, `@i18n` em
  `.claude/agents/`.
- **Scaffolds determinísticos:** `vite-react-vitest` e `flutter` em
  `references/scaffolds/` (com placeholders `__APP_NAME__`/`__PORT__`).
- **Tooling:** regra `tooling.md` (knip + Playwright); hook `SessionStart`
  (`iaox-clean-screenshots.cjs` + `settings.json`) que limpa `screenshot/` a cada
  12h.
- **Secrets/access:** regra `secrets.md`; `.gitignore` blinda `.env*` e
  `access.md`; post-setup cria `access.md` de `access.example.md` e a pasta
  `screenshot/`.
- **Convenções da casa:** `instruction.md` na raiz, referenciado via
  `@instruction.md` no bloco de persistência do `CLAUDE.md`.
- **Comandos novos da God Mode:** `*create-project` (menu de stack),
  `*delete-project`, `*create-feature`, `*list-apps`, `*deps`, `*secrets`,
  `*migrate` (via `references/migration.md`).
- **Modo `update` reforçado:** distribui skill+rules+agents+instruction
  sobrescrevendo o framework, mas **preservando dados do usuário**
  (ecosystem.json, config raiz, settings).
- **Testes de integração:** suíte `node --test` cresceu para **20 testes** em 3
  arquivos (`unit`, `smoke`, `install`), validando agentes, scaffolds,
  ecosystem.json, monorepo, hook, instruction, regras, access.md e o modo update.
  CI (`.github/workflows/ci.yml`) roda lint + test + dry-run em Node 18/20/22.

## Sessão 6 — Camada 3, agentes de produção, memória e isolamento (2026-07-02)

Maturação do orquestrador (8 commits). Template continua `0.3.0`.

- **Tooling novo:** **Husky + lint-staged** (`.husky/pre-commit` → `npx
  lint-staged`; `eslint --fix` + `prettier` nos staged; `prepare: husky`).
  **Zod** no scaffold Vite (`src/env.ts` valida `import.meta.env` no boot).
  **Changesets** (`.changeset/config.json` + scripts `changeset`/
  `version-packages`). ESLint flat real + Prettier + `knip.json` na raiz.
- **Camada 3 do ecossistema:** CI "affected"
  (`.github/workflows/ecosystem-ci.yml` → `turbo run test build --affected`),
  release por app (Changesets), comando `*doctor` (registry↔disco, portas,
  órfãs, ciclos) e o agente `@platform` (guardião macro).
- **Agentes de produção** (de análise de mercado 2026): `@observability` (SRE +
  LLM observability — Golden Signals, SLO, OpenTelemetry, evals/hallucination/
  token-cost/drift, incidentes), `@finops` (custo cloud+IA — model routing,
  caching, prompt compression, budget), `@a11y` (WCAG 2.2 AA, axe). Agora são
  **8 agentes da casa** e **10 regras** (`+ observability`, `finops`, `a11y`,
  `memory`).
- **Sistema de memória do orquestrador** (`.claude/memory/`, regra `memory.md`):
  memória versionada e compartilhada com o time — global + `apps/<app>/` por
  app, índice `MEMORY.md`, frontmatter tipado (project/decision/reference/
  feedback), carregada via `@.claude/memory/MEMORY.md` no `CLAUDE.md`. Distinta
  da memória pessoal do Claude Code.
- **Isolamento estendido a docs/stories:** features de app em
  `docs/apps/<app>/features/<slug>/`, stories em `docs/apps/<app>/stories/`;
  globais do orquestrador em `docs/features/` e `docs/stories/`. Post-setup cria
  as pastas base e o índice de memória.
- **Fixes:** knip agora roda **da raiz** do monorepo (config `root/knip.json`;
  devDeps hoisted) — rodar por-workspace falhava; scaffold Playwright usa
  `import.meta.url` em vez de `__dirname` (é ESM).
- **Testes:** suíte cresceu para **22 testes** (`install.test.js` cobre os
  agentes, scaffolds, ecossistema, monorepo, hook, **memória**, **docs/apps**,
  **secrets/access** e o modo update).

## Pendências

- Testar **roteamento real**: com God Mode ativo, mandar um pedido e confirmar
  que a skill **dispara** o subagente `aiox-*` (não só descreve).
- Testar **E2E completo** do fluxo `*create-project` → app real com testes/lint
  passando de fábrica, e `*create-feature` → ship gate.
