# IAOX — Estrutura de Apps, Isolamento e Idioma

Regra auto-carregada. Define **como múltiplas aplicações convivem** dentro do
orquestrador, como suas regras e memórias ficam **isoladas por projeto**, e a
**convenção de idioma** do código.

## Layout de múltiplos apps

```
raiz/  (orquestrador — repositório git)
├── .claude/
│   ├── rules/
│   │   ├── *.md                 # regras GLOBAIS (valem para todos os apps)
│   │   └── apps/
│   │       ├── projeto1/        # regras SÓ do projeto1
│   │       └── projeto2/        # regras SÓ do projeto2
│   └── memory/
│       └── apps/
│           ├── projeto1/        # memórias SÓ do projeto1
│           └── projeto2/        # memórias SÓ do projeto2
├── docs/features/<slug>/        # specs (vertical slices) na raiz
└── app/
    ├── projeto1/                # código da aplicação 1
    └── projeto2/                # código da aplicação 2
```

**Isolamento obrigatório:** cada aplicação em `app/<projeto>/` tem as suas regras
e memórias em **pastas separadas**: `.claude/rules/apps/<projeto>/` e
`.claude/memory/apps/<projeto>/`. Nunca misture regras/memórias de projetos
diferentes na mesma pasta. As regras globais (na raiz de `.claude/rules/`) valem
para todos; as de `apps/<projeto>/` valem só para aquele app.

## Ciclo de vida — criar um projeto (`*create-project <projeto>`)

Quando o usuário pedir para **criar um novo projeto/app `<projeto>`**, o
orquestrador conduz um fluxo curto ANTES de criar qualquer coisa:

### Passo 1 — Elicitar a stack (sempre apresentar o menu)

Pergunte **qual o tipo da aplicação**, apresentando este menu (o usuário escolhe
o número ou descreve a própria stack):

| # | Frontend Web | # | Backend / API | # | Mobile |
|---|--------------|---|---------------|---|--------|
| 1 | Next.js (React, App Router, TS) | 6 | NestJS (Node + TS) | 11 | React Native |
| 2 | Vite + React (SPA, TS) | 7 | Go | 12 | Flutter |
| 3 | Angular | 8 | Java (Spring Boot) | 13 | iOS (Swift) |
| | **Fullstack** | 9 | .NET (C#) | 14 | Android (Kotlin) |
| 4 | Next.js (fullstack) | 10 | PHP (Laravel) | | **Outro** |
| 5 | Angular + NestJS | 15 | Rust | 16 | Nenhum (pasta vazia) |

Se o usuário já disse a stack no pedido (ex.: "cria o app loja em next"), pule o
menu e confirme a escolha. Se a stack não estiver na lista, aceite a descrição
livre e faça o scaffold adequado.

### Passo 2 — Criar a estrutura

Com a stack escolhida, o orquestrador cria as três pastas:

1. `app/<projeto>/` — o código, com o **scaffold inicial da stack** escolhida
   (estrutura de pastas, arquivos base, config), seguindo a convenção de idioma.
2. `.claude/rules/apps/<projeto>/` — regras específicas do app (com um
   `README.md` inicial explicando o escopo e a stack).
3. `.claude/memory/apps/<projeto>/` — memórias específicas do app.

Registre a stack escolhida na primeira memória do app
(`.claude/memory/apps/<projeto>/`) para as próximas sessões.

## Ciclo de vida — excluir um projeto

Quando o usuário pedir para **excluir o projeto/app `<projeto>`**, o orquestrador
remove exatamente essas três pastas — e **somente** essas:

- `app/<projeto>/`
- `.claude/rules/apps/<projeto>/`
- `.claude/memory/apps/<projeto>/`

> Exclusão é destrutiva: confirme o nome do `<projeto>` com o usuário antes de
> remover. Nunca remova regras/memórias globais nem de outros apps.

## Convenção de idioma (sempre)

- **Código em inglês:** identificadores, funções, variáveis, tipos, nomes de
  arquivos, comentários e mensagens de commit são escritos em **inglês**.
- **Aplicação em português:** todo conteúdo voltado ao usuário final — textos de
  UI, labels, mensagens, validações exibidas, e-mails, conteúdo e i18n — é
  escrito em **português (pt-BR)**, idealmente via camada de i18n (chaves em
  inglês, valores em português).

Em resumo: **code in English, app speaks Portuguese.**
