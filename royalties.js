const { Kafka } = require('kafkajs');

// Configuração do Kafka (O mesmo broker, mas agora atuando como Consumer)
const kafka = new Kafka({
    clientId: 'royalties-service',
    brokers: ['kafka:29092']
});

// O groupId garante que se tivermos 5 instâncias deste serviço, o evento só é processado por 1
const consumer = kafka.consumer({ groupId: 'royalties-processing-group' });

// Base de dados simulada para o controlo financeiro
const financeDatabase = new Map();

async function startRoyaltiesService() {
    await consumer.connect();
    console.log("[Royalties] Conectado ao Kafka. A aguardar eventos...");

    // Subscreve o tópico que a Anti-Corruption Layer alimenta
    await consumer.subscribe({ topic: 'auditoria-impressoes', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString());
            
            // Ignora eventos que não tenham a quantidade (os nossos testes anteriores)
            if (!event.quantity) return;

            console.log(`\n[Royalties] 📥 Novo evento detetado para o manuscrito: ${event.manuscriptId}`);
            
            // Regra de negócio: O autor ganha 2.50€ por cada livro impresso
            const royaltyPorLivro = 2.50;
            const valorTotal = event.quantity * royaltyPorLivro;

            // Registo imutável na base de dados financeira
            const transacao = {
                transactionId: `TX-${Date.now()}`,
                orderId: event.orderId,
                manuscriptId: event.manuscriptId,
                quantity: event.quantity,
                totalRoyalties: valorTotal,
                processedAt: new Date().toISOString()
            };

            financeDatabase.set(transacao.transactionId, transacao);

            console.log(`[Royalties] 💰 Cálculo efetuado: ${event.quantity} cópias x ${royaltyPorLivro}€ = ${valorTotal}€`);
            console.log(`[Royalties] 📝 Transação ${transacao.transactionId} registada para auditoria.`);
        },
    });
}

startRoyaltiesService().catch(console.error);