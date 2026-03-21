import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { sendReceiptEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const payload = JSON.parse(bodyText);
    const signature = req.headers.get("x-webhook-signature") || req.headers.get("X-Webhook-Signature");
    const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    // Validação de Assinatura (baseada na documentação da AbacatePay)
    if (webhookSecret && signature) {
      const hmac = crypto.createHmac("sha256", webhookSecret);
      const digest = hmac.update(bodyText).digest("base64");

      if (digest !== signature) {
        console.error("Assinatura do webhook inválida!");
        // Em produção, você pode decidir se bloqueia ou apenas loga
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = payload.event;
    console.log(`[AbacatePay Webhook] Evento recebido: ${event}`);
    
    // Suporte para checkout.completed ou billing.paid
    if (event === "checkout.completed" || event === "billing.paid") {
      const externalId = 
        payload.data?.checkout?.externalId || 
        payload.data?.billing?.externalId || 
        payload.data?.externalId ||
        payload.data?.metadata?.externalId;

      if (externalId) {
        // Buscar o pedido
        const order = await prisma.order.findUnique({
          where: { id: externalId },
        });

        if (order) {
          // Atualizar status do pedido e do pagamento
          await prisma.order.update({
            where: { id: externalId },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED"
            },
          });

          // Obtenção do e-mail e dados para o recibo
          const checkout = payload.data?.checkout || payload.data?.billing || payload.data;
          const receiptUrl = checkout?.receiptUrl || checkout?.url;
          const customer = payload.data?.customer;
          const email = customer?.email || order.customerEmail;
          const name = customer?.name || order.customerName;

          if (receiptUrl && email) {
            try {
              await sendReceiptEmail(email, order.id, receiptUrl, name);
              console.log(`📧 Email de recibo enviado para: ${email}`);
            } catch (emailErr) {
              console.error("❌ Erro ao enviar email de recibo:", emailErr);
            }
          }

          console.log(`[AbacatePay Webhook] Pedido ${externalId} atualizado para PAID e CONFIRMED`);
        } else {
          console.warn(`[AbacatePay Webhook] Pedido com ID ${externalId} não encontrado no banco.`);
        }
      } else {
        console.warn("[AbacatePay Webhook] Webhook recebido sem externalId no payload");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erro na rota de Webhook:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
