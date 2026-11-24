// Padrão ADAPTER
// Traduz o pedido de impressão do domínio (objeto JavaScript)
// para o XML que a gráfica legada espera receber.
// Protege o domínio do formato legado (Camada Anti-Corrupção, ADR-004).

function escaparXml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

class GraficaAdapter {
  traduzir(pedido) {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<PedidoImpressao>',
      `  <Obra>${escaparXml(pedido.titulo)}</Obra>`,
      `  <ISBN>${escaparXml(pedido.isbn)}</ISBN>`,
      `  <Quantidade>${Number(pedido.quantidade)}</Quantidade>`,
      '</PedidoImpressao>',
    ].join('\n');
  }
}

module.exports = { GraficaAdapter };
