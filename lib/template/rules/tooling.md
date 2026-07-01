# IAOX — Tooling Padrão (knip, Playwright, screenshots)

Regra auto-carregada. Define as ferramentas que cada aplicação criada dentro do
orquestrador recebe **por padrão**, e a política de screenshots.

## knip — código morto (apps JS/TS)

Todo app cuja stack seja **JavaScript/TypeScript** (Vite+React+Vitest, Next.js,
Angular, NestJS, React Native) recebe o **knip** por padrão:

- Instalar como devDependency no `app/<projeto>/`: `npm i -D knip`.
- Adicionar o script `"knip": "knip"` ao `package.json` do app.
- Rodar o knip antes de fechar uma feature (parte do ship gate do `@qa`): não
  deixar exports, arquivos ou dependências não usados.

> Stacks não-JS/TS (Flutter, Go, Java, Rust, .NET, PHP) **não** usam knip — usam o
> analisador nativo da linguagem (ex.: `flutter analyze`, `go vet`).

## Playwright — acesso à app, testes E2E e screenshots (apps web)

Todo app com **interface web** (Vite+React+Vitest, Next.js, Angular) recebe o
**Playwright** por padrão:

- Instalar no `app/<projeto>/`: `npm i -D @playwright/test` + `npx playwright install`.
- Usar o Playwright para **acessar a aplicação**, rodar testes E2E e **bater
  screenshots** das telas.
- Os screenshots validam os critérios de aceite visuais da vertical slice.

## Screenshots — pasta única na raiz do orquestrador

- **Todos** os screenshots (de qualquer app) são salvos em **`screenshot/`** na
  **raiz do orquestrador** — nunca dentro de `app/<projeto>/`.
- Convenção de nome: `screenshot/<projeto>-<tela>-<AAAAMMDD-HHMM>.png`.
- A pasta `screenshot/` é ignorada pelo git (é volátil).

## Limpeza automática a cada 12 horas

A pasta `screenshot/` é **limpa automaticamente a cada 12 horas** pelo hook
`SessionStart` (`.claude/iaox-clean-screenshots.cjs`): no início de uma sessão, se
passaram ≥ 12h desde a última limpeza, ele apaga tudo dentro de `screenshot/` e
regrava o marcador `screenshot/.last-clean`. É determinístico e silencioso —
nunca bloqueia a sessão.

> Precisa de um screenshot além de 12h? Copie-o para fora de `screenshot/` (ex.:
> `docs/features/<slug>/`), pois a pasta é efêmera por design.
