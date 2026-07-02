# IAOX — Ecossistema de Múltiplas Aplicações

Regra auto-carregada. Define como o orquestrador gerencia **várias aplicações**
como um ecossistema coeso (monorepo), não como pastas soltas.

## 1. Catálogo central — `ecosystem.json`

O arquivo `ecosystem.json` na raiz é a **fonte da verdade** de tudo que existe no
ecossistema. Toda app e todo package compartilhado estão registrados lá:

```json
{
  "apps": [
    { "name": "loja", "stack": "vite-react-vitest", "port": 5173, "status": "active", "path": "app/loja" }
  ],
  "packages": [
    { "name": "@ecosystem/ui", "path": "packages/ui" }
  ]
}
```

- **`*list-apps`** lê o `ecosystem.json` e mostra a tabela de apps (nome, stack,
  porta, status). É a visão do todo.
- O registry e o disco devem estar sempre em sincronia: nada de app em `app/` que
  não esteja no registry, nem entrada no registry sem pasta.

## 2. Monorepo — workspaces + Turborepo

- A raiz é um monorepo npm workspaces: `"workspaces": ["app/*", "packages/*"]`.
- **Dependências instalam na raiz** (`npm install` na raiz), não por app.
- Tarefas rodam via Turborepo: `npm run dev` / `build` / `test` / `lint` na raiz
  executam a tarefa em todas as apps/packages (com cache e paralelismo). Para uma
  app só: `npm run dev -- --filter=<app>`.

## 3. Código compartilhado — `packages/`

- Código usado por **mais de uma app** vai para `packages/<nome>` como
  `@ecosystem/<nome>` — **nunca duplique/copie entre apps** (ver `packages/README.md`).
- Ao extrair um package, registre-o em `ecosystem.json → packages[]`.
- Apps consomem via workspace: `import { Button } from '@ecosystem/ui'`.

## 4. Convenção de portas

- Cada app web tem uma **porta única e fixa**, começando em **5173** e
  incrementando (5173, 5174, 5175…). A porta fica no `ecosystem.json` e no
  `vite.config.ts` (`server.port`) / `playwright.config.ts` da app.
- Ao criar uma app, atribua a **próxima porta livre** (a maior porta do registry
  + 1, ou 5173 se for a primeira).

## 5. Ciclo de vida integrado ao registry

- **`*create-project`**: além de criar as pastas (ver `app-structure.md`),
  **adiciona a app ao `ecosystem.json`** com stack, porta atribuída e `status:
  "active"`.
- **`*delete-project`**: **remove a app do `ecosystem.json`** junto com as pastas.
- Manter o registry atualizado é obrigatório — é o que dá a visão do ecossistema.
