# 03 — Decisões de Design (ADRs) + Regras de Manutenção

Cada decisão registra o **contexto**, a **escolha** e o **porquê**. Datas
absolutas (sessão de criação: 2026-06-30; evolução para ecossistema e rebrand
`@jetooh/iaox`: 2026-07-01). ADR-1 a ADR-7 vêm da concepção; ADR-8 a ADR-14 são
da evolução para orquestrador multi-app.

---

## ADR-1 — Instalador `create-*` que reusa `aiox-core`

**Contexto:** O `create-aiox-god-mode` original não recria o framework — ele roda
`npx aiox-core init` e injeta uma skill. A "mágica" não está no código do
instalador (trivial: commander + spawnSync + fs-extra), e sim na curadoria do
que amarrar e no `SKILL.md`.

**Escolha:** Replicar essa arquitetura — instalador fino que delega ao
`aiox-core` (os 11 agentes, constitution, workflows vêm dele).

**Porquê:** Evita reescrever um framework inteiro; concentra o esforço onde há
valor (a skill). O instalador é substituível em horas.

---

## ADR-2 — Skill God Mode própria (não copiar a do gutomec)

**Contexto:** O usuário quer "o seu" com a mesma ideia.

**Escolha:** Escrever uma `SKILL.md` original que orquestra os agentes reais do
`aiox-core`. A skill é a **camada de roteamento**, não recria agentes.

**Porquê:** É onde mora o diferencial. Mantém compatibilidade com o framework
instalado e permite evoluir o comportamento do operador livremente.

---

## ADR-3 — 4 IDEs alvo

**Escolha:** Claude Code, Codex, Cursor, Gemini CLI (`lib/utils/tool-paths.js`).

**Porquê:** Cobre as ferramentas que o usuário usa, mantendo o conversor simples
(JSON/TOML/markdown). Claude Code é o principal (skill + MCP + rules completos).

---

## ADR-4 — Branding centralizado em `lib/constants.js`

**Escolha:** Todo nome/identidade (pacote, skill, framework, MCPs, ecossistema)
vive em `constants.js`.

**Porquê:** Renomear/re-brandar o projeto inteiro = editar um arquivo só. Reduz
acoplamento e erros de busca-e-troca.

**Regra:** Nunca hard-codar nome de pacote/skill espalhado pelo código. Importar
de `constants.js`.

---

## ADR-5 — God Mode persistente na sessão

**Contexto:** Requisito explícito do usuário: "ao ativar `/iaox-god-mode` uma vez,
ele sempre fica ativo na sessão".

**Escolha:** Persistência por 3 camadas recarregadas a cada turno: seção 0 da
`SKILL.md`, a rule `god-mode-overview.md`, e o bloco injetado no `CLAUDE.md`
(marcadores idempotentes). Sai do modo só com `*exit`.

**Porquê:** O Claude Code não tem estado de sessão fora do contexto. Arquivos
sempre-carregados (CLAUDE.md/rules) são o mecanismo que sobrevive à compactação.

**Regra:** Qualquer mudança na ativação deve preservar o gatilho de saída
(`*exit`) e a idempotência do bloco injetado.

---

## ADR-6 — Invocação autônoma via subagentes (Task)

**Contexto:** Escolha do usuário entre autônomo vs interativo.

**Escolha:** A skill **dispara** o agente dono via Task tool com `subagent_type`
(autônomo), em vez de só nomeá-lo ou adotar persona interativa.

**Porquê:** Entrega o efeito "God Mode" — pedir em linguagem natural e receber o
resultado pronto. Fallback para persona inline se o subagente não existir.

**Regra:** Manter a tabela pedido→agente→`subagent_type` sincronizada entre a
`SKILL.md` (seção 2) e `references/agent-matrix.md`.

---

## ADR-7 — Flag `--dry-run`

**Contexto:** O wizard interativo do `aiox-core` torna o E2E lento e exige TTY.

**Escolha:** `--dry-run [--ide a,b,c]` substitui o wizard por `scaffoldDryRun`
(esqueleto mínimo) e pula rede/npm/git, mas roda **de verdade** o código próprio
(skill, MCPs, conversão, persistência).

**Porquê:** Itera no CLI em ~1s sem encarar a instalação completa.

**Regra:** Toda etapa que faz rede ou efeito pesado (git/npm) deve respeitar
`dryRun`. Etapas que escrevem arquivos locais do projeto devem **rodar** no
dry-run (é o que queremos validar).

---

## ADR-8 — Rebrand para `@jetooh/iaox` v2.0.0 (só GitHub)

**Contexto:** O projeto amadureceu de "instalador estilo `create-*`" para um CLI
completo com identidade própria. O pacote é distribuído por
`npx github:jetooh/iaox <nome>`, **não** publicado no npm.

**Escolha:** Nome `@jetooh/iaox`, binário `iaox`, versão 2.0.0. `CLI_VERSION`
lida do `package.json` (`constants.js`) — nunca dessincroniza.

**Porquê:** Identidade única (JETOOH), instalação sem passo de publicação, versão
sempre coerente com o `package.json`.

**Regra:** Manter `bin` (`iaox`), `repository` e o comando de instalação do
README coerentes. Não hard-codar versão fora do `package.json`.

---

## ADR-9 — Ecossistema multi-app (monorepo) por padrão

**Contexto:** O usuário não quer um app isolado — quer um **orquestrador** que
hospede várias apps que compartilham código e convenções.

**Escolha:** Cada projeto nasce monorepo: workspaces (`app/*` + `packages/*`) +
Turborepo, catálogo `ecosystem.json` (fonte da verdade de apps/packages), config
compartilhada na raiz (`tsconfig.base.json`, `eslint.config.js` flat,
`.prettierrc.json`), portas únicas por app e contratos em `packages/contracts`.
Tudo vem de `lib/template/root/`, copiado com `overwrite:false`.

**Porquê:** Evita duplicação entre apps, dá cache/paralelismo de tarefas e uma
visão do todo (`*list-apps`, `*deps`). É a "Camada 1/2" do projeto.

**Regra:** `ecosystem.json` e disco devem ficar em sincronia. `packages/` guarda
o que é usado por 2+ apps. Config nunca é duplicada por app — é herdada da raiz.

---

## ADR-10 — Agentes da casa (`@scaffolder`, `@security`, `@e2e`, `@i18n`)

**Contexto:** Os 11 agentes core do `aiox-core` cobrem o SDLC genérico, mas as
convenções da casa (scaffold determinístico, gate de segurança, E2E+screenshots,
idioma) precisam de donos explícitos.

**Escolha:** Instalar 4 subagentes próprios em `.claude/agents/` (só claude-code).

**Porquê:** Dá autoridade clara a cada convenção e permite despachá-los como
subagentes, sem inflar a `SKILL.md`.

**Regra:** Agentes da casa vivem em `lib/template/agents/`. São **framework** —
sobrescritos no `update`, preservados no `init`.

---

## ADR-11 — Scaffold determinístico e versionado

**Contexto:** Deixar cada app ser criada "do zero" pela IA gera inconsistência e
projetos que não passam em testes/lint/build de fábrica.

**Escolha:** As stacks padrão da casa têm scaffold **determinístico** versionado
em `references/scaffolds/` (`vite-react-vitest`, `flutter`), com placeholders
(`__APP_NAME__`, `__PORT__`). Outras stacks geram um scaffold mínimo idiomático.

**Porquê:** App nova nasce com testes, lint e build passando; `@scaffolder`
apenas materializa o template e substitui placeholders.

**Regra:** Ao mudar um scaffold, mantê-lo com `test`/`lint`/`build` verdes e
preservar os placeholders. Bumpar a versão da skill.

---

## ADR-12 — Vertical slices internalizado

**Contexto:** Desenvolvimento sem rastreabilidade vira código órfão. Referência:
`vertical-slices-md-dev-kit` de Rafael Melo.

**Escolha:** Internalizar a metodologia: toda feature é
`docs/features/<slug>/` (SPEC, TASKS, RULES, SCORE, DECISIONS), todo commit fecha
com `Closes-AC: AC-NN`, e `Done` só com **ship gate** verde. Regra
`vertical-slices.md` + playbook em `references/vertical-slices.md` +
`references/feature-templates/`.

**Porquê:** Cada linha de código traça de volta a um critério de aceite (reforça
o No Invention).

**Regra:** Specs/docs ficam na raiz (`docs/features/`); código vai para
`app/<app>/`. Não escrever código que não trace a um AC.

---

## ADR-13 — Secrets + cofre de acessos (`access.md`)

**Contexto:** Um ecossistema multi-app acumula tokens, logins de teste, SSH e
URLs. Nada disso pode vazar para o git.

**Escolha:** `.env` global + `app/<app>/.env` por app (só `.env.example`
versionado) + `access.md` (cofre local: logins/tokens/SSH/URLs, criado de
`access.example.md` no post-setup). `.gitignore` blinda `.env*` e `access.md`.
`*secrets` checa chaves faltantes sem vazar valores. Regra `secrets.md`.

**Porquê:** Agentes precisam acessar/testar as apps sem que segredos entrem no
repositório.

**Regra:** Nunca commitar `.env`/`access.md`. Só `*.example` são versionados.

---

## ADR-14 — Modo `update` preserva dados do usuário

**Contexto:** Reinstalar o framework num projeto ativo não pode apagar as apps
registradas nem a config do usuário.

**Escolha:** `update` distribui skill+rules+agents+instruction **sobrescrevendo**
o framework (`overwrite:true`), mas **preserva** dados do usuário: `ecosystem.json`
e demais arquivos de `root/` (`overwrite:false`), `settings.json` (merge). O
teste `install.test.js` valida isso: corrompe uma regra (restaurada) e adiciona
uma app ao registry (preservada).

**Porquê:** Atualizar o framework deve trazer as melhorias sem destruir o estado
do projeto.

**Regra:** Framework (skill, rules, agents, instruction) = sobrescreve. Dados do
usuário (ecosystem.json, root config, settings) = preserva. Testar sempre com
`install.test.js`.

---

## Regras de manutenção / boundaries

1. **Não modificar o framework** (`aiox-core`) a partir daqui — ele é instalado,
   não versionado neste repo. Respeitar as camadas L1–L4 (ver
   `lib/template/skills/iaox-god-mode/references/framework-map.md`).
2. **Branding sempre via `constants.js`.**
3. **Tudo que é instalado** vive em `lib/template/`: skill + referências
   (`skills/iaox-god-mode/`), regras (`rules/`), agentes (`agents/`), config +
   hook (`config/`), ecossistema (`root/`) e convenções (`instruction.md`).
   Versão em `lib/template/template.json` (`version`, hoje `0.3.0`). Bumpar ao
   mudar qualquer parte do template.
4. **Idempotência / boundaries de dados:** no `init`, framework usa
   `overwrite:false` (não sobrescreve customizações); no `update`, framework usa
   `overwrite:true`, mas dados do usuário (`root/`, `ecosystem.json`,
   `settings.json` via merge) são sempre preservados. O bloco de persistência é
   substituído-entre-marcadores. Reinstalar não deve duplicar nem destruir estado.
5. **Falhas não-críticas** (GSD, OMC, find-skills, git) **não** abortam o init —
   apenas avisam. Só falha de framework/skill aborta.
6. **`git commit --no-verify`** no bootstrap, para hooks do framework não
   abortarem o commit inicial.
