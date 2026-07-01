# Vertical Slices — Como o orquestrador cria e organiza os arquivos

A metodologia que o IAOX God Mode usa para **criar código corretamente**: cada
funcionalidade é uma *fatia vertical* (vertical slice) — uma unidade que nasce de
uma intenção declarada, é implementada por tarefas rastreáveis e só é dada como
pronta quando passa num portão de qualidade. Intenção → spec → tarefas → código →
score. Nada de código que "deriva" da spec sem deixar rastro.

> Inspirado na disciplina de *vertical slices* (dev-kit de Rafael Melo),
> internalizado nos agentes e templates do IAOX. Não requer nenhuma dependência
> externa — os templates vivem nesta skill.

---

## 1. Estrutura de arquivos (na raiz do orquestrador)

```
<raiz-do-orquestrador>/          # o repositório (git)
├── .claude/
│   ├── rules/
│   │   ├── *.md                 # regras GLOBAIS (valem p/ todos os apps)
│   │   └── apps/<projeto>/      # regras SÓ daquele app (isoladas)
│   └── memory/apps/<projeto>/   # memórias SÓ daquele app (isoladas)
├── docs/
│   ├── PRD.md                   # visão do produto; §Features lista F-01, F-02…
│   └── features/<slug>/         # UMA pasta por vertical slice
│       ├── SPEC.md              # problema, escopo, critérios de aceite (AC-NN)
│       ├── TASKS.md             # AC quebrados em tarefas, cada uma cita seu AC
│       ├── RULES.md             # invariantes da feature (avaliadas pelo @qa)
│       ├── SCORE.md             # nota 0–10 por dimensão = ship gate
│       └── DECISIONS.md         # journal do "porquê" de cada escolha
└── app/<projeto>/               # o CÓDIGO da aplicação (o que roda/deploya)
```

**Regra de ouro do layout:** as **specs/docs ficam na raiz** (`docs/features/…`);
o **código vai para `app/<projeto>/`**. A spec aponta para o app no campo `App:` e
para os caminhos tocados no campo `Touches:`.

**Isolamento por app:** cada aplicação tem regras e memórias em pastas separadas
(`.claude/rules/apps/<projeto>/` e `.claude/memory/apps/<projeto>/`). Criar um
projeto cria essas pastas; excluir um projeto as remove. Ver a regra
`app-structure.md`.

**Idioma:** o código é escrito em **inglês** (identificadores, comentários,
commits); a **aplicação fala português** (UI, mensagens, i18n em pt-BR).

Os templates de cada arquivo estão em
`references/feature-templates/` (dentro desta skill) — copie de lá ao criar.

---

## 2. Criar uma feature (`*create-feature <slug>`)

1. **Deriva do PRD.** A feature deve existir em `docs/PRD.md §Features` (F-NN). Se
   não existir, `@pm` a adiciona primeiro (No Invention — Art. IV).
2. **Cria a pasta** `docs/features/<slug>/` e copia os 5 templates de
   `references/feature-templates/`.
3. **Preenche a SPEC** com `@sm`: problema, escopo, e **critérios de aceite
   testáveis** (AC-01, AC-02…). Cada AC precisa ser verificável sozinho.
4. **Valida** com `@po`: os AC cobrem o escopo? São verificáveis? (GO / NO-GO).
5. **Quebra em TASKS** — cada tarefa cita o AC que satisfaz. Sem tarefa órfã.

## 3. Implementar

- `@dev` executa `TASKS.md`, escrevendo o código em `app/<nome-do-app>/`.
- Cada commit fecha com o trailer **`Closes-AC: AC-NN`** — é o elo que liga a
  linha de código de volta ao critério que a motivou.
- Decisões não-óbvias durante a implementação → uma entrada em `DECISIONS.md`.

## 4. Portão de qualidade (ship gate)

- `@qa` avalia `RULES.md` (invariantes) e preenche `SCORE.md` (0–10 por dimensão).
- **Só marca `Done`** se a média ≥ 7 **e** nenhuma dimensão MUST < 7 **e** todos os
  AC marcados `[x]`. Abaixo disso → volta ao `@dev` com feedback específico.
- Publicação (`git push`/PR) é exclusiva do `@devops` (Art. II).

## 5. Mapeamento com os agentes IAOX

| Etapa vertical slice | Artefato | Agente |
|----------------------|----------|--------|
| Visão do produto | `docs/PRD.md` | `@pm` |
| Especificar a fatia | `features/<slug>/SPEC.md` | `@sm` |
| Validar critérios | (revisão da SPEC) | `@po` |
| Quebrar em tarefas | `TASKS.md` | `@sm` / `@dev` |
| Implementar | código em `app/<nome>/` | `@dev` |
| Invariantes + score | `RULES.md` + `SCORE.md` | `@qa` |
| Publicar | commit/PR | `@devops` |

## 6. Rastreabilidade (a cadeia que não pode quebrar)

```
PRD (F-NN) → SPEC (AC-NN) → TASKS (T-NN cita AC-NN) → commit (Closes-AC: AC-NN) → SCORE
```

Se algum elo faltar (tarefa sem AC, commit sem trailer, AC sem teste), a feature
**não está pronta** — o orquestrador sinaliza o elo quebrado em vez de dar como
concluída.
