const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

// Configuração do Kafka
const kafka = new Kafka({
    clientId: 'acl-service',
    brokers: ['kafka:29092']
});
const producer = kafka.producer();

const ordersDatabase = new Map();

function translateToPositional(orderData) {
    const idPart = String(orderData.manuscriptId).padEnd(10, ' ').substring(0, 10);
    const titlePart = String(orderData.title).padEnd(30, ' ').substring(0, 30);
    const quantityPart = String(orderData.quantity).padStart(8, '0').substring(0, 8);
    return `${idPart}${titlePart}${quantityPart}`;
}

app.post('/api/v1/print-orders', async (req, res) => {
    try {
        const { manuscriptId, title, quantity } = req.body;
        if (!manuscriptId || !title || !quantity) return res.status(400).json({ error: "Faltam parâmetros." });

        const orderId = crypto.randomUUID();
        const mainframePayload = translateToPositional({ manuscriptId, title, quantity });
        const fileName = `ORDER_${orderId}.txt`;
        
        await fs.writeFile(fileName, mainframePayload);
        
        const statusData = {
            orderId,
            manuscriptId,
            quantity,
            status: "ENVIADO_PARA_GRAFICA",
            createdAt: new Date().toISOString()
        };
        ordersDatabase.set(orderId, statusData);

        // Dispara o evento para o Kafka (Audit Log e Integração)
        await producer.send({
            topic: 'auditoria-impressoes',
            messages: [
                { 
                    key: manuscriptId, // Usa o ID do manuscrito como chave para manter a ordem dos eventos
                    value: JSON.stringify(statusData) 
                },
            ],
        });

        console.log(`[ACL] Ficheiro ${fileName} gerado e Evento publicado no Kafka!`);

        return res.status(202).json({ orderId, status: "PROCESSING", message: "Ordem recebida." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno no serviço." });
    }
});

app.get('/api/v1/print-orders/:id/status', (req, res) => {
    const order = ordersDatabase.get(req.params.id);
    if (!order) return res.status(404).json({ error: "Ordem não encontrada." });
    return res.status(200).json({ orderId: order.orderId, status: order.status });
});

// Endpoint chamado pelo CMS Legado quando um livro é aprovado
app.post('/api/v1/editorial/approve', async (req, res) => {
    try {
        const { manuscriptId, title, author, basePrice } = req.body;
        
        if (!manuscriptId || !title || !author) {
            return res.status(400).json({ error: "Faltam parâmetros do manuscrito." });
        }

        const eventoCatalogo = {
            manuscriptId,
            title,
            author,
            basePrice: basePrice || 0,
            status: "DISPONIVEL_PARA_VENDA",
            approvedAt: new Date().toISOString()
        };

        // Publica o evento no Kafka (Desacopla o CMS do E-commerce)
        await producer.send({
            topic: 'catalogo-eventos',
            messages: [
                { key: manuscriptId, value: JSON.stringify(eventoCatalogo) },
            ],
        });

        console.log(`[Editorial] 📚 Livro '${title}' aprovado e evento publicado no catálogo!`);
        return res.status(202).json({ message: "Aprovação registada e a sincronizar catálogo." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao publicar evento de catálogo." });
    }
});

// Inicialização: Conecta ao Kafka antes de abrir a porta HTTP
async function startServer() {
    await producer.connect();
    console.log("[ACL] Conectado ao broker Kafka.");
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`[ACL] Microsserviço de Tradução Node.js a correr na porta ${PORT}`);
    });
}

startServer().catch(console.error);