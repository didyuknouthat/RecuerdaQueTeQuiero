
import Stripe from 'stripe';
import { Resend } from 'resend';

// --- Interfaces para la respuesta y el evento de Netlify ---
interface HandlerResponse {
  statusCode: number;
  body: string;
  headers?: { [key: string]: string };
}
interface HandlerEvent {
  httpMethod: string;
  body: string;
  headers: { [key: string]: string };
}

// --- Encabezados CORS Correctos ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// --- El Cerebro de tu Webhook ---
export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  // 1. Responder a la petición de "permiso" (OPTIONS) de Stripe
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Preflight OK' }),
    };
  }

  // 2. Asegurarse de que el resto de peticiones son de tipo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
      headers: corsHeaders,
    };
  }

  // 3. Lógica para procesar el pago
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const signingSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET!;
  const yourBusinessEmail = 'recuerdaquetequiero@gmail.com';

  try {
    const signature = event.headers['stripe-signature'];
    if (!signature) throw new Error('Missing Stripe signature');

    const stripeEvent = stripe.webhooks.constructEvent(event.body, signature, signingSecret);

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const customerDetails = session.customer_details;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const customerEmail = customerDetails?.email;

      if (!customerEmail) throw new Error('Customer email not found');

      const productListHtml = lineItems.data.map((item) => `<li>${item.description} (Cantidad: ${item.quantity})</li>`).join('');
      const shippingAddressHtml = session.shipping_details
        ? `<h3>Dirección de Envío:</h3><p>${session.shipping_details.name}<br>${session.shipping_details.address?.line1}<br>${session.shipping_details.address?.line2 || ''}<br>${session.shipping_details.address?.postal_code} ${session.shipping_details.address?.city}<br>${session.shipping_details.address?.state}, ${session.shipping_details.address?.country}</p>`
        : '<p>Este pedido no requiere envío.</p>';

      // Enviar emails...
      await resend.emails.send({
        from: `RecuerdaQueTeQuiero <onboarding@resend.dev>`,
        to: customerEmail,
        subject: '¡Gracias por tu compra en RecuerdaQueTeQuiero!',
        html: `<h1>¡Hola!</h1><p>Hemos recibido tu pedido y nos pondremos a prepararlo con mucho cariño. ¡Gracias por apoyar la artesanía!</p>`,
      });
      await resend.emails.send({
        from: 'Notificación de Pedido <onboarding@resend.dev>',
        to: yourBusinessEmail,
        subject: '🎉 ¡Nuevo Pedido en tu Tienda!',
        html: `<h1>¡Has recibido un nuevo pedido!</h1><h2>Detalles del cliente:</h2><p>Email: ${customerEmail}</p>${shippingAddressHtml}<h2>Productos comprados:</h2><ul>${productListHtml}</ul>`,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }
}
