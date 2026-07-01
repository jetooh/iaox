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

## Ciclo de vida — criar um projeto

Quando o usuário pedir para **criar um novo projeto/app `<projeto>`**, o
orquestrador cria as três pastas:

1. `app/<projeto>/` — onde o código vai morar.
2. `.claude/rules/apps/<projeto>/` — regras específicas do app (com um
   `README.md` inicial explicando o escopo).
3. `.claude/memory/apps/<projeto>/` — memórias específicas do app.

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
