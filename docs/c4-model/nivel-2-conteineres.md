\# C4 Nível 2 - Diagrama de Contêineres



Mostra as partes executáveis do sistema (cada uma roda em um contêiner Docker) e como elas se comunicam.



```mermaid

flowchart TB

&#x20;   usuario\["Leitor, Autor e Editor<br/>Navegador / aplicativo"]



&#x20;   subgraph plataforma \["Agile Dead Trees (Docker Compose)"]

&#x20;       gateway\["API Gateway - Kong<br/>Roteamento e controle de acesso<br/>Configurado em kong.yml"]

&#x20;       app\["Aplicação - Node.js<br/>Monólito modular:<br/>Catálogo, Royalties e Agente de IA<br/>Entrada: server.js"]

&#x20;       fila\["Mensageria - RabbitMQ<br/>Fila de pedidos de impressão<br/>com Dead Letter Queue"]

&#x20;       banco\[("Banco de Dados<br/>Catálogo, pedidos e royalties")]

&#x20;   end



&#x20;   grafica\["Gráfica Legada<br/>XML/EDI"]

&#x20;   ia\["Serviço de IA Generativa<br/>Externo"]



&#x20;   usuario -->|"HTTPS / REST (JSON)"| gateway

&#x20;   gateway -->|"REST (JSON)"| app

&#x20;   app -->|"Lê e grava"| banco

&#x20;   app -->|"Publica pedido de impressão"| fila

&#x20;   fila -->|"Entrega o pedido<br/>via adaptador XML/EDI"| grafica

&#x20;   app -->|"Chamada HTTPS<br/>com saída estruturada JSON"| ia

```



\## Contêineres



| Contêiner | Tecnologia | Responsabilidade |

|---|---|---|

| API Gateway | Kong (kong.yml) | Único ponto de entrada; roteia e protege as chamadas |

| Aplicação | Node.js (server.js) | Regras de negócio dos módulos de catálogo, royalties e recomendação |

| Mensageria | RabbitMQ | Absorve picos e isola a lentidão da gráfica (ADR-003) |

| Banco de dados | \[CONFIRMAR qual] | Persistência dos dados do negócio |



\## Observações

\- Estilo adotado: monólito modular (ADR-001). Os módulos poderão virar serviços no futuro.

\- \[CONFIRMAR] No docker-compose.yml: quais contêineres realmente existem (banco, RabbitMQ).

\- \[CONFIRMAR] Se não houver banco vetorial, não incluí-lo (ver ADR-005).

