<h1 align="center">⚡ IAOX <sub>JETOOH</sub></h1>

<p align="center">
  <strong>Framework de orquestração de agentes de IA com a skill God Mode — um comando instala tudo.</strong><br>
  <sub>IAOX + God Mode + GSD + oh-my-claudecode + 3 MCPs, prontos em qualquer projeto.</sub>
</p>

<p align="center">
  <code>npx github:jetooh/iaox meu-projeto</code>
</p>

---

## 🎯 O que este CLI faz

É um **instalador/orquestrador**. Em um comando ele:

1. Inicializa o framework via `npx aiox-core init`
2. Instala a **sua skill God Mode** (`iaox-god-mode`) em cada IDE selecionada
3. Configura 3 servidores MCP (context7, 21st-dev, nano-banana-pro)
4. Instala GSD e oh-my-claudecode
5. Converte skills/rules/instruções para o formato de cada IDE
6. Finaliza com `npm install`, `.env.example` e `git init`

A skill God Mode (em `lib/template/skills/iaox-god-mode/`) é **a parte que é sua** —
edite o `SKILL.md` e as referências para moldar o comportamento do seu operador.

## 🚀 Instalação

### A partir do GitHub (recomendado)

Rode direto do repositório, sem clonar nada:

```bash
npx github:jetooh/iaox meu-projeto
cd meu-projeto
claude        # depois digite: /iaox-god-mode
```

O `npx` baixa o repo, instala as dependências e cria a pasta `meu-projeto` já
com o framework IAOX + a skill God Mode + MCPs + GSD + oh-my-claudecode.

**Opções úteis:**

```bash
npx github:jetooh/iaox meu-projeto --dry-run                 # simula, sem rede/npm/git
npx github:jetooh/iaox meu-projeto --ide claude-code,cursor  # escolhe as IDEs
```

> ℹ️ A instalação é feita **direto do GitHub** (`npx github:jetooh/iaox`).
> O pacote não é publicado no npm.

### Clonando manualmente

```bash
git clone https://github.com/jetooh/iaox.git
cd iaox
npm install
node bin/index.js meu-projeto
```

## 🛠️ Comandos

| Comando | Função |
|---------|--------|
| `init <nome>` (padrão) | Cria projeto com IAOX + God Mode + ecossistema |
| `update`               | Atualiza a skill God Mode se houver versão mais nova |
| `doctor`               | 8 verificações de saúde no projeto |
| `add-squad <nome>`     | Adiciona um squad (via `squads` CLI ou scaffold local) |

## 🧩 IDEs suportadas

| IDE | Skills | Rules | MCP | Instruções |
|-----|:------:|:-----:|:---:|:----------:|
| Claude Code | `.claude/skills/` | `.claude/rules/` | `.mcp.json` | `CLAUDE.md` |
| Codex | `.codex/skills/` | — | `.codex/config.toml` | `AGENTS.md` |
| Cursor | `.cursor/skills/` | `.cursor/rules/` | `.cursor/mcp.json` | `AGENTS.md` |
| Gemini CLI | `.gemini/skills/` | `.gemini/rules/` | — | `GEMINI.md` |

## 🎨 Como personalizar (renomear / re-brandar)

Tudo o que define o branding está em **`lib/constants.js`**:

- `CLI_NAME`, `DISPLAY_NAME` — nome e título
- `SKILL_NAME` — slug da skill (`iaox-god-mode`)
- `FRAMEWORK_PACKAGE` — pacote do framework instalado
- `MCP_SERVERS`, `ECOSYSTEM` — quais MCPs/pacotes instalar

Para mudar o comportamento do operador, edite
`lib/template/skills/iaox-god-mode/SKILL.md` e os arquivos em `references/`.

## 🏗️ Arquitetura

```
bin/index.js              # entrypoint — checa Node, chama cli
lib/cli.js                # commander: init | update | doctor | add-squad
lib/constants.js          # ⚙️ branding centralizado
lib/commands/             # implementação de cada comando
lib/core/                 # bootstrap, god-mode, ecosystem, post-setup
lib/utils/                # tool-paths, validators, platform, skill-converter
lib/ui/                   # logo + messages
lib/template/             # 🧠 a skill God Mode (SKILL.md + referências)
```

## 🧪 Testar rápido (sem wizard)

```bash
node bin/index.js demo --dry-run --ide claude-code,cursor,gemini
```
Simula o pipeline sem wizard/rede/npm/git. Veja [docs/07-TESTING.md](docs/07-TESTING.md).

## 📚 Documentação

O contexto completo de criação está em [`docs/`](docs/README.md): memória,
arquitetura, decisões de design (ADRs), funcionamento da skill, log de
desenvolvimento, problemas conhecidos e guia de testes.

## 📋 Requisitos

Node.js ≥ 18 · Git · Claude Code (para usar a skill) · acesso à internet.

## 🙏 Créditos

Construído sobre o [Synkra AIOS/AIOX](https://github.com/SynkraAI/aios-core) de
Pedro Valério, o [Claude Code](https://docs.anthropic.com/en/docs/claude-code) da
Anthropic, e inspirado no instalador `create-aiox-god-mode` de gutomec.

## 📄 Licença

MIT
