# 01 — Memória do Projeto

Espelho versionado da memória de trabalho do projeto. Fatos e estado
consolidados, com datas absolutas.

---

## Identidade

- **Pacote:** `create-meu-iaox-god-mode` (ESM, Node ≥ 18)
- **Diretório:** `/Users/victordeziderio/meu-iaox-god-mode`
- **Tipo:** CLI instalador estilo `create-*`, inspirado no `create-aiox-god-mode`
  de gutomec, mas com **skill God Mode própria**.
- **Destino:** git privado.

## Decisões fundamentais (2026-06-30)

1. **Foco na skill própria** — não copiar a skill do gutomec; escrever a nossa.
2. **4 IDEs suportadas** — Claude Code, Codex, Cursor, Gemini CLI.
3. **Branding centralizado** em `lib/constants.js`
   (`CLI_NAME`, `SKILL_NAME = iaox-god-mode`, `FRAMEWORK_PACKAGE = aiox-core`,
   `MCP_SERVERS`, `ECOSYSTEM`). Renomear o projeto inteiro = editar só esse arquivo.
4. **God Mode persistente** — ativar `/iaox-god-mode` uma vez mantém o modo ativo
   pela sessão toda até `*exit`.
5. **Invocação autônoma** — a skill dispara o agente dono via Task tool com
   `subagent_type` (aiox-dev, aiox-qa, etc.).

## Arquitetura (resumo)

`bin/index.js` → `lib/cli.js` (commander: `init | update | doctor | add-squad`)
→ `lib/commands/` + `lib/core/` (framework-bootstrap, god-mode-installer,
ecosystem-installer, post-setup) + `lib/utils/` (tool-paths, validators,
platform, skill-converter) + `lib/ui/` + `lib/template/skills/iaox-god-mode/`
(SKILL.md + 4 referências).

Pipeline `init` = **8 etapas**; só a etapa 3 (copiar a skill) é código próprio —
as demais delegam para `aiox-core`, GSD e oh-my-claudecode. Ver
[02-ARCHITECTURE.md](02-ARCHITECTURE.md).

## Mecanismo de persistência (o que faz "ficar ativo")

Três camadas que se reforçam, todas recarregadas a cada turno (sobrevivem à
compactação de contexto):

1. **`SKILL.md` → seção 0** "PERSISTENT SESSION MODE".
2. **Rule** `.claude/rules/god-mode-overview.md` (sempre carregada).
3. **Bloco injetado** no arquivo de instruções (`CLAUDE.md` / `AGENTS.md` /
   `GEMINI.md`) entre os marcadores `<!-- IAOX-GOD-MODE:START/END -->`
   (idempotente — não duplica em reinstalações).

## Mapa de invocação (pedido → agente → subagente)

| Domínio | Agente | `subagent_type` |
|---------|--------|-----------------|
| Implementação | @dev (Dex) | `aiox-dev` |
| Testes/QA | @qa (Quinn) | `aiox-qa` |
| Arquitetura | @architect (Aria) | `aiox-architect` |
| PRD/epics | @pm (Morgan) | `aiox-pm` |
| Validação story | @po (Pax) | `aiox-po` |
| Criar stories | @sm (River) | `aiox-sm` |
| Pesquisa | @analyst (Alex) | `aiox-analyst` |
| Banco de dados | @data-engineer (Dara) | `aiox-data-engineer` |
| UX/UI | @ux-design-expert (Uma) | `aiox-ux` |
| Push/PR/CI/MCP | @devops (Gage) | `aiox-devops` |
| Governança | @aiox-master (Orion) | _(skill, não subagente)_ |

## Estado atual

- **E2E VALIDADO (2026-06-30):** `init` rodado em terminal real; wizard do
  aiox-core respondido (PT, Claude Code, nextjs-react); pipeline OK;
  `/iaox-god-mode` ativou e operou como Operador persistente conforme projetado.
  Confirmado no projeto gerado: `SKILL.md` v0.2.0, 4 referências, bloco de
  persistência no `CLAUDE.md`, 3 MCPs, rule god-mode-overview.
- **`--dry-run` adicionado e validado (2026-06-30):** simula o pipeline sem
  wizard/rede/npm/git; testado multi-IDE (claude-code, cursor, gemini);
  idempotente. Ver [07-TESTING.md](07-TESTING.md).
- **PENDENTE:** testar roteamento real (mandar um pedido e confirmar que a skill
  realmente **dispara** o subagente `aiox-*`, não só descreve).

## Fatos importantes do ambiente

- `aiox-core` no npm: **v5.2.9**. O `init` é um **wizard interativo** (inquirer:
  idioma → modo → tipo de projeto → IDEs → tech preset) e **não tem flag
  `--yes`**. Não roda com stdin vazio (`ERR_USE_AFTER_CLOSE`). Requer TTY real.
- A skill só é instalada nas **IDEs marcadas no wizard** (comportamento correto).
- Rodar sempre a partir do **diretório pai** para o projeto não aninhar.
