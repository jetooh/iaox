# IAOX — Segredos (tokens, senhas, chaves)

Regra auto-carregada. Define como o ecossistema guarda e usa segredos com
segurança — **sem nunca vazá-los para o git, logs ou prompts**.

## Onde os segredos ficam

- **Globais do ecossistema:** `.env` na raiz (ex.: `GITHUB_TOKEN`, chaves de MCP).
- **Por aplicação:** `app/<app>/.env` — cada app tem os seus, isolados dos outros.
- **Nunca** commitados: `.env` e variações estão no `.gitignore`. Apenas os
  `.env.example` (sem valores) são versionados.

## Contrato — `.env.example`

Cada `.env` tem um **`.env.example` correspondente e versionado** listando as
chaves necessárias **sem valores**:

```
# app/loja/.env.example
DATABASE_URL=
STRIPE_SECRET_KEY=
VITE_API_URL=          # VITE_* é exposto ao browser — NUNCA para segredos
```

O `.env.example` é o contrato: quem clona o projeto sabe o que preencher.

## Regras invioláveis

1. **Nunca commite valores de segredo.** Só `.env.example` (vazio) vai para o git.
2. **Nunca faça hardcode** de token/senha no código — leia de `process.env` /
   `import.meta.env`.
3. **Nunca exponha segredo no client:** no Vite, só variáveis com prefixo
   `VITE_` chegam ao browser. Segredos **jamais** levam o prefixo `VITE_`.
4. **Nunca logue nem imprima** valores de segredo (nem em erro, nem em prompt).
5. Ao mostrar status, **mascare** (`ghp_****`), nunca o valor inteiro.

## Validação (falhe cedo)

Valide na inicialização que toda chave do `.env.example` existe no `.env`. Se
faltar, aborte com uma mensagem clara (recomendado: `zod` ou `envalid` num
`env.ts` que centraliza o acesso tipado às variáveis).

## Comando `*secrets`

**`*secrets [app]`** ajuda a gerenciar sem expor valores:
1. Compara `.env` com `.env.example` (raiz e/ou da app) e lista **o que falta**.
2. Mostra as chaves presentes **mascaradas** (`STRIPE_****`), nunca o valor.
3. Se faltar chave, oriente o usuário a preenchê-la (ou peça o valor e grave no
   `.env` — nunca no `.env.example` nem no git).

## Auditoria

O `@security` procura segredos hardcoded ou commitados (padrões de chave, `.env`
rastreado no git) como parte do ship gate. Segredo vazado = **BLOQUEADO**.

## Secret managers externos (opcional)

Para produção/equipe, os `.env` podem ser preenchidos a partir de um gerenciador
externo (Vault, 1Password, AWS/GCP Secrets Manager). A convenção local
(`.env` + `.env.example`) continua a mesma — muda só a origem dos valores.
