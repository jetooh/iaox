# Documentação — @jetooh/iaox

Registro completo da concepção, arquitetura, decisões e desenvolvimento deste
CLI. Versionado junto com o código para preservar o contexto de criação.

## Índice

| Doc | Conteúdo |
|-----|----------|
| [01-MEMORY.md](01-MEMORY.md) | Memória do projeto — fatos e estado consolidados |
| [02-ARCHITECTURE.md](02-ARCHITECTURE.md) | Arquitetura do CLI + o que ele instala (skill, rules, agents, root, scaffolds) |
| [03-DESIGN-DECISIONS.md](03-DESIGN-DECISIONS.md) | Decisões de design (ADRs) + regras de manutenção |
| [04-GOD-MODE-SKILL.md](04-GOD-MODE-SKILL.md) | Como a skill God Mode funciona (engines, comandos, referências, agentes) |
| [05-DEVELOPMENT-LOG.md](05-DEVELOPMENT-LOG.md) | Log cronológico, E2E, aprendizados |
| [06-KNOWN-ISSUES.md](06-KNOWN-ISSUES.md) | Problemas diagnosticados e soluções |
| [07-TESTING.md](07-TESTING.md) | Como testar (suíte `node --test`, dry-run, E2E, doctor) |

## Resumo em uma frase

`@jetooh/iaox` é um CLI instalador que, em um comando, cria um **orquestrador**
(um monorepo/ecossistema multi-app) já configurado com a skill **God Mode**, as
regras da casa, os agentes, os scaffolds e o tooling — pronto para conversar em
linguagem natural e ver apps, features e código nascerem seguindo as convenções.

## Origem

Inspirado em [`create-aiox-god-mode`](https://www.npmjs.com/package/create-aiox-god-mode)
(de gutomec) e construído sobre o
[Synkra AIOS/AIOX](https://github.com/SynkraAI/aios-core) (de Pedro Valério). A
metodologia de vertical slices é inspirada no
[vertical-slices-md-dev-kit](https://github.com/rafaelmelo007/vertical-slices-md-dev-kit)
de Rafael Melo. Veja [01-MEMORY.md](01-MEMORY.md) e
[03-DESIGN-DECISIONS.md](03-DESIGN-DECISIONS.md).
