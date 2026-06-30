# 03 — Decisões de Design (ADRs) + Regras de Manutenção

Cada decisão registra o **contexto**, a **escolha** e o **porquê**. Datas
absolutas (sessão de criação: 2026-06-30).

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

## Regras de manutenção / boundaries

1. **Não modificar o framework** (`aiox-core`) a partir daqui — ele é instalado,
   não versionado neste repo. Respeitar as camadas L1–L4 (ver
   `lib/template/skills/iaox-god-mode/references/framework-map.md`).
2. **Branding sempre via `constants.js`.**
3. **Skill e referências** vivem em `lib/template/skills/iaox-god-mode/`. Versão
   da skill em `lib/template/template.json` (`version`). Bumpar ao mudar a skill.
4. **Idempotência:** instaladores usam `overwrite:false` para rules/instruções e
   substituição-entre-marcadores para o bloco de persistência. Reinstalar não
   deve duplicar nem destruir customizações do usuário.
5. **Falhas não-críticas** (GSD, OMC, find-skills, git) **não** abortam o init —
   apenas avisam. Só falha de framework/skill aborta.
6. **`git commit --no-verify`** no bootstrap, para hooks do framework não
   abortarem o commit inicial.
