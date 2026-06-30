# Framework Map — Paths & Boundaries

How the IAOX project is laid out, and what may or may not be modified.

## Directory map

```
project/
├── .claude/                     # Claude Code config
│   ├── settings.json            # permissions + deny rules
│   ├── rules/                   # contextual rules
│   ├── skills/iaox-god-mode/    # THIS skill
│   ├── commands/IAOX/agents/    # @agent command resolvers
│   └── CLAUDE.md                # project instructions
├── .aiox-core/                  # framework core (installed by aiox-core)
│   ├── constitution.md
│   ├── core/                    # engine internals
│   ├── development/
│   │   ├── agents/              # agent definitions
│   │   ├── tasks/               # executable tasks
│   │   ├── templates/           # document/code templates
│   │   ├── checklists/          # validation checklists
│   │   └── workflows/           # multi-step workflows
│   └── data/                    # registries, config data
├── docs/
│   ├── stories/                 # development stories
│   ├── prd/                     # product requirements
│   └── architecture/            # architecture docs
├── squads/                      # modular agent teams
└── .mcp.json                    # MCP servers
```

## Mutability layers (L1–L4)

| Layer | Mutability | Paths | Notes |
|-------|-----------|-------|-------|
| **L1** Framework Core | NEVER modify | `.aiox-core/core/`, `.aiox-core/constitution.md`, `bin/` | Protected |
| **L2** Framework Templates | Extend-only | `.aiox-core/development/{tasks,templates,checklists,workflows}/` | Add, don't edit shipped ones |
| **L3** Project Config | Conditionally mutable | `.aiox-core/data/`, `core-config.yaml`, agent MEMORY.md | Allowed via config |
| **L4** Project Runtime | ALWAYS modify | `docs/stories/`, `packages/`, `squads/`, `tests/` | The project's own work |

> Before any CONFIGURE action, check the layer. Reject edits to L1/L2 shipped
> files; create new files instead.

## Where to save new components

| Component | Path |
|-----------|------|
| Agent     | `.aiox-core/development/agents/{name}.md` |
| Task      | `.aiox-core/development/tasks/{name}.md` |
| Workflow  | `.aiox-core/development/workflows/{name}.md` |
| Checklist | `.aiox-core/development/checklists/{name}.md` |
| Template  | `.aiox-core/development/templates/{name}.md` |
| Rule      | `.claude/rules/{name}.md` |
| Data      | `.aiox-core/data/{name}.yaml` |
| Squad     | `squads/{name}/` |

## Constitution articles (enforced)

| # | Principle | Severity |
|---|-----------|----------|
| I   | CLI First | NON-NEGOTIABLE |
| II  | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV  | No Invention | MUST |
| V   | Quality First | MUST |
| VI  | Absolute Imports | SHOULD |
