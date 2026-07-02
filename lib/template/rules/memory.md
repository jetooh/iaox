# IAOX — Memória do orquestrador

Regra auto-carregada. Define como o orquestrador **lembra** de fatos e decisões
entre sessões — versionado no projeto e **compartilhado com o time** (diferente da
memória pessoal do seu Claude Code, que não vai para o repo).

## Onde a memória fica

- **Global** (do ecossistema): `.claude/memory/` — fatos/decisões que valem para
  todo o orquestrador.
- **Por app**: `.claude/memory/apps/<app>/` — fatos/decisões só daquela app.
- Cada pasta tem um **`MEMORY.md`** que é o **índice** (uma linha por memória).

## Formato de uma memória

Um arquivo `.md` por fato, com frontmatter:

```markdown
---
name: <slug-curto>
description: <uma linha — usada para decidir relevância>
type: project | decision | reference | feedback
---

<o fato. Para decision/feedback, explique o porquê. Linke outras memórias com [[slug]].>
```

- **project** — trabalho em andamento, contexto do ecossistema/app.
- **decision** — decisão arquitetural (por que é assim; alternativas descartadas).
- **reference** — ponteiro para recurso externo (URL, ticket, dashboard).
- **feedback** — orientação do usuário sobre como trabalhar.

## Escrever — quando e o quê

Registre o que **persiste entre sessões e não é óbvio do código/git**: decisões e
seu porquê, contexto de negócio, convenções combinadas, armadilhas resolvidas.
**Não** duplique o que o código, o `git log` ou o `ecosystem.json` já dizem.

- Fato do ecossistema → memória **global**.
- Fato de uma app → `apps/<app>/`.
- Depois de criar o arquivo, **adicione uma linha no `MEMORY.md`** correspondente:
  `- [Título](arquivo.md) — gancho de uma linha`.

## Recuperar

O `MEMORY.md` global é carregado toda sessão (via `@.claude/memory/MEMORY.md` no
`CLAUDE.md`). **Antes de agir**, consulte o índice; se uma memória é relevante à
tarefa, abra o arquivo. Ao trabalhar numa app, leia também o `MEMORY.md` dela.

## Manutenção

- **Atualize** a memória existente em vez de criar duplicata.
- **Delete** a memória que se provou errada (e a linha no índice).
- Memórias refletem o que era verdade quando escritas — se citam um arquivo/flag,
  confirme que ainda existe antes de confiar.

## Ciclo de vida (integrado ao `*create-project` / `*delete-project`)

- Criar app → cria `.claude/memory/apps/<app>/MEMORY.md` e registra a stack.
- Excluir app → remove `.claude/memory/apps/<app>/` (ver `app-structure.md`).
