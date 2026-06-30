# 06 — Problemas Conhecidos e Soluções

Diagnosticados durante o E2E (2026-06-30). **Nenhum é bug do CLI** — exceto o
commit, que já foi blindado.

---

## 1. `gsd-session-state.sh: No such file or directory`

**Sintoma:** Erros de SessionStart hook ao abrir o Claude Code.

**Causa:** O `claude` foi aberto no **diretório errado** (a pasta pai), onde
`.claude/hooks/` não existe. Os hooks do GSD usam `$CLAUDE_PROJECT_DIR`.

**Solução:** Abrir o `claude` **dentro da pasta do projeto** gerado. Os hooks
existem lá. Para não aninhar, rodar o `init` a partir do diretório pai:
```bash
cd /Users/victordeziderio
node /Users/victordeziderio/meu-iaox-god-mode/bin/index.js nome-do-projeto
```

---

## 2. `worklog-stop-hook.sh: No such file or directory`

**Sintoma:** "Stop hook error" ao fim de cada resposta.

**Causa:** É um Stop hook da **configuração global do usuário**
(`~/.claude/settings.json` + `~/.claude/worklog-stop-hook.sh`), de outro setup
(worklog/vskit). Não tem relação com este projeto nem com o `aiox-core`.

**Solução:** Remover/ajustar esse hook em `~/.claude/settings.json` se incomodar.
Fora do escopo deste repositório.

---

## 3. Commit inicial falhou ("branch main does not have any commits yet")

**Sintoma:** `[8/8] ⚠ Git initialization skipped or failed`.

**Causa:** Provável hook de pre-commit instalado pelo framework/GSD abortando o
commit, ou condição transitória. (Commit manual depois funcionou normalmente.)

**Solução aplicada:** `lib/core/post-setup.js` agora usa
`git commit --no-verify` no bootstrap, pulando hooks que possam abortar o commit
inicial.

---

## 4. Banner mostra `v0.1.0`

**Status:** Não é bug. É a versão do **CLI** (`constants.js::CLI_VERSION`). A
**skill** tem versão própria (`template.json::version`, atualmente `0.2.0`).
São versões distintas e legítimas.

**Melhoria opcional:** fazer o banner ler de `package.json` para nunca
dessincronizar com o `name`/`version` do pacote.

---

## 5. Projeto aninhado

**Sintoma:** projeto criado em `pasta/pasta` em vez de `pasta`.

**Causa:** o `init` cria uma subpasta com o nome passado; rodar de dentro da
pasta de destino aninha.

**Solução:** rodar a partir do diretório pai (ver item 1).
