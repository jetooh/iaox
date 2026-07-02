# 07 — Como Testar

## Pré-requisitos

```bash
cd /Users/victordeziderio/meu-iaox-god-mode
npm install
```

## Suíte automatizada (`npm test`)

O projeto usa o runner nativo do Node (`node --test`). São **22 testes** em 3
arquivos (`unit` 8 · `smoke` 3 · `install` 11):

```bash
npm test
```

| Arquivo | O que cobre |
|---------|-------------|
| `test/unit.test.js` | Validators (nome/diretório), tool-paths (4 IDEs, `resolveToolKey`, `supportsMcp`), constants (versão do package.json, branding `iaox`) |
| `test/smoke.test.js` | Pipeline em `--dry-run`: gera a skill `iaox-god-mode` (claude-code e multi-IDE), falha com nome inválido |
| `test/install.test.js` | **Integração**: valida os **8 agentes da casa**, scaffolds determinísticos (com placeholders), `ecosystem.json`, monorepo (workspaces + turbo + config compartilhada), `access.md`/`.gitignore`, hook de screenshots, `instruction.md` referenciado no `CLAUDE.md`, as **10 regras** da casa, o **sistema de memória** (`.claude/memory/MEMORY.md` + `apps/`), os **docs isolados** (`docs/apps/`, `docs/features/`, `docs/stories/`), **secrets/access**, e o **modo update** (sobrescreve framework, preserva dados do usuário) |

## Smoke-tests manuais (rápidos, sem efeitos)

```bash
node bin/index.js --version          # imprime a versão do CLI (lida do package.json)
node bin/index.js --help             # lista comandos
node bin/index.js "Nome Invalido"    # deve falhar com "must be lowercase" e sair 1
```

## `--dry-run` (recomendado para iterar)

Simula o pipeline **sem** wizard, rede, npm ou git — roda só o código próprio do
CLI (skill, rules, agents, root/ecossistema, MCPs, conversão, persistência). ~1s.

```bash
cd /tmp && rm -rf dry && mkdir dry && cd dry
node /Users/victordeziderio/meu-iaox-god-mode/bin/index.js demo --dry-run
# multi-IDE:
node /Users/victordeziderio/meu-iaox-god-mode/bin/index.js demo --dry-run --ide claude-code,cursor,gemini
```

### Checklist de verificação do dry-run

```bash
D=/tmp/dry/demo
# skill por IDE
for ide in .claude .cursor .gemini; do
  echo -n "$ide skill: "; [ -f "$D/$ide/skills/iaox-god-mode/SKILL.md" ] && echo OK || echo FALTA
done
# ecossistema / monorepo
for f in ecosystem.json package.json turbo.json tsconfig.base.json eslint.config.js instruction.md access.example.md; do
  echo -n "$f: "; [ -f "$D/$f" ] && echo OK || echo FALTA
done
# agentes da casa + regras + hook + memória + docs
ls "$D/.claude/agents/" "$D/.claude/rules/" "$D/.claude/iaox-clean-screenshots.cjs"
ls "$D/.claude/memory/MEMORY.md" "$D/docs/apps/"
# tooling da Camada 3 na raiz
ls "$D/.husky/pre-commit" "$D/.changeset/config.json" "$D/knip.json" \
   "$D/.github/workflows/ecosystem-ci.yml"
# bloco de persistência
for f in CLAUDE.md AGENTS.md GEMINI.md; do
  echo -n "$f: "; grep -c "IAOX-GOD-MODE:START" "$D/$f" 2>/dev/null || echo 0
done
```

Esperado: skill nas IDEs com `skills`; ecossistema+config na raiz (incl.
`knip.json`, `.husky/`, `.changeset/`, `ecosystem-ci.yml`); **8 agentes**
(`scaffolder`, `security`, `e2e`, `i18n`, `platform`, `observability`, `finops`,
`a11y`) e as **10 regras** da casa em `.claude/`; o índice `.claude/memory/
MEMORY.md` e `docs/apps/`; o hook `.cjs`; bloco de persistência = 1 em cada
arquivo de instrução.

**Idempotência:** rodar o dry-run 2x na mesma pasta NÃO deve duplicar o bloco
(`grep -c` continua 1) e deve avisar que vai sobrescrever.

## E2E completo (precisa de terminal real)

O `aiox-core init` é um **wizard interativo** — exige TTY. Rode no seu terminal:

```bash
cd /Users/victordeziderio
node /Users/victordeziderio/meu-iaox-god-mode/bin/index.js teste-real
# responda o wizard: idioma, modo, tipo, IDE(s) [marque Claude Code], tech preset
cd teste-real
claude
# dentro do Claude Code:
/iaox-god-mode
# depois um pedido real, ex.:
#   *create-project loja      (menu de stack → app/loja com scaffold)
#   crie uma feature de login (vertical slice em docs/features/)
```

### Verificação E2E

```bash
node /Users/victordeziderio/meu-iaox-god-mode/bin/index.js doctor   # dentro do projeto
```

Confirmar:
- `.claude/skills/iaox-god-mode/SKILL.md` existe
- bloco `IAOX-GOD-MODE:START` no `CLAUDE.md` (que referencia `@instruction.md`)
- `ecosystem.json` + monorepo na raiz; agentes e regras da casa em `.claude/`
- `/iaox-god-mode` ativa o modo (status `🟢`)
- ao mandar um pedido, a skill **dispara o subagente** correto (Task) — não só descreve

## CI

`.github/workflows/ci.yml` roda em cada push/PR na `main`, matriz **Node 18/20/22**:
`npm ci` → `npm run lint` → `npm test` → dry-run smoke com todas as IDEs
(`node bin/index.js ci-smoke --dry-run --ide claude-code,codex,cursor,gemini`).

## Comandos auxiliares

```bash
node bin/index.js doctor        # 8 health checks
node bin/index.js update        # reinstala o framework (preserva dados do usuário)
node bin/index.js add-squad x   # adiciona um squad
```
