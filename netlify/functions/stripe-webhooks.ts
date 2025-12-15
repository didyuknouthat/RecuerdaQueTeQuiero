
import Stripe from 'stripe';
import { Resend } from 'resend';

// Define el tipo de respuesta que Netlify espera
interface HandlerResponse {
  statusCode: number;
  body: string;
  headers?: { [key: string]: string };
}

// El nombre del archivo (stripe-webhooks) se convierte en la URL: /.netlify/functions/stripe-webhooks
export async function handler(event: { body: string; headers: { [key: string]: string } }): Promise<HandlerResponse> {
  console.log('Netlify Function "stripe-webhooks" invoked.');

  // Configuración de las Claves Secretas desde las variables de entorno de Netlify
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  });
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const signingSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET!;
  const yourBusinessEmail = 'recuerdaquetequiero@gmail.com';

  try {
    const signature = event.headers['stripe-signature'];
    if (!signature) {
      throw new Error('Missing Stripe signature');
    }

    // Validar la petición de Stripe
    const stripeEvent = stripe.webhooks.constructEvent(event.body, signature, signingSecret);
    console.log(`Received valid Stripe event: ${stripeEvent.type}`);

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      
      // Esperar a que los detalles del cliente y los productos estén disponibles
      const customerDetails = session.customer_details;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      const customerEmail = customerDetails?.email;
      if (!customerEmail) {
        throw new Error('Customer email not found in session.');
      }

      const productListHtml = lineItems.data.map((item) => `<li>${item.description} (Cantidad: ${item.quantity})</li>`).join('');
      const shippingAddressHtml = session.shipping_details
        ? `<h3>Dirección de Envío:</h3><p>${session.shipping_details.name}<br>${session.shipping_details.address?.line1}<br>${session.shipping_details.address?.line2 || ''}<br>${session.shipping_details.address?.postal_code} ${session.shipping_details.address?.city}<br>${session.shipping_details.address?.state}, ${session.shipping_details.address?.country}</p>`
        : '<p>Este pedido no requiere envío.</p>';

      // Enviar email al cliente
      await resend.emails.send({
        from: `RecuerdaQueTeQuiero <onboarding@resend.dev>`,
        to: customerEmail,
        subject: '¡Gracias por tu compra en RecuerdaQueTeQuiero!',
        html: `<h1>¡Hola!</h1><p>Hemos recibido tu pedido y nos pondremos a prepararlo con mucho cariño. ¡Gracias por apoyar la artesanía!</p>`,
      });

      // Enviar email de notificación para ti
      await resend.emails.send({
        from: 'Notificación de Pedido <onboarding@resend.dev>',
        to: yourBusinessEmail,
        subject: '🎉 ¡Nuevo Pedido en tu Tienda!',
        html: `<h1>¡Has recibido un nuevo pedido!</h1><h2>Detalles del cliente:</h2><p>Email: ${customerEmail}</p>${shippingAddressHtml}<h2>Productos comprados:</h2><ul>${productListHtml}</ul>`,
      });

      console.log('Confirmation and notification emails sent successfully.');
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
