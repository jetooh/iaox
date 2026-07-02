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

## 6. Config compartilhada (padronização)

Configuração vive **uma vez na raiz** e é herdada por todas as apps/packages:

- **TypeScript:** `tsconfig.base.json` na raiz; cada app faz
  `"extends": "../../tsconfig.base.json"` e só declara overrides (lib, jsx, types).
- **ESLint:** `eslint.config.js` (flat) na raiz cobre todo o monorepo. `npm run
  lint` na raiz roda `eslint .`. Não crie config de lint por app.
- **Prettier:** `.prettierrc.json` na raiz. `npm run format` formata tudo.

Ao gerar uma app, o scaffold já estende o `tsconfig.base.json` — não duplique
regras de config por app.

## 7. Contratos entre apps

Quando duas apps se comunicam (ex.: um front consome a API de um serviço do mesmo
ecossistema), os **tipos/contratos compartilhados** vão para
`packages/contracts` como **`@ecosystem/contracts`** — nunca redeclarados em cada
app. Assim, mudar o contrato num lugar quebra o build de quem depende (feedback
cedo), em vez de divergir silenciosamente. Registre o package em `ecosystem.json`.

## 8. Grafo de dependências (`*deps`)

**`*deps`** monta e mostra o grafo de dependências do ecossistema:

1. Leia o `ecosystem.json` (apps e packages).
2. Para cada app/package, extraia os imports `@ecosystem/*` do código.
3. Monte o grafo `app → package → package` e apresente como árvore/tabela.
4. **Detecte ciclos** (A → B → A) e sinalize como erro — dependências entre
   packages devem ser acíclicas.

Use o grafo antes de mover código para `packages/` e antes de releases, para saber
o que é afetado por uma mudança.

## 9. CI "affected"

O projeto gerado tem um workflow `.github/workflows/ecosystem-ci.yml` que, em cada
push/PR, roda `lint` + `knip` no ecossistema todo e **`turbo run test build
--affected`** — só testa/builda os workspaces que mudaram desde a base. Rápido
mesmo com muitas apps.

## 10. Release por app (Changesets)

Cada app/package versiona de forma **independente** via Changesets:
- `npm run changeset` — registra a mudança (escolhe apps afetadas + tipo de bump).
- `npm run version-packages` — aplica as versões e gera/atualiza o CHANGELOG por app.
- Publicação remota é do `@devops`.

## 11. Doctor do ecossistema (`*doctor`)

**`*doctor`** valida a saúde do ecossistema (executado pelo `@platform`):

| Check | Falha se… |
|-------|-----------|
| Registry ↔ disco | app no `ecosystem.json` sem pasta em `app/`, ou vice-versa |
| Portas únicas | duas apps com a mesma `port` |
| Apps órfãs | pasta em `app/` não registrada no `ecosystem.json` |
| Packages sem uso | package em `packages/` não importado por ninguém (via `*deps`) |
| Ciclos de dependência | `A → B → A` entre packages |
| Config compartilhada | app cujo `tsconfig.json` não estende `../../tsconfig.base.json` |

Reporte por severidade e proponha correções — nunca aplique sem confirmar.
