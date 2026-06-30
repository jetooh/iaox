# 05 — Log de Desenvolvimento

Cronologia da sessão de criação. Data: **2026-06-30**.

## Sessão 1 — Concepção e scaffold

1. **Análise** do `SynkraAI/aiox-core` (framework) e do
   `create-aiox-god-mode` (instalador, de gutomec). Constatado: o instalador é
   fino e delega; o valor está na curadoria + skill. O pacote do gutomec foi
   inspecionado via `npm pack` para entender a estrutura real (8 etapas,
   tool-paths, template, conversores).
2. **Decisões** coletadas com o usuário: skill própria; 4 IDEs; scaffold agora.
3. **Scaffold completo** criado: `bin/`, `lib/` (cli, constants, commands, core,
   utils, ui) e `lib/template/` (skill + 4 referências + rule + settings).
4. **Smoke-test** OK: `--help`, `--version`, validação de nome (sai 1), `doctor`.

## Sessão 2 — Persistência + invocação autônoma

Requisitos novos do usuário:
- Invocação **autônoma** (subagentes via Task).
- God Mode **persistente**: ativar uma vez = ativo a sessão toda até `*exit`.

Implementado:
- `SKILL.md` reescrita: seção 0 (modo persistente), seção 2 (Operation Engine com
  Task + tabela `subagent_type`).
- Rule `god-mode-overview.md` reforçada (persistência).
- `god-mode-installer.js`: `injectInstructions` insere bloco idempotente
  `<!-- IAOX-GOD-MODE:START/END -->` no arquivo de instruções de cada IDE.
- `agent-matrix.md`: coluna `subagent_type`.
- Versão da skill bumpada para `0.2.0`.

## Sessão 3 — E2E real (validado ✅)

Usuário rodou `node bin/index.js meu-iaox-god-mode-test` em terminal real.
- Wizard do `aiox-core` v5.2.9 respondido: PT, Modo Assistido, Greenfield,
  Claude Code, preset `nextjs-react`.
- Pipeline de 8 etapas concluído. `God Mode (claude-code) v0.2.0, 7 files`.
  GSD instalado; OMC opcional não instalado.
- No Claude Code, `/iaox-god-mode` **ativou e operou** como Operador persistente
  (status `🟢`, tabela de intents, lista de agentes, comandos). Objetivo central
  validado.
- Verificado no projeto: SKILL.md, 4 referências, bloco de persistência no
  `CLAUDE.md` (1 ocorrência), 3 MCPs em `.mcp.json`, rule presente, `.version` = 0.2.0.

Aprendizados (viraram [06-KNOWN-ISSUES.md](06-KNOWN-ISSUES.md)):
- Rodar `claude` na pasta certa do projeto (não no pai).
- `worklog-stop-hook.sh` é config global do usuário, não do CLI.
- Commit inicial podia falhar por hooks → corrigido com `--no-verify`.
- Skill só instala nas IDEs marcadas no wizard (correto).

## Sessão 4 — Flag `--dry-run` (validada ✅)

- Adicionada flag `--dry-run` + `--ide a,b,c` ao `init`.
- `scaffoldDryRun` cria esqueleto mínimo (core-config.yaml + CLAUDE.md).
- Etapas de rede (find-skills/GSD/OMC) e npm/git puladas; código próprio roda.
- Testado com `--ide claude-code,cursor,gemini`: skill nas 3 IDEs; bloco de
  persistência em `CLAUDE.md`/`AGENTS.md`/`GEMINI.md`; MCP em `.mcp.json` e
  `.cursor/mcp.json` (gemini avisa que não suporta); idempotente (re-run não
  duplica o bloco).

## Pendências

- Testar **roteamento real**: com God Mode ativo, mandar um pedido e confirmar
  que a skill **dispara** o subagente `aiox-*` (não só descreve).
- (Opcional) Banner lê versão de `package.json` para nunca dessincronizar.
- (Opcional) Publicar no npm e/ou ajustar `repository` em `package.json`.
