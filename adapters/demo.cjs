// Demonstração dos padrões Factory Method e Adapter.
// Executar com: node adapters/demo.cjs

const { GraficaConectorFactory } = require('./fabrica-conectores.cjs');

const pedido = {
  titulo: 'Arquitetura de Software & Padrões',
  isbn: '978-85-0000-000-0',
  quantidade: 500,
};

const fabrica = new GraficaConectorFactory();
const resultado = fabrica.enviarPedido(pedido);

console.log('Destino:', resultado.destino);
console.log('Status:', resultado.status);
console.log('Payload XML enviado:');
console.log(resultado.payload);
