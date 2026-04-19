import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendDigitalProductEmailParams {
  to: string;
  customerName: string;
  productName: string;
  downloadUrl: string;
  orderId: string;
}

export async function sendDigitalProductEmail({
  to,
  customerName,
  productName,
  downloadUrl,
  orderId,
}: SendDigitalProductEmailParams) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Ma Boutique';
  const from = process.env.RESEND_FROM_EMAIL || 'noreply@monsite.com';

  const { data, error } = await resend.emails.send({
    from: `${storeName} <${from}>`,
    to,
    subject: `✅ Votre commande — ${productName}`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
          .header { background: #6366f1; padding: 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { padding: 32px; }
          .body p { color: #374151; line-height: 1.6; }
          .btn { display: inline-block; background: #6366f1; color: #fff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 16px 0; }
          .footer { padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center; }
          .footer p { color: #9ca3af; font-size: 13px; margin: 0; }
          .order-ref { background: #f3f4f6; border-radius: 6px; padding: 12px 16px; color: #6b7280; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Paiement confirmé !</h1>
          </div>
          <div class="body">
            <p>Bonjour ${customerName || 'cher client'},</p>
            <p>Merci pour votre achat de <strong>${productName}</strong>. Votre fichier est prêt à télécharger :</p>
            <p style="text-align:center;">
              <a href="${downloadUrl}" class="btn">⬇️ Télécharger maintenant</a>
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              Ce lien est valide indéfiniment. Gardez cet email précieusement.
            </p>
            <div class="order-ref">
              Référence commande : <strong>${orderId}</strong>
            </div>
          </div>
          <div class="footer">
            <p>${storeName} · Des questions ? Répondez à cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data;
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  productName,
  orderId,
  estimatedDelivery = '7–14 jours',
}: {
  to: string;
  customerName: string;
  productName: string;
  orderId: string;
  estimatedDelivery?: string;
}) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Ma Boutique';
  const from = process.env.RESEND_FROM_EMAIL || 'noreply@monsite.com';

  const { data, error } = await resend.emails.send({
    from: `${storeName} <${from}>`,
    to,
    subject: `📦 Commande confirmée — ${productName}`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
          .header { background: #10b981; padding: 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { padding: 32px; }
          .body p { color: #374151; line-height: 1.6; }
          .info-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin: 16px 0; }
          .footer { padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center; }
          .footer p { color: #9ca3af; font-size: 13px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Commande en route !</h1>
          </div>
          <div class="body">
            <p>Bonjour ${customerName || 'cher client'},</p>
            <p>Votre commande de <strong>${productName}</strong> a été transmise à notre partenaire logistique.</p>
            <div class="info-box">
              <strong>Livraison estimée :</strong> ${estimatedDelivery}<br>
              <strong>Référence :</strong> ${orderId}
            </div>
            <p>Vous recevrez un email de suivi avec le numéro de tracking dès que votre colis sera expédié.</p>
          </div>
          <div class="footer">
            <p>${storeName} · Des questions ? Répondez à cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data;
}
