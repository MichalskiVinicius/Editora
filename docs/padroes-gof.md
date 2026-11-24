# Catálogo de Padrões GoF

| Padrão | Categoria | Localização no código | Problema de engenharia resolvido |
|---|---|---|---|
| Factory Method | Criacional | [adapters/fabrica-conectores.cjs](../adapters/fabrica-conectores.cjs) | Criar conectores de integração sem acoplar o domínio às classes concretas. Para um novo destino, basta uma nova subclasse. |
| Adapter | Estrutural | [adapters/grafica-adapter.cjs](../adapters/grafica-adapter.cjs) | Traduzir o pedido de impressão do domínio para o XML da gráfica legada, isolando o formato legado (ACL). |

## Como executar a demonstração

    node adapters/demo.cjs

A saída mostra o pedido traduzido para XML e o status do envio.

## Relação com as decisões
- ADR-002: desacoplamento com DIP e padrões GoF.
- ADR-004: Camada Anti-Corrupção para os sistemas legados.

## Observações
- [CONFIRMAR] Se o projeto já usa outros padrões (por exemplo, Strategy em royalties.js) e, se usar, acrescentar uma linha na tabela com o arquivo e a justificativa.