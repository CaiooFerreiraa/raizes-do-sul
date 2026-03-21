import { Resend } from 'resend';

// Verifica se a chave existe antes de instanciar para evitar crashes se a rota for acessada sem configurar a ENV.
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendReceiptEmail(to: string, orderId: string, receiptUrl: string, customerName: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY não configurada. E-mail não enviado.");
    return;
  }

  try {
    await resend.emails.send({
      // Se você configurar o domínio no Resend, troque para: 'Raízes do Sul <seu-email@seudominio.com.br>'
      from: 'Raízes do Sul <onboarding@resend.dev>',
      to,
      subject: `Comprovante de Pagamento - Pedido #${orderId.slice(0, 6).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #333;">Olá, ${customerName}!</h2>
          <p style="color: #555; line-height: 1.5;">Obrigado por comprar na <strong>Raízes do Sul</strong>. O seu pagamento foi processado e aprovado com sucesso pela AbacatePay.</p>
          <p style="color: #555; line-height: 1.5;">Você pode acessar e baixar o seu comprovante oficial no link abaixo:</p>
          
          <div style="margin: 30px 0; text-align: center;">
             <a href="${receiptUrl}" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Visualizar Comprovante</a>
          </div>
          
          <p style="color: #555; line-height: 1.5;">Qualquer dúvida sobre o seu pedido, basta responder a este e-mail ou nos chamar no WhatsApp da loja.</p>
          <p style="color: #555; line-height: 1.5; margin-top: 30px;">Um abraço,<br/><strong>Equipe Raízes do Sul</strong></p>
        </div>
      `,
    });
    console.log(`✉️ E-mail de comprovante enviado com sucesso para ${to}`);
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail de comprovante:", error);
  }
}
