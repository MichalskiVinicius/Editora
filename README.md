# Agile Dead Trees — Editora Digital e Publicação Híbrida

## Identificação da Equipe

| Nome do Integrante | Função na Sprint 4 | GitHub |
|---|---|---|
| Vinicius Michalski | Líder, Arquiteto Principal & Especialista em IA-Native | [@MichalskiVinicius](https://github.com/MichalskiVinicius) |
| Leonardo Lima | Pesquisador & Modelagem DDD | [@LeoLima777](https://github.com/LeoLima777) |
| Gustavo Erich | Pesquisador & Engenheiro de Resiliência e Integração | [@gustavoerich](https://github.com/gustavoerich) |
| Guilherme Doleny | Executor, QA & Desenvolvedor de Fitness Functions | [@devdoleny](https://github.com/devdoleny) |

---

## 1. Visão Geral do Sistema e Domínio de Negócio

### 1.1. Contexto do Projeto Selecionado
**Architectural Kata:** Agile Dead Trees (Editora Digital e Publicação Híbrida).

**Desafio Principal de Engenharia:** Orquestrar o fluxo de publicação híbrida (e-books e impressão física) em uma editora em transição digital, desacoplando o núcleo editorial de gráficas físicas legadas (via arquivos posicionais EDI/Mainframe), garantindo cálculo assíncrono e auditável de direitos autorais (royalties), sincronização rápida de catálogo digital, conformidade automatizada com a LGPD e integração de um Agente de IA.

### 1.2. Resumo da Solução Proposta
A arquitetura adota **Arquitetura Orientada a Eventos (EDA)** com microsserviços em Node.js orquestrados via Docker Compose (`editora-network`). O **Kong API Gateway** centraliza autenticação (`key-auth`), roteamento e CORS na borda (`http://localhost:8000`).

Para isolar o domínio moderno da gráfica física legada, o `acl-service` (`server.js`) atua como **Camada Anti-Corrupção (ACL)**, traduzindo requisições JSON para arquivos posicionais de largura fixa (`ORDER_*.txt`) e publicando eventos no **Apache Kafka** (KRaft). Os consumidores (`royalties-service`, `catalogo-service` e `ai-agent-service`) processam os eventos de forma assíncrona e desacoplada, com persistência relacional em **PostgreSQL 15** (`agiledb`).

---

## 2. Atributos de Qualidade e Matriz QAW

| Atributo de Qualidade | Cenário Padronizado | Medida da Resposta (Meta) |
|---|---|---|
| Desempenho / Latência | Requisições simultâneas de criação de ordem de impressão via Kong API Gateway. | Resposta HTTP `202 Accepted` com latência p95 < 250ms (processamento assíncrono no Kafka). |
| Disponibilidade / Resiliência | Indisponibilidade temporária de um consumidor (`royalties`, `catalogo` ou `ai-agent`). | Eventos retidos no Kafka e reinício automático de contêineres (`restart: always`) sem derrubar o `acl-service`. |
| Privacidade / Conformidade (LGPD) | Consulta ao endpoint de status de impressão (`GET /api/v1/print-orders/{id}/status`). | Zero exposição de e-mail ou CPF; payload restrito a `orderId` e `status`, validado por fitness function. |

---

## 3. Visão Geral da Arquitetura (Modelo C4)

- [Nível 1 — Diagrama de Contexto](docs/c4-model/nivel-1-contexto.md)
- [Nível 2 — Diagrama de Contêineres](docs/c4-model/nivel-2-conteineres.md)
- [Nível 3 — Diagrama de Componentes](docs/c4-model/nivel-3-componentes.md)

---

## 4. Domain-Driven Design (DDD) & Limites de Contexto

### 4.1. Classificação dos Subdomínios
- **Core Domain:** Publicação Híbrida, Catálogo Digital (`catalogo.js`) e Cálculo de Royalties (`royalties.js`).
- **Supporting Subdomain:** Orquestração Editorial e Recomendações com IA (`agente-ia.js`).
- **Generic Subdomain:** API Gateway e Autenticação (`kong.yml`).

### 4.2. Documentação DDD e ACL
- [Subdomínios](docs/ddd/subdominios.md)
- [Mapa de Contexto](docs/ddd/mapa-de-contexto.md)
- [Glossário (Linguagem Ubíqua)](docs/ddd/glossario.md)

---

## 5. Padrões de Projeto & Princípios SOLID

- **DIP e OCP:** Desacoplamento entre a lógica de envio e os conectores concretos de integração.
- **Catálogo GoF completo:** [docs/padroes-gof.md](docs/padroes-gof.md)

| Padrão GoF | Categoria | Localização no Código | Problema de Engenharia Resolvido |
|---|---|---|---|
| Factory Method | Criacional | [adapters/fabrica-conectores.cjs](adapters/fabrica-conectores.cjs) | Instanciação de conectores sem acoplar o domínio às classes concretas. |
| Adapter | Estrutural | [adapters/grafica-adapter.cjs](adapters/grafica-adapter.cjs) | Tradução de pedidos do domínio para o formato legado da gráfica (ACL). |

---

## 6. Resiliência, Integração e IA-Native

- **Nivelamento de Carga (Load Leveling):** Apache Kafka desacopla o produtor (`acl-service`) dos consumidores (`royalties-service`, `catalogo-service`, `ai-agent-service`).
- **Recuperação de Contêineres:** Política `restart: always` no `docker-compose.yml`.
- **Componente IA-Native:** `ai-agent-service` (`agente-ia.js`) integrado via variável de ambiente `GEMINI_API_KEY`.

---

## 7. Registros de Decisões Arquiteturais (ADRs)

| ADR | Título | Status |
|---|---|---|
| [ADR-001](adrs/ADR-001.md) | Estilo Arquitetural (Microsserviços e EDA) | Aprovado |
| [ADR-002](adrs/ADR-002.md) | Desacoplamento com DIP e Padrões GoF | Aprovado |
| [ADR-003](adrs/ADR-003.md) | Protocolos de Integração (REST e Apache Kafka) | Aprovado |
| [ADR-004](adrs/ADR-004.md) | Contextos Delimitados e Camada Anti-Corrupção | Aprovado |
| [ADR-005](adrs/ADR-005.md) | Stack de Persistência e API Gateway (PostgreSQL e Kong) | Aprovado |
| [ADR-006](adrs/ADR-006.md) | Guardrails de IA e Conformidade LGPD | Aprovado |

---

## 8. Testes & Fitness Functions (Governança Automatizada)

Documentação completa em [docs/fitness-functions.md](docs/fitness-functions.md).

- **Regra validada (`lgpd.fitness.test.js`):** O endpoint `GET /api/v1/print-orders/{orderId}/status` não expõe e-mail nem CPF e retorna apenas as chaves `orderId` e `status`.
- **Nota de segurança:** A chave `chave-secreta-ecommerce-123` presente no `kong.yml` é exclusivamente para ambiente local de desenvolvimento (não usar em produção).

### Como executar

    docker compose up -d
    API_KEY=chave-secreta-ecommerce-123 npm test
    node adapters/demo.cjs
