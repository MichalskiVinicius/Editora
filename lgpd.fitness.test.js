const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/v1';
const API_KEY = 'chave-secreta-ecommerce-123';

describe('Fitness Function: Segurança / LGPD', () => {
    
    // Regra de Expressão Regular simples para detetar e-mails e CPFs (formatos brasileiros/gerais)
    const regexEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const regexCPF = /\d{3}\.\d{3}\.\d{3}-\d{2}/;

    it('O endpoint de status de impressão NÃO DEVE expor dados pessoais (PII)', async () => {
        // 1. Criar uma ordem de teste
        const postResponse = await axios.post(`${API_BASE_URL}/print-orders`, {
            manuscriptId: "MS-TESTE-LGPD",
            title: "Livro Teste de Privacidade",
            quantity: 10
        }, {
            headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' }
        });

        const { orderId } = postResponse.data;
        expect(orderId).toBeDefined();

        // 2. Consultar o endpoint de status
        const getResponse = await axios.get(`${API_BASE_URL}/print-orders/${orderId}/status`, {
            headers: { 'apikey': API_KEY }
        });
        
        // 3. Converter a resposta para string para fazer a varredura
        const responseText = JSON.stringify(getResponse.data);

        // 4. Asserções de Guardrail (A falha destas regras bloqueia o deploy na vida real)
        expect(regexEmail.test(responseText)).toBe(false); // Garante que não vazou email
        expect(regexCPF.test(responseText)).toBe(false);   // Garante que não vazou CPF
        
        // Garante o contrato exato do payload de status, evitando envio de objetos completos por engano
        const chavesPermitidas = ['orderId', 'status'];
        const chavesDaResposta = Object.keys(getResponse.data);
        
        chavesDaResposta.forEach(chave => {
            expect(chavesPermitidas).toContain(chave);
        });
    });
});