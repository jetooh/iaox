# 04 — A Skill God Mode

Arquivo: `lib/template/skills/iaox-god-mode/SKILL.md` (instalado no projeto-alvo
em `.claude/skills/iaox-god-mode/`, e nas demais IDEs selecionadas).

## O que é

Um `SKILL.md` (markdown com frontmatter) + referências + templates de feature +
scaffolds. Não é binário nem servidor — é um conjunto de instruções que o Claude
Code segue. É a **camada de roteamento e orquestração** sobre os agentes do
`aiox-core` e sobre as convenções da casa.

## Frontmatter

```yaml
name: iaox-god-mode
description: The Supreme IAOX Operator — a PERSISTENT session mode ...
allowed-tools: Read Write Edit Glob Grep Task Bash(git:*) Bash(npm:*) ...
argument-hint: [command | natural-language request]
```

> `Task` está em `allowed-tools` porque a skill **dispara subagentes**.

## Estrutura interna da SKILL.md

| Seção | Função |
|-------|--------|
| 0 — PERSISTENT SESSION MODE | Mantém o modo ativo até `*exit`; status `🟢 IAOX God Mode` |
| 1 — Intent Classification | Classifica cada pedido em OPERATE / CREATE / CONFIGURE |
| 2 — Operation Engine | Despacha o agente dono via Task + `subagent_type` (tabela) |
| 3 — Creation Engine | Cria componentes (feature/agent/task/workflow/squad/rule/…) |
| 4 — Configure Engine | Modifica settings/rules respeitando camadas L1–L4 |
| 5 — Quick Commands | operação + criação (incl. `*create-project`, `*deps`, `*secrets`, `*migrate`) |
| 6 — Governance | No Invention, delegação, story-driven, quality first, CLI first |
| 7 — References | Quando ler cada referência |

## Os três engines

- **OPERATE** — escolhe o agente dono (agent-matrix), despacha via
  `Task(subagent_type)`, relata e encadeia o workflow (SDC etc.). Autoridade
  exclusiva do `@devops` para push/PR/release/MCP.
- **CREATE** — classifica o componente, lê a referência, elicita o mínimo, gera
  do template, valida (No Invention) e registra no path correto. Inclui criar
  **features (vertical slices)** em `docs/features/<slug>/` e apps via
  `*create-project`.
- **CONFIGURE** — localiza o alvo (framework-map), checa a camada L1–L4, aplica a
  mudança mínima (merge, não sobrescreve) e explica.

## Comandos (seção 5)

### Operação
| Comando | Ação |
|---------|------|
| `*route {task}` | Classifica + despacha para o agente ótimo |
| `*agents` | Lista agentes + seus `subagent_type` |
| `*list-apps` | Apps do ecossistema a partir de `ecosystem.json` (nome, stack, porta, status) |
| `*deps` | Grafo de dependências do ecossistema (app → package) + detecção de ciclos |
| `*doctor` | Saúde do ecossistema (registry↔disco, portas, órfãs, ciclos) via `@platform` |
| `*secrets [app]` | Checa `.env` vs `.env.example` (chaves faltantes), valores mascarados |
| `*migrate` | Traz um projeto ANTIGO para o padrão atual, preservando rules/memórias |
| `*workflows` · `*orchestrate` · `*lifecycle` · `*matrix` · `*constitution` · `*diagnose` · `*sprint` | Operação de framework |
| `*exit` | Desativa o God Mode na sessão |

### Criação
`*create-project {name}` · `*delete-project {name}` · `*create-feature {slug}`
`*create-agent` · `*create-task` · `*create-workflow` · `*create-squad`
`*create-checklist` · `*create-template` · `*create-rule` · `*create-data`
`*configure {target}`

> `*create-project {name}` apresenta um **menu de stack**, cria `app/{name}/` com
> o scaffold determinístico e as pastas isoladas
> `.claude/rules/apps/{name}/` + `.claude/memory/apps/{name}/`, e registra no
> `ecosystem.json`. `*delete-project {name}` remove exatamente essas pastas
> (confirmando antes). `*create-feature {slug}` cria a vertical slice em
> `docs/features/{slug}/` a partir de `references/feature-templates/`.

## Referências (`references/`)

| Arquivo | Conteúdo |
|---------|----------|
| `vertical-slices.md` | Como criar/organizar código: feature slices, ship gate, layout |
| `migration.md` | Migrar um projeto antigo para o padrão atual (`*migrate`) — seguro, preservando |
| `agent-matrix.md` | Agentes, personas, `subagent_type`, autoridade exclusiva, fluxos |
| `workflow-playbooks.md` | SDC, QA Loop, Spec Pipeline, Brownfield + guia de seleção |
| `agent-creation.md` | Schema YAML + corpo para criar novos agentes |
| `framework-map.md` | Paths do projeto, camadas L1–L4, onde salvar componentes |
| `ecosystem.schema.json` | Schema JSON do `ecosystem.json` (validação do catálogo) |
| `feature-templates/` | SPEC, TASKS, RULES, SCORE, DECISIONS (base da vertical slice) |
| `scaffolds/` | Scaffolds determinísticos: `vite-react-vitest`, `flutter` |

## Agentes

**11 agentes core** (do `aiox-core`), despachados via `subagent_type` (ver
[01-MEMORY.md](01-MEMORY.md)). Além deles, **8 agentes da casa** instalados em
`.claude/agents/` (só claude-code), catalogados em `references/agent-matrix.md`:

| Agente | Papel |
|--------|-------|
| `@scaffolder` | gera o scaffold determinístico da stack (por-app) |
| `@security` | gate de segurança (OWASP, segredos, deps) |
| `@e2e` | testes E2E + screenshots (Playwright) |
| `@i18n` | convenção de idioma (code EN / app PT) |
| `@platform` | guardião macro do ecossistema (grafo, contratos, releases Changesets, `*doctor`) |
| `@observability` | SRE + LLM observability (Golden Signals, SLO, OpenTelemetry, evals/hallucination/token-cost/drift, incidentes) |
| `@finops` | custo cloud + IA (model routing, caching, prompt compression, budget, custo por feature) |
| `@a11y` | acessibilidade WCAG 2.2 AA (teclado, semântica, contraste, axe-core) |

## Fluxo de operação (autônomo)

```
Pedido do usuário
   │
   ▼  classifica intent
OPERATE ── escolhe agente dono (agent-matrix) ── Task(subagent_type) ── relata ── encadeia workflow
CREATE  ── classifica componente/feature ── lê referência ── gera ── valida ── registra
CONFIGURE ── localiza alvo (framework-map) ── checa camada ── altera mínimo ── explica
```

## Persistência (resumo)

Reforçada por 3 camadas recarregadas a cada turno (ver
[02-ARCHITECTURE.md](02-ARCHITECTURE.md) e [03-DESIGN-DECISIONS.md](03-DESIGN-DECISIONS.md#adr-5--god-mode-persistente-na-sessão)):
`SKILL.md` §0, a rule `god-mode-overview.md`, e o bloco no `CLAUDE.md` (que
também aponta para `@instruction.md`, as convenções da casa).

## Como evoluir a skill

1. Edite `SKILL.md`, as referências, as regras, os agentes, os scaffolds ou o
   `instruction.md` (tudo em `lib/template/`).
2. Bumpe `version` em `lib/template/template.json`.
3. Teste com `--dry-run` e `npm test` (ver [07-TESTING.md](07-TESTING.md)).
4. Em projetos já criados, rode `update` — reinstala o framework preservando os
   dados do usuário (ecosystem.json, config, settings).
