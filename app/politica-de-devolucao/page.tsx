import Link from "next/link";

export default function PoliticaDevolucaoPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black text-neutral-100 px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8 bg-neutral-900/60 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        <header className="border-b border-white/10 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Política de Devolução e Trocas</h1>
          <p className="text-neutral-400 text-sm mt-1 font-medium">Garantia de 30 dias e Compra Protegida pelo Mercado Livre</p>
        </header>

        <section className="space-y-4 text-sm text-neutral-300 leading-relaxed">
          <p>
            Nosso compromisso é com a sua total satisfação. Todas as compras realizadas através do nosso catálogo e direcionadas ao <strong>Mercado Livre</strong> possuem a garantia do programa <strong>Compra Garantida</strong>.
          </p>

          <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl space-y-2">
            <h2 className="font-bold text-emerald-400 text-base">🛡️ Garantia de Devolução de 30 Dias</h2>
            <p className="text-xs text-neutral-300">
              Você tem até <strong>30 dias corridos</strong> a partir do recebimento do produto para solicitar a devolução ou troca gratuita, sem qualquer custo adicional.
            </p>
          </div>

          <h2 className="text-base font-bold text-white pt-2">1. Condições para Devolução</h2>
          <ul className="list-disc list-inside space-y-2 text-xs text-neutral-300">
            <li>O produto deve estar na embalagem original, sem sinais de uso indevido ou avarias provocadas por terceiros.</li>
            <li>Acompanhado de todos os acessórios, manuais e nota fiscal/comprovante de compra.</li>
          </ul>

          <h2 className="text-base font-bold text-white pt-2">2. Como Solicitar a Devolução</h2>
          <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300">
            <li>Acesse sua conta no Mercado Livre na seção <strong>Minhas Compras</strong>.</li>
            <li>Selecione o pedido desejado e clique em <strong>Devolver produto</strong>.</li>
            <li>Escolha o motivo da devolução e você receberá uma etiqueta de envio gratuito para postar nos Correios ou agência credenciada.</li>
          </ol>

          <h2 className="text-base font-bold text-white pt-2">3. Reembolso do Valor</h2>
          <p className="text-xs text-neutral-300">
            Assim que o produto retornar e passar pela verificação, o reembolso integral do valor pago será realizado automaticamente na mesma forma de pagamento utilizada na compra (Cartão de Crédito, Pix ou Saldo Mercado Pago).
          </p>
        </section>

        <footer className="border-t border-white/10 pt-4 text-xs text-neutral-500 text-center">
          <Link href="/dashboard" className="text-purple-400 hover:underline">← Voltar ao Painel</Link>
        </footer>
      </div>
    </main>
  );
}
