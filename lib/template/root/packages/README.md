# packages/ — código compartilhado do ecossistema

Bibliotecas reutilizadas por **múltiplas apps** (design system, tipos, utils,
clients de API, auth). Cada pasta aqui é um **workspace** próprio.

## Regra de ouro

**Não duplique código entre apps.** Se algo é usado por mais de uma app, extraia
para um package aqui e importe via workspace — nunca copie/cole entre `app/*`.

## Convenção

- Nome no `package.json`: `@ecosystem/<nome>` (ex.: `@ecosystem/ui`,
  `@ecosystem/types`, `@ecosystem/api-client`).
- As apps importam assim: `import { Button } from '@ecosystem/ui';`
- Todo package novo é registrado em `ecosystem.json` → `packages[]`.

## Exemplos típicos

| Package | Conteúdo |
|---------|----------|
| `@ecosystem/ui` | design system / componentes compartilhados |
| `@ecosystem/types` | tipos e contratos entre apps |
| `@ecosystem/utils` | funções utilitárias puras |
| `@ecosystem/api-client` | client HTTP tipado para os serviços internos |
