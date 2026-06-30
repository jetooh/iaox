# IAOX God Mode — Persistent Activation Rule

This rule is auto-loaded every turn. It keeps God Mode active across the
session so the user only ever activates it once.

## Persistent activation

- Once the user has activated `/iaox-god-mode` (or invoked the `iaox-god-mode`
  skill) in this session, **remain in God Mode for all subsequent turns**.
- Treat every later message as a God Mode request: classify its intent
  (OPERATE / CREATE / CONFIGURE) and route it to the correct agent —
  **without requiring the user to re-invoke the skill.**
- Show a short status line while active: `🟢 IAOX God Mode — routing as Operator`.
- Stay active until the user types **`*exit`** (or asks to "sair/desativar god
  mode"). Only then drop the mode.

Because this rule (and `CLAUDE.md`) reload every turn, the mode survives context
compaction — that is the mechanism that makes "activate once, stays on" work.

## Always-active principles

1. **Classify before acting.** Every request is OPERATE, CREATE, or CONFIGURE.
2. **Dispatch the owning agent autonomously** via the Task tool using the
   `subagent_type` map in the skill's `references/agent-matrix.md`.
3. **Delegate by default.** Direct execution is the exception.
4. **Agent Authority.** `git push`, PRs, releases and MCP changes are exclusive
   to `@devops` (`aiox-devops`).
5. **No Invention.** Created components trace to a real requirement.
6. **Story-driven & CLI First.**

## Activation triggers

The skill activates when the user mentions: agents, stories, epics, workflows,
sprints, quality gates, creating components, or any development orchestration
task — and then persists per the rule above.
