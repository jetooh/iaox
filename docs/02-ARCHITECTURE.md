# 02 — Arquitetura

## Visão em camadas

Este projeto é o **instalador** (o "maestro"), não o framework. Ele orquestra
instaladores de terceiros e injeta a skill própria + todo o ecossistema da casa.

```
┌─────────────────────────────────────────────────────────┐
│  @jetooh/iaox  (este repositório)                        │  ← o instalador
│  CLI de scaffolding. 8 etapas, um comando.               │
└───────────────────────────┬─────────────────────────────┘
                            │ delega para
        ┌───────────────────┼───────────────────┬──────────────┐
        ▼                   ▼                   ▼              ▼
   aiox-core           get-shit-done-cc   oh-my-claude-     3 MCPs
   (framework real)    (GSD)              sisyphus (OMC)   (context7, …)
```

O que o CLI **agrega** por conta própria: a skill God Mode, as regras da casa,
os agentes da casa, os scaffolds determinísticos, o monorepo/ecossistema
(Camadas 1 e 2) e o tooling. Tudo isso vive em `lib/template/`.

## Estrutura de arquivos

```
bin/index.js                 # entrypoint — checa Node, importa lib/cli.js
lib/cli.js                   # commander: init | update | doctor | add-squad
lib/constants.js             # ⚙️ branding centralizado (CLI_VERSION lida do package.json)
lib/commands/
  ├── init.js                # pipeline de 8 etapas (+ suporte --dry-run)
  ├── update.js              # reinstala framework preservando dados do usuário
  ├── doctor.js              # 8 verificações de saúde
  └── add-squad.js           # adiciona squad
lib/core/
  ├── framework-bootstrap.js # `npx aiox-core init` + scaffoldDryRun
  ├── god-mode-installer.js  # skill + rules + agents + config + instruction + root/ + injeta persistência
  ├── ecosystem-installer.js # MCPs, find-skills, GSD, OMC, cleanup/convert
  └── post-setup.js          # npm install, .env.example, .gitignore, screenshot/, access.md, git
lib/utils/
  ├── tool-paths.js          # mapa de paths por IDE (4 IDEs)
  ├── validators.js          # nome do projeto, diretório vazio, rede
  ├── platform.js            # TTY, resolução de core dir/config
  └── skill-converter.js     # converte skills/rules/instruções/MCP por IDE
lib/ui/
  ├── logo.js                # banner ASCII
  └── messages.js            # printStep/Success/Error/Warning/Info
lib/template/                # 🧠 o que é instalado no projeto-alvo
  ├── template.json          # metadados + versão da skill (0.3.0)
  ├── instruction.md         # convenções da casa (→ raiz, via @instruction.md)
  ├── config/
  │   ├── settings.json      # permissions + hook SessionStart (merge)
  │   └── iaox-clean-screenshots.cjs  # limpa screenshot/ a cada 12h
  ├── rules/                 # 6 regras da casa (→ .claude/rules/)
  │   ├── god-mode-overview.md · vertical-slices.md · app-structure.md
  │   └── tooling.md · ecosystem.md · secrets.md
  ├── agents/                # 4 agentes da casa (→ .claude/agents/)
  │   └── scaffolder.md · security.md · e2e.md · i18n.md
  ├── root/                  # ecossistema/monorepo (→ raiz do projeto)
  │   ├── ecosystem.json · package.json · turbo.json
  │   ├── tsconfig.base.json · eslint.config.js · .prettierrc.json
  │   ├── access.example.md · app/.gitkeep · packages/README.md
  └── skills/iaox-god-mode/
      ├── SKILL.md           # a skill principal
      └── references/
          ├── agent-matrix.md · workflow-playbooks.md · agent-creation.md
          ├── framework-map.md · vertical-slices.md · migration.md
          ├── ecosystem.schema.json
          ├── feature-templates/  # SPEC, TASKS, RULES, SCORE, DECISIONS
          └── scaffolds/          # vite-react-vitest, flutter
```

## Pipeline de `init` (8 etapas)

| # | Etapa | Quem | Dry-run |
|:-:|-------|------|:-------:|
| 1 | Validar ambiente (Node, nome kebab-case, dir vazio, rede) | CLI | roda |
| 2 | `npx aiox-core init <nome>` (wizard interativo) | aiox-core | **substituído por `scaffoldDryRun`** |
| 3 | **Instalar God Mode** (skill + rules + agents + config + instruction + root/) por IDE | **CLI** | roda |
| 4 | Configurar 3 MCPs por IDE | CLI | roda |
| 5 | `npx get-shit-done-cc --local` | GSD | **pulado** |
| 6 | `npx oh-my-claude-sisyphus install` | OMC | **pulado** |
| 7 | Cleanup + conversão de skills/rules/instruções por IDE | CLI | roda |
| 8 | post-setup: `.env.example`/`.gitignore`/`screenshot/`/`access.md` + `npm install` + `git init`/commit | CLI | **npm/git pulados** |

As IDEs selecionadas vêm de `core-config.yaml` (`ide.selected`), lido por
`readSelectedTools()`. No dry-run, vêm da flag `--ide`.

## O que a etapa 3 instala (`god-mode-installer.js`)

`installGodMode(projectDir, { aiTool, update })` copia, em ordem:

1. **Skills** → `{skills}/iaox-god-mode/` (SKILL.md + referências + scaffolds).
2. **Rules** globais → `{rules}/` (`overwrite:false` no init; `true` no update).
3. **Config** (só claude-code) → `.claude/` (`settings.json` é feito **merge**;
   demais arquivos, incl. `iaox-clean-screenshots.cjs`, copiados).
4. **instruction.md** → raiz do projeto.
5. **Agents** (só claude-code) → `.claude/agents/` (4 agentes da casa).
6. **root/** → raiz do projeto (`ecosystem.json`, monorepo, config compartilhada,
   `access.example.md`) — `overwrite:false` (nunca sobrescreve dados do usuário).
7. **Persistência**: injeta o bloco `<!-- IAOX-GOD-MODE:START/END -->` no arquivo
   de instruções da IDE.
8. Grava `.version` da skill.

## Mapa de IDEs (`lib/utils/tool-paths.js`)

| IDE | skills | rules | mcp | instruções |
|-----|--------|-------|-----|------------|
| `claude-code` | `.claude/skills` | `.claude/rules` | `.mcp.json` | `CLAUDE.md` |
| `codex` | `.codex/skills` | — | `.codex/config.toml` (TOML) | `AGENTS.md` |
| `cursor` | `.cursor/skills` | `.cursor/rules` | `.cursor/mcp.json` | `AGENTS.md` |
| `gemini` | `.gemini/skills` | `.gemini/rules` | — (sem MCP per-project) | `GEMINI.md` |

> Agentes da casa e config (`settings.json` + hook) só são instalados para
> **claude-code**. A conversão de MCP por IDE está em
> `skill-converter.js::convertMcpConfig` (JSON para cursor, TOML para codex,
> warning para gemini).

## Mecanismo de persistência

`god-mode-installer.js::injectInstructions` insere (idempotente) um bloco entre
`<!-- IAOX-GOD-MODE:START -->` e `<!-- IAOX-GOD-MODE:END -->` no arquivo de
instruções de cada IDE. Como esses arquivos (`CLAUDE.md` etc.) são recarregados
a cada turno, o modo "fica ativo" mesmo após compactação de contexto. Em
reinstalações, o bloco entre os marcadores é **substituído**, não duplicado. O
bloco também instrui a **sempre seguir `@instruction.md`** (convenções da casa).

## Mecanismo de invocação autônoma

A `SKILL.md` (seção 2 — Operation Engine) instrui o Claude a despachar o agente
dono via **Task tool** com o `subagent_type` da tabela em
`references/agent-matrix.md`. Fallback: se o subagente `aiox-*` não existir,
adotar a persona inline lendo `.aiox-core/development/agents/{name}.md`.

## Comandos do CLI

| Comando | Função |
|---------|--------|
| `init <nome>` (padrão) | cria o orquestrador (aceita `--dry-run`, `--ide a,b,c`) |
| `update` | reinstala skill/rules/agents/instruction sobrescrevendo framework, **preservando dados do usuário** (ecosystem.json, config, settings) |
| `doctor` | 8 health checks no projeto atual |
| `add-squad <nome>` | adiciona um squad |
