# Fitness Functions (Governança Automatizada)

Fitness functions são testes automatizados que verificam se a arquitetura continua respeitando as regras definidas.

## Fitness function do projeto: Segurança e LGPD

- **Arquivo:** [lgpd.fitness.test.js](../lgpd.fitness.test.js)
- **Ferramentas:** Jest e axios (teste de integração contra a API exposta pelo Kong API Gateway)
- **Regra validada:** o endpoint `GET /api/v1/print-orders/{orderId}/status` não pode expor dados pessoais (PII). A resposta não pode conter e-mail nem CPF, e só pode retornar as chaves `orderId` e `status`.
- **Decisão relacionada:** [ADR-006](../adrs/ADR-006.md)

## Como executar

Suba o ambiente com Docker Compose e execute o teste passando a `API_KEY` de desenvolvimento configurada no `kong.yml`:

    docker compose up -d
    API_KEY=chave-secreta-ecommerce-123 npm test

## Observação sobre ArchUnit

O modelo de checklist cita o ArchUnit (Java/.NET). Como este projeto utiliza Node.js, a governança automatizada é executada com Jest (`lgpd.fitness.test.js`).
