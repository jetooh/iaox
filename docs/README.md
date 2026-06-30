# Documentação — create-meu-iaox-god-mode

Registro completo da concepção, arquitetura, decisões e desenvolvimento deste
framework. Versionado junto com o código para preservar o contexto de criação.

## Índice

| Doc | Conteúdo |
|-----|----------|
| [01-MEMORY.md](01-MEMORY.md) | Memória do projeto — fatos e estado consolidados |
| [02-ARCHITECTURE.md](02-ARCHITECTURE.md) | Arquitetura do CLI, pipeline de 8 etapas, mecanismos |
| [03-DESIGN-DECISIONS.md](03-DESIGN-DECISIONS.md) | Decisões de design (ADRs) + regras de manutenção |
| [04-GOD-MODE-SKILL.md](04-GOD-MODE-SKILL.md) | Como a skill God Mode funciona (persistência + roteamento) |
| [05-DEVELOPMENT-LOG.md](05-DEVELOPMENT-LOG.md) | Log cronológico, E2E, aprendizados |
| [06-KNOWN-ISSUES.md](06-KNOWN-ISSUES.md) | Problemas diagnosticados e soluções |
| [07-TESTING.md](07-TESTING.md) | Como testar (dry-run, E2E, doctor) |

## Resumo em uma frase

Um CLI instalador estilo `create-*` que, em um comando, monta um projeto IAOX
(via `aiox-core`) e adiciona uma **skill God Mode própria** que, ao ser ativada
uma vez, vira um operador persistente que roteia cada pedido para o agente
correto e o dispara autonomamente via subagentes.

## Origem

Inspirado em [`create-aiox-god-mode`](https://www.npmjs.com/package/create-aiox-god-mode)
(de gutomec) e construído sobre o
[Synkra AIOS/AIOX](https://github.com/SynkraAI/aios-core) (de Pedro Valério).
Veja [01-MEMORY.md](01-MEMORY.md) e [03-DESIGN-DECISIONS.md](03-DESIGN-DECISIONS.md).
