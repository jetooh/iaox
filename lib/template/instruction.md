# Instruction — Como o orquestrador IAOX deve trabalhar

Documento mestre das convenções da casa (JETOOH). Vale para todo trabalho feito
neste orquestrador. As regras detalhadas ficam em `.claude/rules/` — este arquivo
é o índice acionável ("como deve fazer").

---

## 1. Idioma — código em inglês, aplicação em português

- **Código em inglês:** identificadores, funções, variáveis, tipos, nomes de
  arquivos, comentários e mensagens de commit.
- **Aplicação em português (pt-BR):** todo conteúdo do usuário final — textos de
  UI, labels, mensagens, validações exibidas, e-mails, i18n.
- Resumo: **code in English, app speaks Portuguese.**

## 2. Memórias e regras — uma pasta por aplicação

Cada app tem memórias e regras **isoladas**, em pastas com o **nome da aplicação**:

- Regras do app → `.claude/rules/apps/<nome-da-aplicacao>/`
- Memórias do app → `.claude/memory/apps/<nome-da-aplicacao>/`
- Regras/memórias **globais** (valem para todos) → raiz de `.claude/rules/` e
  `.claude/memory/`.
- Nunca misture regras/memórias de apps diferentes na mesma pasta.

## 3. Estrutura de pastas

```
raiz/  (orquestrador — repositório git)
├── instruction.md                  # este documento
├── .claude/
│   ├── rules/{globais}.md + apps/<app>/
│   └── memory/{globais} + apps/<app>/
├── docs/
│   ├── PRD.md
│   └── features/<slug>/            # specs (vertical slices) — na raiz
├── app/<app>/                      # o CÓDIGO de cada aplicação
└── screenshot/                     # prints do Playwright (limpos a cada 12h)
```

- **Specs/docs ficam na raiz** (`docs/features/…`); **código vai para `app/<app>/`**.

## 4. Criar uma aplicação (`*create-project <app>`)

1. **Apresente o menu de stack** e pergunte qual o tipo (não crie sem escolher).
   Padrão da casa: **Vite + React + Vitest** (web) e **Flutter** (mobile).
2. Crie **`app/<app>/`** com o scaffold da stack escolhida.
3. Crie **`.claude/rules/apps/<app>/`** e **`.claude/memory/apps/<app>/`**.
4. Registre a stack escolhida na primeira memória do app.

## 5. Excluir uma aplicação (`*delete-project <app>`)

Remova **somente** estas três pastas (confirme o nome antes):
`app/<app>/`, `.claude/rules/apps/<app>/`, `.claude/memory/apps/<app>/`.
Nunca remova regras/memórias globais nem de outros apps.

## 6. Desenvolvimento em vertical slices

- Toda funcionalidade é uma fatia: **intenção → SPEC → TASKS → código → SCORE.**
- Cada feature vira `docs/features/<slug>/` (SPEC, TASKS, RULES, SCORE, DECISIONS).
- Todo commit fecha com `Closes-AC: AC-NN` (rastreabilidade).
- `Done` só com ship gate verde (SCORE ≥ 7 e AC verificados).

## 7. Tooling padrão

- **knip** por padrão em apps JS/TS — sem código/deps mortos (roda no ship gate).
- **Playwright** por padrão em apps web — acessa a app, roda E2E e bate
  screenshots.
- **Screenshots** vão para `screenshot/` na raiz; a pasta é **limpa a cada 12h**
  pelo hook `SessionStart`.

## 8. Governança (sempre)

- **No Invention:** toda feature traça ao `docs/PRD.md`.
- **Delegação:** trabalho especializado vai ao agente dono (@dev, @qa, @ux…).
- **Agent Authority:** `git push`/PR/release/MCP são exclusivos do `@devops`.

---

> Regras detalhadas: `.claude/rules/vertical-slices.md`, `app-structure.md`,
> `tooling.md`, `god-mode-overview.md`. Playbook completo:
> `.claude/skills/iaox-god-mode/references/vertical-slices.md`.
