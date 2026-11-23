const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ai-agent-service',
  brokers: ['kafka:29092'],
});

const consumer = kafka.consumer({ groupId: 'ia-agent-group' });

function gerarFallback(referencia, tiragem) {
  return {
    modo: 'fallback-estruturado',
    referencia,
    recomendacao: {
      publicoAlvo: 'Leitores de literatura técnica e engenharia de software',
      titulosSimilares: ['Arquitetura Limpa', 'Domain-Driven Design'],
    },
    diagramacao: {
      formatoFisico:
        tiragem >= 1000
          ? 'Offset 16x23cm, Papel Pólen 80g, Fonte Garamond 11pt'
          : 'Impressão Digital 14x21cm, Papel Offset 75g',
      formatoEbook: 'EPUB3 Reflowable, Fonte Sans-Serif adaptativa, Margens dinâmicas',
    },
  };
}

async function gerarRecomendacaoEDiagramacao(referencia, tiragem) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return gerarFallback(referencia, tiragem);

  const prompt = `Atue como um agente editorial. Para o livro "${referencia}" com tiragem de ${tiragem} exemplares, retorne APENAS um JSON válido sem markdown com as chaves: recomendacao (publicoAlvo, titulosSimilares[]) e diagramacao (formatoFisico, formatoEbook).`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );

  const data = await response.json();
  const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!texto) {
    console.warn('[Agente IA] API indisponível:', data?.error?.message || JSON.stringify(data));
    return gerarFallback(referencia, tiragem);
  }

  return JSON.parse(texto);
}

async function run() {
  await consumer.connect();
  console.log('[Agente IA] Conectado ao Kafka. A aguardar eventos...');

  await consumer.subscribe({ topic: 'auditoria-impressoes', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());

      // Guardrail LGPD: usa apenas metadados editoriais (sem PII)
      const referencia = payload.title || payload.titulo || payload.manuscriptId || 'Manuscrito';
      const tiragem = payload.quantity || payload.tiragem || payload.copies || 100;

      console.log(`[Agente IA] Processando recomendação e diagramação para: "${referencia}" (${tiragem} cópias)...`);

      try {
        const resultado = await gerarRecomendacaoEDiagramacao(referencia, tiragem);
        console.log('[Agente IA] Resultado gerado:', JSON.stringify(resultado, null, 2));
      } catch (err) {
        console.error('[Agente IA] Erro ao consultar LLM:', err.message);
        console.log('[Agente IA] Resultado gerado (fallback):', JSON.stringify(gerarFallback(referencia, tiragem), null, 2));
      }
    },
  });
}

run().catch((err) => {
  console.error('[Agente IA] Falha crítica:', err);
  process.exit(1);
});