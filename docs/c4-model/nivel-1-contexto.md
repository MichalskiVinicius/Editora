\# C4 Nível 1 - Diagrama de Contexto



Mostra o sistema \*\*Agile Dead Trees\*\* no centro, as pessoas que o usam e os sistemas externos com que ele conversa.



```mermaid

flowchart TB

&#x20;   leitor\["Leitor<br/>Compra e-books e livros impressos<br/>e recebe recomendações"]

&#x20;   autor\["Autor<br/>Acompanha vendas e royalties"]

&#x20;   editor\["Editor<br/>Gerencia o catálogo e a publicação"]



&#x20;   sistema\["Agile Dead Trees<br/>Plataforma de editora digital e e-commerce<br/>Publicação híbrida: digital e impressa"]



&#x20;   grafica\["Gráfica Legada<br/>Sistema externo que recebe pedidos<br/>de impressão via XML/EDI"]

&#x20;   ia\["Serviço de IA Generativa<br/>Sistema externo que gera<br/>recomendações personalizadas"]

&#x20;   pagamento\["Gateway de Pagamento<br/>Sistema externo que processa<br/>as compras"]



&#x20;   leitor -->|"Navega, compra e lê"| sistema

&#x20;   autor -->|"Consulta royalties"| sistema

&#x20;   editor -->|"Publica e atualiza obras"| sistema



&#x20;   sistema -->|"Envia pedidos de impressão<br/>XML/EDI"| grafica

&#x20;   sistema -->|"Envia contexto sem dados pessoais<br/>e recebe recomendações"| ia

&#x20;   sistema -->|"Solicita cobrança"| pagamento

```



\## Observações

\- A comunicação com a gráfica e com a IA passa por adaptadores que protegem o domínio (Camada Anti-Corrupção, ver ADR-004).

\- Dados pessoais são higienizados antes de qualquer envio ao serviço de IA (ADR-006).

\- \[CONFIRMAR] Se o gateway de pagamento já existe no projeto. Se não existir, remover do diagrama.

