# Fitness Functions (Governança Automatizada)

Fitness functions são testes automatizados que verificam se a arquitetura continua respeitando as regras definidas. Elas rodam junto com os testes do projeto e falham quando uma regra é violada.

## Fitness function do projeto: Segurança e LGPD

- **Arquivo:** [lgpd.fitness.test.js](../lgpd.fitness.test.js)
- **Ferramentas:** Jest e axios (teste de integração contra a API exposta pelo API Gateway)
- **Regra validada:** o endpoint de status de impressão (`GET /api/v1/print-orders/{orderId}/status`) não pode expor dados pessoais (PII). A resposta não pode conter e-mail nem CPF, e só pode ter as chaves `orderId` e `status`.
- **Decisão relacionada:** ADR-006 (guardrails e proteção de dados pessoais)

## Como o teste funciona

1. Cria uma ordem de impressão de teste em `POST /api/v1/print-orders`.
2. Consulta o status dessa ordem em `GET /api/v1/print-orders/{orderId}/status`.
3. Converte a resposta para texto e verifica, com expressões regulares, que não há e-mail nem CPF.
4. Confere que todas as chaves da resposta fazem parte da lista permitida (`orderId` e `status`), o que impede que um objeto completo seja enviado por engano.

Se qualquer verificação falhar, o teste falha. Em um pipeline de entrega, isso bloqueia o deploy.

## Como executar

O teste chama a API em `http://localhost:8000`, então o ambiente precisa estar no ar antes:

    docker compose up -d
    npm test

[CONFIRMAR] Se o comando para subir o ambiente é esse (conferir o README e o docker-compose.yml).

## Observação sobre ArchUnit
O modelo de checklist cita o ArchUnit, que é uma biblioteca para Java e .NET. Como este projeto é em Node.js, o mesmo papel é cumprido por testes automatizados próprios, como o do arquivo acima.
