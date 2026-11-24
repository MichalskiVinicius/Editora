// Padrão FACTORY METHOD
// A classe base define o fluxo de envio, e cada subclasse decide
// qual conector concreto criar. O domínio não conhece as classes concretas.

const { GraficaAdapter } = require('./grafica-adapter.cjs');

// Conector concreto: usa o Adapter para traduzir e simula o envio à fila
class ConectorGrafica {
  constructor(adapter) {
    this.adapter = adapter;
  }

  enviar(pedido) {
    const xml = this.adapter.traduzir(pedido);
    return { destino: 'grafica-legada', status: 'enfileirado', payload: xml };
  }
}

// Creator (abstrato)
class ConectorFactory {
  criarConector() {
    throw new Error('Implementar criarConector() na subclasse');
  }

  enviarPedido(pedido) {
    const conector = this.criarConector(); // Factory Method
    return conector.enviar(pedido);
  }
}

// Creator concreto
class GraficaConectorFactory extends ConectorFactory {
  criarConector() {
    return new ConectorGrafica(new GraficaAdapter());
  }
}

module.exports = { ConectorFactory, GraficaConectorFactory, ConectorGrafica };
