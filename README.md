<h1 align="center">⚡ IAOX <sub>JETOOH</sub></h1>

<p align="center">
  <strong>Um comando cria um ecossistema multi-app orquestrado por agentes de IA.</strong><br>
  <sub>Framework IAOX + skill God Mode + vertical slices + monorepo + agentes + tooling — prontos.</sub>
</p>

<p align="center">
  <code>npx github:jetooh/iaox meu-orquestrador</code>
</p>

---

## 🎯 O que é

É um **instalador de orquestradores**. Em um comando ele cria um projeto (o
*orquestrador*) já configurado como um **ecossistema/monorepo** onde a skill
**God Mode** roteia cada pedido para o agente certo e cria suas aplicações
seguindo as convenções da casa.

Em um comando, o CLI:

1. Inicializa o framework via `npx aiox-core init`
2. Instala a skill **God Mode** (`iaox-god-mode`) em cada IDE selecionada
3. Instala as **regras da casa**, os **agentes**, os **scaffolds** e o **tooling**
4. Configura o **monorepo** (workspaces + Turborepo + config compartilhada)
5. Configura 3 servidores MCP, GSD e oh-my-claudecode
6. Finaliza com `.env.example`, `.gitignore`, `git init`

Depois, dentro do projeto, você conversa com a God Mode em linguagem natural
(ou por comandos `*`) e ela cria apps, features e código seguindo tudo abaixo.

## 🚀 Instalação

### A partir do GitHub (recomendado)

```bash
npx github:jetooh/iaox meu-orquestrador
cd meu-orquestrador
claude        # depois digite: /iaox-god-mode
```

**Opções úteis:**

```bash
npx github:jetooh/iaox meu-orquestrador --dry-run                 # simula, sem rede/npm/git
npx github:jetooh/iaox meu-orquestrador --ide claude-code,cursor  # escolhe as IDEs
```

> ℹ️ A instalação é feita **direto do GitHub**. O pacote não é publicado no npm.

### Clonando manualmente

```bash
git clone https://github.com/jetooh/iaox.git
cd iaox && npm install
node bin/index.js meu-orquestrador
```

## 🧠 O que cada projeto ganha

### Ecossistema multi-app (monorepo)

Cada orquestrador é um **monorepo** que hospeda várias apps:

- **`ecosystem.json`** — catálogo central de apps e packages (`*list-apps`).
- **Workspaces + Turborepo** — `npm run dev|build|test|lint` roda em todas as
  apps/packages com cache e paralelismo.
- **`packages/`** — código compartilhado (`@ecosystem/*`); a regra é **não
  duplicar entre apps**.
- **Portas únicas** por app (5173+), sem colisão.
- **Config compartilhada** na raiz: `tsconfig.base.json`, ESLint (flat) e Prettier.
- **Contratos** entre apps em `packages/contracts`; grafo de dependências via `*deps`.

### Desenvolvimento em vertical slices

Toda funcionalidade nasce como uma fatia rastreável: **intenção → SPEC → TASKS →
código → SCORE**. Cada feature vira `docs/features/<slug>/` (SPEC com critérios de
aceite, TASKS, RULES, SCORE, DECISIONS). Todo commit fecha com `Closes-AC: AC-NN`;
`Done` só com o *ship gate* verde.

### Convenção de idioma

**Código em inglês, aplicação em português** — identificadores/commits em EN;
UI/mensagens/i18n em pt-BR.

### Isolamento por aplicação

Cada app tem regras e memórias próprias, separadas:
`.claude/rules/apps/<app>/` e `.claude/memory/apps/<app>/`.

### Tooling por padrão

- **knip** (código morto) em apps JS/TS · **Playwright** (E2E + screenshots) em apps web.
- Screenshots vão para `screenshot/` na raiz, **limpos a cada 12h** por um hook.

## 🗂️ Estrutura de um orquestrador

```
meu-orquestrador/  (monorepo — git)
├── instruction.md              # convenções da casa (carregado via @instruction.md)
├── ecosystem.json              # catálogo de apps e packages
├── package.json + turbo.json   # workspaces + Turborepo
├── tsconfig.base.json · eslint.config.js · .prettierrc.json   # config compartilhada
├── .claude/
│   ├── rules/{globais}.md + apps/<app>/
│   ├── memory/apps/<app>/
│   ├── agents/                 # @scaffolder, @security, @e2e, @i18n
│   └── skills/iaox-god-mode/
├── docs/features/<slug>/       # specs (vertical slices)
├── app/<app>/                  # o código de cada aplicação
├── packages/<nome>/            # código compartilhado (@ecosystem/<nome>)
└── screenshot/                 # prints do Playwright (limpos a cada 12h)
```

## 🤖 Comandos da God Mode (dentro do projeto)

| Comando | Ação |
|---------|------|
| `*create-project <nome>` | Menu de stack → cria `app/<nome>` + pastas isoladas + registro |
| `*delete-project <nome>` | Remove a app e suas pastas do disco e do `ecosystem.json` |
| `*create-feature <slug>` | Cria uma vertical slice em `docs/features/<slug>/` |
| `*list-apps` | Mostra as apps do ecossistema (nome, stack, porta, status) |
| `*deps` | Grafo de dependências do ecossistema (app → package) + ciclos |
| `*route <task>` | Classifica e despacha para o agente certo |
| `*create-agent` · `*create-rule` … | Cria componentes do framework |
| `*exit` | Desativa o God Mode na sessão |

## 🧱 Stacks e scaffolds

O `*create-project` apresenta um menu; as stacks **padrão da casa** têm scaffold
determinístico e versionado (já testado — testes, lint e build passam de fábrica):

| Stack | Inclui |
|-------|--------|
| **Vite + React + Vitest** | React + TS, Vitest, Playwright, knip, porta única |
| **Flutter** | Material 3, widget test, `flutter analyze` |

Outras opções (Next.js, Angular, NestJS, Go, Java, .NET, PHP, Rust, React
Native…) geram um scaffold mínimo idiomático seguindo as mesmas convenções.

## 🧑‍💻 Agentes

**11 agentes core** (do `aiox-core`): `@dev`, `@qa`, `@architect`, `@pm`, `@po`,
`@sm`, `@analyst`, `@data-engineer`, `@ux-design-expert`, `@devops`, `@aiox-master`.

**4 agentes da casa** (em `.claude/agents/`):

| Agente | Papel |
|--------|-------|
| `@scaffolder` | gera o scaffold determinístico da stack |
| `@security` | gate de segurança (OWASP, segredos, deps) |
| `@e2e` | testes E2E + screenshots (Playwright) |
| `@i18n` | convenção de idioma (code EN / app PT) |

## 🛠️ Comandos do CLI

| Comando | Função |
|---------|--------|
| `init <nome>` (padrão) | Cria o orquestrador com todo o ecossistema |
| `update` | Atualiza a skill God Mode se houver versão mais nova |
| `doctor` | Verificações de saúde no projeto |
| `add-squad <nome>` | Adiciona um squad |

## 🧩 IDEs suportadas

| IDE | Skills | Rules | MCP | Instruções |
|-----|:------:|:-----:|:---:|:----------:|
| Claude Code | `.claude/skills/` | `.claude/rules/` | `.mcp.json` | `CLAUDE.md` |
| Codex | `.codex/skills/` | — | `.codex/config.toml` | `AGENTS.md` |
| Cursor | `.cursor/skills/` | `.cursor/rules/` | `.cursor/mcp.json` | `AGENTS.md` |
| Gemini CLI | `.gemini/skills/` | `.gemini/rules/` | — | `GEMINI.md` |

## 🎨 Personalizar (renomear / re-brandar)

O branding fica em **`lib/constants.js`** (`CLI_NAME`, `DISPLAY_NAME`,
`SKILL_NAME`, `FRAMEWORK_PACKAGE`, `MCP_SERVERS`). O comportamento do operador
vive em `lib/template/` — regras (`rules/`), skill (`skills/iaox-god-mode/`),
agentes (`agents/`), scaffolds e o `instruction.md`.

## 🏗️ Arquitetura do CLI

```
bin/index.js       # entrypoint — checa Node, chama a CLI
lib/cli.js         # commander: init | update | doctor | add-squad
lib/constants.js   # ⚙️ branding centralizado (versão lida do package.json)
lib/commands/      # implementação de cada comando
lib/core/          # bootstrap, god-mode-installer, ecosystem, post-setup
lib/utils/         # tool-paths, validators, platform, skill-converter
lib/template/      # 🧠 o que é instalado: skill, rules, agents, scaffolds, root/
test/              # smoke tests (--dry-run) + unit tests
```

## 🧪 Testar

```bash
npm test                                                # suíte do CLI
node bin/index.js demo --dry-run --ide claude-code      # simula a instalação
```

CI (GitHub Actions) roda lint, testes e um dry-run em Node 18/20/22 a cada push.

## 📋 Requisitos

Node.js ≥ 18 · Git · Claude Code (para usar a skill) · acesso à internet.

## 🙏 Créditos

Construído sobre o [Synkra AIOS/AIOX](https://github.com/SynkraAI/aios-core) de
Pedro Valério e o [Claude Code](https://docs.anthropic.com/en/docs/claude-code) da
Anthropic. Metodologia de vertical slices inspirada no
[vertical-slices-md-dev-kit](https://github.com/rafaelmelo007/vertical-slices-md-dev-kit)
de Rafael Melo.

## 📄 Licença

MIT
