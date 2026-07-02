# IAOX — Observabilidade (produção e IA)

Regra auto-carregada. Define como as apps do ecossistema são **observáveis e
confiáveis em produção** — e, quando usam IA, avaliadas continuamente. Executada
pelo `@observability`.

## Princípio

Toda app que vai a produção precisa responder a **três perguntas** a qualquer
momento: está no ar? está rápida? está correta? Sem observabilidade, a resposta é
"não sei" — e isso não passa no ship gate.

## Four Golden Signals (SRE)

Toda app instrumenta e define SLO para:

| Sinal | Exemplo de SLO |
|-------|----------------|
| **Latência** | p95 < 300 ms |
| **Tráfego** | requests/s esperado |
| **Erros** | < 1% de 5xx em 30 dias |
| **Saturação** | CPU/mem < 80% |

Os SLOs de cada app ficam registrados (em `docs/observability/` ou na feature).

## Telemetria

- **OpenTelemetry** (vendor-neutral) para logs, traces e métricas.
- Logs **estruturados** (JSON) com trace ID propagado entre serviços.
- **Nunca** logar segredos ou PII — mascarar (ver `secrets.md`).

## LLM observability (apps com IA)

Features de IA são monitoradas como qualquer outro sistema, mais:
- **Golden dataset:** conjunto de referência para avaliar saídas a cada mudança.
- **Hallucination / qualidade:** eval automatizado; queda = alerta.
- **Custo de token:** rastreado por request e por feature (alavanca de custo).
- **Drift:** comparar qualidade ao longo do tempo contra o golden dataset.

## Incidentes

- Alertas **acionáveis** (ligados a SLO), não ruído.
- **Runbooks** para cenários prováveis.
- **Post-mortems sem culpa** em `docs/incidents/` — todo incidente vira aprendizado
  e, se aplicável, uma nova invariante (`RULES.md`) ou teste.

## Ship gate

Uma feature só é `Done` se o que ela entrega for **observável**: sinais
instrumentados e SLOs definidos. O `@qa` inclui isso no SCORE; o `@observability`
verifica.

## Gatilhos

Aplica quando o pedido envolve monitoramento, produção, confiabilidade, SLO,
latência, custo em runtime, ou qualidade de features de IA — roteie ao
`@observability`.
