\# C4 Nível 3 - Diagrama de Componentes (Aplicação Node.js)



Mostra os módulos internos do contêiner da aplicação.



```mermaid

flowchart TB

&#x20;   gateway\["API Gateway - Kong"]

&#x20;   banco\[("Banco de Dados")]

&#x20;   fila\["RabbitMQ"]

&#x20;   ia\["Serviço de IA Generativa"]

&#x20;   grafica\["Gráfica Legada<br/>XML/EDI"]



&#x20;   subgraph app \["Aplicação - Node.js"]

&#x20;       api\["API / Roteamento<br/>server.js<br/>Recebe as requisições REST"]

&#x20;       catalogo\["Módulo Catálogo<br/>catalogo.js<br/>Obras, e-books e livros impressos"]

&#x20;       royalties\["Módulo Royalties<br/>royalties.js<br/>Cálculo de repasses aos autores"]

&#x20;       agente\["Agente de Recomendação<br/>agente-ia.js<br/>Monta o pedido à IA e valida a resposta"]

&#x20;       higieniza\["Higienização de PII<br/>Remove dados pessoais<br/>antes do envio à IA"]

&#x20;       adaptador\["Adaptador da Gráfica - ACL<br/>Traduz o pedido para XML/EDI"]

&#x20;   end



&#x20;   gateway -->|"REST"| api

&#x20;   api --> catalogo

&#x20;   api --> royalties

&#x20;   api --> agente

&#x20;   catalogo --> banco

&#x20;   royalties --> banco

&#x20;   catalogo -->|"Pedido de impressão"| fila

&#x20;   fila --> adaptador

&#x20;   adaptador -->|"XML/EDI"| grafica

&#x20;   agente --> higieniza

&#x20;   higieniza -->|"Contexto sem dados pessoais"| ia

```



\## Componentes



| Componente | Arquivo | Responsabilidade |

|---|---|---|

| API / Roteamento | server.js | Ponto de entrada HTTP e distribuição para os módulos |

| Módulo Catálogo | catalogo.js | Regras do catálogo de obras |

| Módulo Royalties | royalties.js | Regras de cálculo de royalties |

| Agente de Recomendação | agente-ia.js | Integração com a IA, saída estruturada e fallback (ADR-006) |

| Higienização de PII | `lgpd.fitness.test.js` (validação) e `server.js` (contrato restrito) | Garante a conformidade com a LGPD |

| Adaptador da Gráfica (ACL) | `server.js` (posicional EDI) e `adapters/grafica-adapter.cjs` (XML) | Protege o domínio do formato legado (ADR-002, ADR-004) |



\## Validação automatizada

O arquivo lgpd.fitness.test.js é a fitness function que verifica a regra de privacidade (ADR-006).



\## Observações


