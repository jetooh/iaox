# Agent Matrix — Routing & Authority

The IAOX framework ships 11 core agents (installed by `aiox-core`) plus 4 house
agents (installed by this CLI in `.claude/agents/`). This matrix is how God Mode
decides **who** handles a request.

## Agents — dispatch map

To call an agent autonomously, use the Task tool with its `subagent_type`.

| Agent | Persona | `subagent_type` | Domain |
|-------|---------|-----------------|--------|
| `@dev`               | Dex    | `aiox-dev`           | Full-stack implementation |
| `@qa`                | Quinn  | `aiox-qa`            | Test architecture & quality gates |
| `@architect`         | Aria   | `aiox-architect`     | System architecture & design |
| `@pm`                | Morgan | `aiox-pm`            | Product management, PRDs, epics |
| `@po`                | Pax    | `aiox-po`            | Product owner, story validation, backlog |
| `@sm`                | River  | `aiox-sm`            | Scrum master, story creation |
| `@analyst`           | Alex   | `aiox-analyst`       | Research, market & competitive analysis |
| `@data-engineer`     | Dara   | `aiox-data-engineer` | Database design, migrations, RLS, queries |
| `@ux-design-expert`  | Uma    | `aiox-ux`            | UX/UI design, wireframes, design system |
| `@devops`            | Gage   | `aiox-devops`        | Git push, PRs, CI/CD, MCP management |
| `@aiox-master`       | Orion  | _(skill, not subagent)_ | Framework governance & orchestration |

### House agents (JETOOH — `.claude/agents/`)

| Agent | `subagent_type` | Domain | Chamado quando |
|-------|-----------------|--------|----------------|
| `@platform` | `platform` | Guardião macro do ecossistema (grafo, contratos, releases, doctor) | cross-app, antes de release, diagnóstico |
| `@scaffolder` | `scaffolder` | Gera o scaffold determinístico da stack | passo 2 do `*create-project` |
| `@security`   | `security`   | Gate de segurança (OWASP, segredos, deps) | antes do `Done`, ou features sensíveis |
| `@e2e`        | `e2e`        | Testes E2E + screenshots (Playwright) | validar AC visuais / bater print |
| `@i18n`       | `i18n`       | Convenção de idioma (code EN / app PT) | telas com texto ao usuário |
| `@observability` | `observability` | SRE + LLM observability (Golden Signals, SLO, telemetria, evals, incidentes) | após deploy, monitorar produção, qualidade de IA |
| `@finops`     | `finops`     | Custo cloud + IA (routing, caching, compression, budget, atribuição) | reduzir custo, dimensionar features de IA, escalar |
| `@a11y`       | `a11y`       | Acessibilidade WCAG 2.2 AA (teclado, semântica, contraste, axe) | telas/componentes de UI, antes do Done |

> If an `aiox-*` subagent isn't available, adopt the agent's persona inline by
> reading `.aiox-core/development/agents/{name}.md` and executing as that agent.
> The house agents live in `.claude/agents/{name}.md`.

## Exclusive authority (NON-NEGOTIABLE)

| Operation | Owner | Everyone else |
|-----------|-------|---------------|
| `git push` / `git push --force` | `@devops` | BLOCKED |
| `gh pr create` / `gh pr merge`  | `@devops` | BLOCKED |
| MCP add/remove/configure        | `@devops` | BLOCKED |
| CI/CD pipeline management        | `@devops` | BLOCKED |
| `*execute-epic` / `*create-epic` | `@pm`    | — |
| `*validate-story-draft`          | `@po`    | — |
| `*draft` / `*create-story`       | `@sm`    | — |

## Routing rules

1. **Implementation** → `@dev`. Allowed local git (add/commit/branch/merge),
   but **never push** — hand push to `@devops`.
2. **Quality / review** → `@qa`.
3. **Architecture / tech selection** → `@architect`; detailed DDL delegated to
   `@data-engineer`.
4. **Requirements / spec / epic** → `@pm`.
5. **Story validation / backlog** → `@po`.
6. **Story creation** → `@sm`.
7. **Research** → `@analyst`.
8. **Anything touching the remote (push/PR/release/MCP)** → `@devops`.
9. **Framework governance / cross-agent orchestration** → `@aiox-master`.

## Canonical flows

```
Story:  @sm *draft → @po *validate → @dev *develop → @qa *qa-gate → @devops *push
Epic:   @pm *create-epic → @pm *execute-epic → @sm *draft (per story)
Schema: @architect (decides tech) → @data-engineer (implements DDL)
Push:   ANY agent → @devops *push
```

## Escalation

- Agent can't complete → escalate to `@aiox-master`.
- Quality gate fails → return to `@dev` with specific feedback.
- Constitutional violation → BLOCK, require a fix before proceeding.
- Boundary conflict → `@aiox-master` mediates.
