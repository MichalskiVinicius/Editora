\# Mapa de Contexto



Mostra os contextos delimitados (Bounded Contexts), como eles se relacionam e onde a Camada Anti-Corrupção (ACL) protege o domínio.



```mermaid

flowchart LR

&#x20;   subgraph nucleo \["Domínio da Editora"]

&#x20;       catalogo\["Catálogo e Publicação<br/>(Core Domain)<br/>Obras, edições digitais e impressas,<br/>pedidos de impressão"]

&#x20;       royalties\["Royalties<br/>(Supporting)<br/>Cálculo de repasses aos autores"]

&#x20;       recomendacao\["Recomendação<br/>(Supporting)<br/>Sugestões personalizadas ao leitor"]

&#x20;   end



&#x20;   acl\_grafica\["ACL - Adaptador da Gráfica<br/>Traduz o pedido para XML/EDI"]

&#x20;   acl\_ia\["ACL - Adaptador da IA<br/>Remove dados pessoais e valida<br/>a resposta em JSON Schema"]



&#x20;   grafica\["Gráfica Legada<br/>(sistema externo)"]

&#x20;   ia\["Serviço de IA Generativa<br/>(sistema externo)"]

&#x20;   auth\["Autenticação / API Gateway<br/>(Generic)"]



&#x20;   catalogo -->|"Vendas realizadas<br/>(cliente-fornecedor)"| royalties

&#x20;   catalogo -->|"Dados das obras<br/>(linguagem publicada)"| recomendacao

&#x20;   catalogo --> acl\_grafica

&#x20;   acl\_grafica -->|"XML/EDI"| grafica

&#x20;   recomendacao --> acl\_ia

&#x20;   acl\_ia -->|"Contexto sem PII"| ia

&#x20;   auth -.->|"Conformista"| catalogo

```



\## Relações entre contextos



| Relação | Padrão DDD | Descrição |

|---|---|---|

| Catálogo e Publicação para Royalties | Cliente-Fornecedor | O Catálogo fornece as vendas; Royalties depende desses dados para calcular os repasses. |

| Catálogo e Publicação para Recomendação | Linguagem Publicada | O Catálogo expõe as obras em um formato estável que a Recomendação consome. |

| Catálogo e Publicação para Gráfica | Camada Anti-Corrupção | O adaptador traduz o modelo do domínio para XML/EDI, e o formato legado não entra no domínio. |

| Recomendação para Serviço de IA | Camada Anti-Corrupção | O adaptador remove dados pessoais antes do envio e valida a saída (ADR-006). |

| Autenticação para o domínio | Conformista | O domínio aceita o modelo do serviço de autenticação sem traduzi-lo. |



\## Regras de proteção do domínio

\- O domínio depende de abstrações (interfaces); os adaptadores da ACL implementam essas interfaces (DIP, ADR-002).

\- Nenhum contexto acessa as tabelas de outro diretamente.

\- Os padrões usados na ACL são Adapter (tradução XML/EDI) e Factory Method (criação de conectores).



\## Observações



