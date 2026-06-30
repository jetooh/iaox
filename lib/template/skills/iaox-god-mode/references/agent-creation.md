# Agent Creation — Schema & Protocol

Use this when intent = CREATE and the component is an **agent**.

## Elicit (one focused round)

- **name** — kebab-case id (e.g. `growth-analyst`)
- **persona** — a human name + one-line character (e.g. "Nova — data-driven growth strategist")
- **role** — the agent's domain and primary responsibility
- **commands** — the `*` commands it exposes
- **dependencies** — tasks/templates/checklists it relies on

Assume sensible defaults for anything not provided. Do not invent scope beyond
what the user asked for (No Invention).

## YAML frontmatter schema

```yaml
---
name: { name }
persona: { Human Name }
role: { one-line role }
icon: { emoji }
whenToUse: { trigger conditions }
commands:
  - "*help": Show available commands
  - "*{command}": { description }
dependencies:
  tasks:
    - { task-file }.md
  templates:
    - { template-file }.md
  checklists:
    - { checklist-file }.md
authority:
  owns:
    - { exclusive operation }
  delegatesTo:
    - { agent }: { what }
  blocked:
    - { operation reserved to another agent }
---
```

## Body structure

```markdown
# {Persona} — {Role}

## Persona
{2–3 sentences: voice, expertise, how it makes decisions.}

## Responsibilities
- {bullet}

## Commands
{table of * commands with descriptions}

## Workflow
{how this agent typically operates, step by step}

## Boundaries
- Owns: {...}
- Delegates: {...}
- Blocked: {git push, PRs → @devops}
```

## Save & register

1. Save to `.aiox-core/development/agents/{name}.md`
   (or `squads/{squad}/agents/{name}.md` for squad agents).
2. Add a command entry under `.claude/commands/IAOX/agents/` so `@name` resolves.
3. Update any entity registry / data file that lists agents.

## Validation checklist

- [ ] name is unique and kebab-case
- [ ] persona has a name and clear voice
- [ ] commands include `*help` and `*exit`
- [ ] authority block doesn't claim another agent's exclusive operation
- [ ] no invented responsibilities beyond the stated purpose
- [ ] absolute paths / imports where applicable
