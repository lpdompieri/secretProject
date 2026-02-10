setCurrentStep("initiating")

// PRÉ-CAPTURA
const precapturaResp = await fetch("/api/bndes/pedido-precaptura", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    pedido: numeroPedidoBndes,
    numeroCartao: cardData.numero.replace(/\D/g, ""),
    mesValidade: cardData.validade.slice(0, 2),
    anoValidade: "20" + cardData.validade.slice(3),
    codigoSeguranca: cardData.cvv,
  }),
})

const precaptura = await precapturaResp.json()

setCurrentStep("processing")

// CAPTURA
const capturaResp = await fetch("/api/bndes/pedido-captura", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    pedido: numeroPedidoBndes,
  }),
})

const captura = await capturaResp.json()

setCurrentStep("generating")
