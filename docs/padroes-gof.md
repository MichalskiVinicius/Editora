# Catálogo de Padrões GoF

| Padrão | Categoria | Localização no código | Problema de engenharia resolvido |
|---|---|---|---|
| Factory Method | Criacional | [adapters/fabrica-conectores.cjs](../adapters/fabrica-conectores.cjs) | Criar conectores de integração sem acoplar o domínio às classes concretas. Para um novo destino, basta criar uma nova subclasse. |
| Adapter | Estrutural | [adapters/grafica-adapter.cjs](../adapters/grafica-adapter.cjs) | Traduzir o pedido de impressão do domínio para o formato esperado pela gráfica legada, isolando o formato legado (ACL). |

## Como executar a demonstração

    node adapters/demo.cjs

## Relação com as decisões
- [ADR-002](../adrs/ADR-002.md): desacoplamento com DIP e padrões GoF.
- [ADR-004](../adrs/ADR-004.md): Camada Anti-Corrupção para os sistemas legados.
