# Migração — trazer um projeto antigo para o padrão IAOX atual

Como o orquestrador migra um projeto criado numa versão antiga do IAOX God Mode
para o padrão atual (ecossistema, isolamento por app, vertical slices), **sem
perder nada** que o usuário criou.

## Princípio inviolável

**Nunca apague regras, memórias ou código do usuário.** Migração só **move,
mescla e cataloga** — nunca destrói. Em dúvida, preserve e sinalize para revisão
manual. Sempre exija um backup antes de começar.

## Passo 0 — Backup (obrigatório)

Antes de qualquer mudança:
- Se há git: `git add -A && git commit -m "chore: pre-migration snapshot"`.
- Se não há git: copie a pasta do projeto para um backup datado.
Confirme com o usuário que o backup existe antes de prosseguir.

## Passo 1 — Atualizar o framework

Garanta a versão nova do framework (fora do Claude): `iaox update` (ou
`npx github:jetooh/iaox update`). Isso sobrescreve skill/rules/agents/instruction
e **preserva** `ecosystem.json` e config. Só então rode `*migrate`.

## Passo 2 — Inventário

Liste o que existe e classifique cada item:

| Encontrado | Destino no padrão novo |
|------------|------------------------|
| Regras do usuário em `.claude/rules/*.md` (não-framework) | globais → ficam; específicas de uma app → `.claude/rules/apps/<app>/` |
| Memórias soltas (`agents/*/MEMORY.md`, `.md` de memória) | `.claude/memory/` (global) ou `.claude/memory/apps/<app>/` |
| Código de aplicação na raiz ou fora de `app/` | `app/<app>/` |
| Pacotes/libs compartilhadas | `packages/<nome>/` (`@ecosystem/<nome>`) |
| Specs/docs de features | `docs/features/<slug>/` |

**Regras de framework** (`vertical-slices.md`, `app-structure.md`, `tooling.md`,
`ecosystem.md`, `god-mode-overview.md`) já vieram do update — não as duplique.

## Passo 3 — Reorganizar (com confirmação)

Para cada app detectada:
1. Mova o código para `app/<app>/` (se estiver fora).
2. Crie `.claude/rules/apps/<app>/` e `.claude/memory/apps/<app>/` e mova para lá
   as regras/memórias que são específicas daquela app.
3. Registre a app no `ecosystem.json` (`apps[]`): stack detectada, próxima porta
   livre, `status: "active"`.

Apresente o plano de movimentação ao usuário e confirme antes de mover.

## Passo 4 — Config do monorepo

- Se a raiz não tem `package.json` com `workspaces`, **mescle** (não sobrescreva)
  para incluir `["app/*", "packages/*"]` + os scripts turbo.
- Garanta `tsconfig.base.json`, `eslint.config.js`, `.prettierrc.json` na raiz
  (o update já os adiciona se faltarem). Aponte os `tsconfig` das apps para o base.

## Passo 5 — Idioma e tooling (best-effort)

- Sinalize código com texto de UI em inglês (deveria ser pt-BR) e identificadores
  em português (deveriam ser inglês) — sem reescrever em massa; liste para o
  usuário decidir.
- Para apps JS/TS sem knip/Playwright, ofereça adicioná-los (não force).

## Passo 6 — Relatório

Ao final, entregue um resumo:
- ✅ **Movido:** o que foi para onde.
- 📦 **Catalogado:** apps/packages adicionados ao `ecosystem.json`.
- ⚠️ **Revisar manualmente:** ambiguidades, itens fora de padrão que precisam de
  decisão humana, violações de idioma.
- 🔒 **Preservado:** confirmação de que nada do usuário foi apagado (backup em X).

## Verificação final

Rode `*list-apps` e `*deps`, e (se aplicável) `npm install && npm run lint && npm test`
na raiz para confirmar que o ecossistema migrado está saudável.
