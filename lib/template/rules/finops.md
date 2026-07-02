# IAOX — FinOps (custo de cloud e IA)

Regra auto-carregada. Define como o ecossistema mantém o custo sob controle —
cloud/infra e, principalmente, **IA (tokens)**. Executada pelo `@finops`.

## Princípio

**Custo é uma feature, não uma surpresa.** Todo gasto é medido, atribuído a uma
feature e otimizado. Uma feature de IA sem estimativa de custo não está pronta.

## Custo de IA — as alavancas (nesta ordem)

1. **Model routing** — escolha o **menor modelo** que resolve; só escale quando
   a qualidade exigir. Documente por que um modelo maior é necessário.
2. **Caching** — prompt caching e cache de resposta para entradas repetidas.
3. **Prompt compression** — contexto enxuto; menos tokens de entrada.
4. **Batch** — chamadas não-urgentes vão em lote (mais barato).
5. **Limites** — teto de tokens por request e por feature.

## Custo de cloud

- **Right-sizing**: nada superdimensionado ou ocioso.
- Caçar desperdício: ambientes esquecidos, logs verbosos, egress desnecessário.

## Atribuição e budget

- **Custo por feature/request/user** — atribuído via a telemetria do
  `@observability` (custo de token por request/feature).
- **Budget por app/ambiente** com **alerta acionável** ao se aproximar do teto.

## Ship gate

Uma feature de IA só é `Done` com uma **estimativa de custo** (tokens/request ×
volume esperado) e as alavancas aplicáveis (caching/routing/limites) em vigor. O
`@qa` considera isso no SCORE; o `@finops` valida.

## Regra de ouro

Nunca corte custo degradando qualidade **em silêncio**. Toda otimização que
troca custo por qualidade explicita o trade-off para decisão humana.

## Gatilhos

Aplica quando o pedido envolve custo, orçamento, gasto de cloud/tokens, escolha
de modelo de IA, caching ou escala — roteie ao `@finops` (com o `@observability`
para os dados de custo).
