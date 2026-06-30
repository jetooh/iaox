# 02 — Arquitetura

## Visão em camadas

Este projeto é o **instalador** (o "maestro"), não o framework. Ele orquestra
instaladores de terceiros e injeta a skill própria.

```
┌─────────────────────────────────────────────────────────┐
│  create-meu-iaox-god-mode   (este repositório)           │  ← o instalador
│  CLI de scaffolding. 8 etapas, um comando.               │
└───────────────────────────┬─────────────────────────────┘
                            │ delega para
        ┌───────────────────┼───────────────────┬──────────────┐
        ▼                   ▼                   ▼              ▼
   aiox-core           get-shit-done-cc   oh-my-claude-     3 MCPs
   (framework real)    (GSD)              sisyphus (OMC)   (context7, etc)
```

## Estrutura de arquivos

```
bin/index.js                 # entrypoint — checa Node, importa lib/cli.js
lib/cli.js                   # commander: init | update | doctor | add-squad
lib/constants.js             # ⚙️ branding centralizado (renomeie tudo aqui)
lib/commands/
  ├── init.js                # pipeline de 8 etapas (+ suporte --dry-run)
  ├── update.js              # atualiza a skill se houver versão mais nova
  ├── doctor.js              # 8 verificações de saúde
  └── add-squad.js           # adiciona squad (via `squads` CLI ou scaffold local)
lib/core/
  ├── framework-bootstrap.js # `npx aiox-core init` + scaffoldDryRun
  ├── god-mode-installer.js  # copia a skill + rules + settings + injeta persistência
  ├── ecosystem-installer.js # MCPs, find-skills, GSD, OMC, cleanup/convert
  └── post-setup.js          # npm install, .env.example, .gitignore, git init/commit
lib/utils/
  ├── tool-paths.js          # mapa de paths por IDE (4 IDEs)
  ├── validators.js          # nome do projeto, diretório vazio, rede
  ├── platform.js            # TTY, resolução de core dir/config
  └── skill-converter.js     # converte skills/rules/instruções/MCP por IDE
lib/ui/
  ├── logo.js                # banner ASCII
  └── messages.js            # printStep/Success/Error/Warning/Info
lib/template/                # 🧠 o template instalado no projeto-alvo
  ├── template.json          # metadados + versão da skill
  ├── config/settings.json   # permissions (merge no .claude/settings.json)
  ├── rules/god-mode-overview.md   # rule de persistência
  └── skills/iaox-god-mode/
      ├── SKILL.md           # a skill principal
      └── references/        # agent-matrix, workflow-playbooks, agent-creation, framework-map
```

## Pipeline de `init` (8 etapas)

Só a **etapa 3** é código próprio que agrega valor; o resto delega.

| # | Etapa | Quem | Dry-run |
|:-:|-------|------|:-------:|
| 1 | Validar ambiente (Node, nome kebab-case, dir vazio, rede) | CLI | roda |
| 2 | `npx aiox-core init <nome>` (wizard interativo) | aiox-core | **substituído por `scaffoldDryRun`** |
| 3 | **Instalar a skill God Mode** por IDE selecionada | **CLI** | roda |
| 4 | Configurar 3 MCPs por IDE | CLI | roda |
| 5 | `npx get-shit-done-cc --local` | GSD | **pulado** |
| 6 | `npx oh-my-claude-sisyphus install` | OMC | **pulado** |
| 7 | Cleanup + conversão de skills/rules/instruções por IDE | CLI | roda |
| 8 | `npm install` + `.env.example`/`.gitignore` + `git init`/commit | CLI | **npm/git pulados** |

As IDEs selecionadas vêm de `core-config.yaml` (`ide.selected`), lido por
`readSelectedTools()`. No dry-run, vêm da flag `--ide`.

## Mapa de IDEs (`lib/utils/tool-paths.js`)

| IDE | skills | rules | mcp | instruções |
|-----|--------|-------|-----|------------|
| `claude-code` | `.claude/skills` | `.claude/rules` | `.mcp.json` | `CLAUDE.md` |
| `codex` | `.codex/skills` | — | `.codex/config.toml` (TOML) | `AGENTS.md` |
| `cursor` | `.cursor/skills` | `.cursor/rules` | `.cursor/mcp.json` | `AGENTS.md` |
| `gemini` | `.gemini/skills` | `.gemini/rules` | — (sem MCP/proj) | `GEMINI.md` |

A conversão de MCP por IDE está em `skill-converter.js::convertMcpConfig`
(JSON para cursor, TOML para codex, warning para gemini).

## Mecanismo de persistência

`god-mode-installer.js::injectInstructions` insere (idempotente) um bloco entre
`<!-- IAOX-GOD-MODE:START -->` e `<!-- IAOX-GOD-MODE:END -->` no arquivo de
instruções de cada IDE. Como esses arquivos (`CLAUDE.md` etc.) são recarregados
a cada turno, o modo "fica ativo" mesmo após compactação de contexto. Em
reinstalações, o bloco entre os marcadores é **substituído**, não duplicado.

## Mecanismo de invocação autônoma

A `SKILL.md` (seção 2 — Operation Engine) instrui o Claude a despachar o agente
dono via **Task tool** com o `subagent_type` da tabela em
`references/agent-matrix.md`. Fallback: se o subagente `aiox-*` não existir,
adotar a persona inline lendo `.aiox-core/development/agents/{name}.md`.

## Comandos do CLI

| Comando | Função |
|---------|--------|
| `init <nome>` (padrão) | cria o projeto (aceita `--dry-run`, `--ide a,b,c`) |
| `update` | reinstala a skill se a versão bundled for mais nova |
| `doctor` | 8 health checks no projeto atual |
| `add-squad <nome>` | adiciona um squad |
