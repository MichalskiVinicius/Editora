Identificação da Equipe 

Nome do Integrante, Função na Sprint 4 (Liderança / Pesquisador / Executor), GitHub 

Vinicius Michalski, Líder & Arquiteto Principal, @MichalskiVinicius

Leonardo Lima, Pesquisador & Modelagem DDD, @LeoLima777

Gustavo Erich, Pesquisador & Engenheiro de Resiliência & Integração, @gustavoerich

Vinicius Michalski, Executor & Especialista em IA-Native & Autonomia, @MichalskiVinicius 

Guilherme Doleny, Executor & QA & Desenvolvedor de Fitness Functions, @devdoleny

 
*Imagens dos diagramas junto com os arquivos

1. Visão Geral do Sistema e Domínio de Negócio 

1.1. Contexto do Projeto Selecionado 

Architectural Kata: Agile Dead Trees (Editora Digital e Publicação Híbrida). 

Desafio Principal de Engenharia: Orquestrar o fluxo de publicação híbrida (e-books vs. impressão física) em uma editora em transição digital, desacoplando o núcleo editorial de gráficas físicas legadas (via arquivos posicionais EDI/Mainframe), garantindo cálculo assíncrono e auditável de direitos autorais (royalties), sincronização rápida de catálogo digital, conformidade automatizada com a LGPD e integração de um Agente de IA para recomendação e diagramação personalizada. 

1.2. Resumo da Solução Proposta 

A arquitetura proposta para a Editora Agile Dead Trees moderniza o fluxo de publicação híbrida migrando processos acoplados a sistemas legados para uma Arquitetura Orientada a Eventos (EDA) baseada em microsserviços independentes. A solução adota um modelo híbrido no qual a interface web (PrintBridge, em Next.js/React na Vercel) comunica-se com o backend conteinerizado através do Kong API Gateway, centralizando autenticação (key-auth), roteamento e políticas de CORS na borda do sistema. 

Para proteger o domínio moderno da rigidez das gráficas físicas legadas, foi implementada uma Camada Anti-Corrupção (ACL) em Node.js (acl-service), utilizando os padrões Adapter, Factory Method e Content-Based Router (EIP). Esse serviço traduz contratos JSON para arquivos posicionais de largura fixa (ORDER_*.txt / EDI) e publica eventos de domínio no Apache Kafka (modo KRaft). O barramento assíncrono habilita o processamento paralelo e desacoplado pelos consumidores: o royalties-service calcula e audita pagamentos de autores, o catalogo-service sincroniza títulos digitais em menos de 1 segundo e o ai-agent-service gera recomendações de leitura e diretrizes de diagramação personalizada com mecanismo de fallback estruturado. 

Sob a perspectiva de confiabilidade e governança, toda a infraestrutura é orquestrada via Docker Compose (editora-network, persistência em PostgreSQL e política restart: always), garantindo resiliência a falhas parciais e nivelamento de carga. A conformidade com a LGPD (Privacy by Design) é assegurada de forma contínua por meio de Fitness Functions automatizadas em Jest (lgpd.fitness.test.js), impedindo o vazamento de dados pessoais (PII) entre serviços, logs e chamadas ao modelo de IA. 

 

 

2. Atributos de Qualidade e Matriz QAW 

Os atributos de qualidade prioritários foram definidos com base nos trade-offs essenciais do sistema: 

Atributo de Qualidade, Cenário Padronizado (Fonte -> Estímulo -> Artefato -> Ambiente -> Resposta), Medida da Resposta (Métrica Objetivo) 

Desempenho / Latência, Usuários concorrentes enviam requisições em pico no backend sob carga normal., Latência p95 < 250ms na resposta de confirmação. 

Disponibilidade / Resiliência, Falha de rede ou queda no servidor de pagamento em ambiente de produção., Isolamento via Circuit Breaker e Fallback sem indisponibilizar a UI. 

Escalabilidade / Elasticidade, Salto de acessos de 1.000 para 10.000 req/s durante evento pico., Subida automática de réplicas via auto-scaling em menos de 45 segundos. 

 

3. Visão Geral da Arquitetura (Modelo C4) 

A arquitetura está documentada conforme as abstrações do Modelo C4: 

📄 Nível 1 — Diagrama de Contexto: 

 

📄 Nível 2 — Diagrama de Contêineres: 

 

📄 Nível 3 — Diagrama de Componentes: 

 

 

Visualização do Diagrama de Contêineres (C4 - Nível 2) 


4. Domain-Driven Design (DDD) & Limites de Contexto 

4.1. Classificação dos Subdomínios 

Core Domain (Domínio Principal): [ex: Motor de Avaliação Automática de Código / Engine de Lances em Tempo Real] 

Supporting Subdomain (Suporte): [ex: Gestão de Notificações e Posições Acadêmicas] 

Generic Subdomain (Genérico): [ex: Autenticação SSO, Gateway de Pagamento Terceirizado] 

4.2. Mapa de Contexto e Camada Anti-Corrupção (ACL) 

O sistema integra-se a serviços legados utilizando o padrão Anti-Corruption Layer (ACL) com a implementação de adaptadores GoF (Adapter Pattern) localizados em , isolando a Linguagem Ubíqua do núcleo do sistema. 

 

5. Padrões de Projeto & Princípios SOLID 

5.1. Princípios SOLID Aplicados 

Dependency Inversion Principle (DIP): O domínio declara interfaces de repositórios e serviços (), enquanto a infraestrutura provê a implementação concreta (). 

Open/Closed Principle (OCP): Extensão de novos algoritmos de negócio via polimorfismo sem alteração das classes mestres. 

5.2. Catálogo de Padrões GoF Utilizados 

Padrão GoF, Categoria, Localização no Código (), Problema de Engenharia Resolvido 

Factory Method, Criacional, , Instanciação dinâmica de conectores de integração sem acoplamento a classes concretas. 

Adapter, Estrutural, , Tradução de payloads XML/EDI de sistemas legados para os DTOs em JSON do domínio. 

Strategy, Comportamental, , Eliminação de condicionais if/else complexas para alternância de regras de negócio. 

 

6. Resiliência, Integração e IA-Native 

6.1. Padrões de Resiliência Aplicados 

Circuit Breaker & Fallback: Implementado via Polly em chamadas HTTP síncronas para evitar thread starvation. 

Nivelamento de Carga (Load Leveling): Mensageria assíncrona absorve picos de concorrência com filas Dead Letter Queue (DLQ) atreladas. 

6.2. Componente de Inteligência Artificial Generativa 

Arquitetura AI-Native: [Descreva o uso de RAG / Model Tiering / Multi-Agentes]. 

Guardrails & Segurança: Saídas estruturadas validadas via JSON Schema e higienização prévia de PII antes do envio aos modelos. 

 

7. Registros de Decisões Arquiteturais (ADRs) 

Todas as decisões estratégicas e seus trade-offs estão registrados na pasta : 

ADR, Título da Decisão Arquitetural, Status, Data 

ADR-001, Adoção do Estilo Arquitetural (Monólito Modular vs. Microsserviços), Aprovado, 2026-09-10 

ADR-002, Estratégia de Desacoplamento de Código com DIP e Padrões GoF, Aprovado, 2026-10-05 

ADR-003, Definição dos Protocolos de Integração (gRPC, REST e RabbitMQ), Aprovado, 2026-10-20 

ADR-004, Mapeamento de Contextos Delimitados e Camada Anti-Corrupção, Aprovado, 2026-10-28 

ADR-005, Seleção de Frameworks, Banco Vetorial e Stack do API Gateway, Aprovado, 2026-11-05 

ADR-006, Integração de Componentes Probabilísticos e Guardrails de IA, Aprovado, 2026-11-15 

 

8. Testes & Fitness Functions (Governança Automatizada) 

8.1. Execução das Fitness Functions (ArchUnit) 

Para garantir que as regras de dependência entre camadas não sejam violadas no código, executamos testes de arquitetura automatizados: 

Regra Validada 1: A camada de Domínio não possui referência direta para a camada de Infraestrutura. 

Regra Validada 2: Todas as classes de repositório implementam uma interface abstrata correspondente. 

 
