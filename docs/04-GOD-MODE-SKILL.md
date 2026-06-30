# 04 — A Skill God Mode

Arquivo: `lib/template/skills/iaox-god-mode/SKILL.md` (instalado no projeto-alvo
em `.claude/skills/iaox-god-mode/`).

## O que é

Um `SKILL.md` (markdown com frontmatter) + 4 referências. Não é binário nem
servidor — é um conjunto de instruções que o Claude Code segue. É a **camada de
roteamento e orquestração** sobre os agentes do `aiox-core`.

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
| 0 — PERSISTENT SESSION MODE | Mantém o modo ativo até `*exit`; mostra status `🟢 IAOX God Mode` |
| 1 — Intent Classification | Classifica cada pedido em OPERATE / CREATE / CONFIGURE |
| 2 — Operation Engine | Despacha o agente dono via Task + `subagent_type` (tabela) |
| 3 — Creation Engine | Cria componentes (agent/task/workflow/squad/etc.) |
| 4 — Configure Engine | Modifica settings/rules respeitando camadas L1–L4 |
| 5 — Quick Commands | `*route`, `*agents`, `*orchestrate`, `*create-*`, `*exit`, ... |
| 6 — Governance | No Invention, delegação, story-driven, quality first, CLI first |
| 7 — References | Quando ler cada referência |

## Referências (`references/`)

| Arquivo | Conteúdo |
|---------|----------|
| `agent-matrix.md` | Agentes, personas, `subagent_type`, autoridade exclusiva, fluxos canônicos |
| `workflow-playbooks.md` | SDC, QA Loop, Spec Pipeline, Brownfield + guia de seleção |
| `agent-creation.md` | Schema YAML + corpo para criar novos agentes |
| `framework-map.md` | Paths do projeto, camadas L1–L4, onde salvar componentes, constituição |

## Fluxo de operação (autônomo)

```
Pedido do usuário
   │
   ▼  classifica intent
OPERATE ── escolhe agente dono (agent-matrix) ── Task(subagent_type) ── relata ── encadeia workflow
CREATE  ── classifica componente ── lê referência ── gera ── valida ── registra
CONFIGURE ── localiza alvo (framework-map) ── checa camada ── altera mínimo ── explica
```

### Exemplo

Usuário: *"crie o endpoint de login com testes"* →
intent OPERATE → dono `@dev` →
```
Task(subagent_type: "aiox-dev",
     description: "Implement login endpoint",
     prompt: "Implement POST /login per the active story, with validation,
              error handling and unit tests. Report files + test results.")
```
→ encadeia para `aiox-qa` (quality gate), conforme o SDC.

## Persistência (resumo)

Reforçada por 3 camadas recarregadas a cada turno (ver
[02-ARCHITECTURE.md](02-ARCHITECTURE.md) e [03-DESIGN-DECISIONS.md](03-DESIGN-DECISIONS.md#adr-5--god-mode-persistente-na-sessão)):
`SKILL.md` §0, a rule `god-mode-overview.md`, e o bloco no `CLAUDE.md`.

## Como evoluir a skill

1. Edite `SKILL.md` e/ou as referências.
2. Bumpe `version` em `lib/template/template.json`.
3. Teste com `--dry-run` (ver [07-TESTING.md](07-TESTING.md)).
4. Em projetos já criados, rode `update` para reinstalar a skill nova.
