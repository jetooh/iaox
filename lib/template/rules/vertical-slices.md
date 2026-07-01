# IAOX — Regra de Vertical Slices (organização de arquivos e código)

Regra auto-carregada. Define **como o orquestrador cria e arruma os arquivos** ao
desenvolver qualquer funcionalidade. O playbook completo (templates, passo a
passo) está em `.claude/skills/iaox-god-mode/references/vertical-slices.md`.

## Princípio

Todo trabalho de desenvolvimento é uma **vertical slice**: nasce de uma intenção
declarada, é implementada por tarefas rastreáveis e só é dado como pronto quando
passa no ship gate. **Intenção → SPEC → TASKS → código → SCORE.** Nunca escreva
código que não trace de volta a um critério de aceite.

## Layout obrigatório

- **Specs/docs ficam na raiz do orquestrador:** `docs/features/<slug>/` com
  `SPEC.md`, `TASKS.md`, `RULES.md`, `SCORE.md`, `DECISIONS.md`.
- **Código das aplicações vai para `app/<nome-do-app>/`.** A SPEC referencia o app
  no campo `App:` e os caminhos no campo `Touches:`.
- Ao criar uma feature, copie os templates de
  `.claude/skills/iaox-god-mode/references/feature-templates/`.

## O que o orquestrador SEMPRE faz

1. **Antes de codar, especifica.** Sem `SPEC.md` com critérios de aceite (AC-NN)
   testáveis, não começa a implementação.
2. **Toda tarefa cita seu AC** em `TASKS.md`. Sem tarefa órfã de critério.
3. **Todo commit fecha com `Closes-AC: AC-NN`** — o elo do código ao critério.
4. **Decisão não-óbvia → `DECISIONS.md`** (o "porquê" fica registrado).
5. **`Done` só com ship gate verde:** `SCORE.md` média ≥ 7, nenhuma dimensão MUST
   < 7, e todos os AC marcados `[x]`. Abaixo disso, volta ao `@dev`.
6. **No Invention (Art. IV):** toda feature traça a uma linha do `docs/PRD.md`
   (`§Features`, F-NN). Se não existe, `@pm` adiciona antes.

## Gatilhos

Aplica esta regra quando o usuário pedir para **criar/implementar uma feature,
tela, endpoint, componente ou aplicação** — o orquestrador cria a vertical slice
(`docs/features/<slug>/`) e roteia pelos agentes conforme o mapeamento do
playbook, escrevendo o código em `app/<nome-do-app>/`.
