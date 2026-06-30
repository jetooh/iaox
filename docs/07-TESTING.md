# 07 — Como Testar

## Pré-requisitos

```bash
cd /Users/victordeziderio/meu-iaox-god-mode
npm install
```

## Smoke-tests (rápidos, sem efeitos)

```bash
node bin/index.js --version          # imprime a versão do CLI
node bin/index.js --help             # lista comandos
node bin/index.js "Nome Invalido"    # deve falhar com "must be lowercase" e sair 1
```

## `--dry-run` (recomendado para iterar)

Simula o pipeline **sem** wizard, rede, npm ou git — roda só o código próprio do
CLI (skill, MCPs, conversão, persistência). ~1s.

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
# bloco de persistência
for f in CLAUDE.md AGENTS.md GEMINI.md; do
  echo -n "$f: "; grep -c "IAOX-GOD-MODE:START" "$D/$f" 2>/dev/null || echo 0
done
# MCP
ls "$D/.mcp.json" "$D/.cursor/mcp.json"
```

Esperado: skill nas IDEs com `skills`; bloco = 1 em cada arquivo de instrução;
`.mcp.json` (claude) e `.cursor/mcp.json` presentes; gemini sem MCP (warning).

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
# depois um pedido real, ex:
#   crie uma story para uma feature de login
```

### Verificação E2E

```bash
node /Users/victordeziderio/meu-iaox-god-mode/bin/index.js doctor   # dentro do projeto
```

Confirmar:
- `.claude/skills/iaox-god-mode/SKILL.md` existe
- bloco `IAOX-GOD-MODE:START` no `CLAUDE.md`
- `/iaox-god-mode` ativa o modo (status `🟢`)
- ao mandar um pedido, a skill **dispara o subagente** correto (Task) — não só descreve

## Comandos auxiliares

```bash
node bin/index.js doctor        # 8 health checks
node bin/index.js update        # atualiza a skill se houver versão mais nova
node bin/index.js add-squad x   # adiciona um squad
```
