import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@15.12.0'
import { Resend } from 'https://esm.sh/resend@3.4.0'

console.log('Stripe Webhooks function booting up! v_ULTRA_FINAL')

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-06-20',
})
const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const signingSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') as string
const yourBusinessEmail = 'recuerdaquetequiero@gmail.com'

// Objeto de encabezados CORS corregido
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST', // LA LÍNEA QUE FALTABA
}

serve(async (req) => {
  // Gestionar la petición de permiso (preflight) de Stripe
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('Missing Stripe signature')
    }

    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(body, signature, signingSecret)
    console.log(`Received valid Stripe event: ${event.type}`)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const customerEmail = session.customer_details?.email
      const shippingDetails = session.shipping_details
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

      if (!customerEmail) {
        throw new Error('Customer email not found in session.')
      }

      const productListHtml = lineItems.data.map((item) => `<li>${item.description} (Cantidad: ${item.quantity})</li>`).join('')
      const shippingAddressHtml = shippingDetails
        ? `<h3>Dirección de Envío:</h3><p>${shippingDetails.name}<br>${shippingDetails.address?.line1}<br>${shippingDetails.address?.line2 || ''}<br>${shippingDetails.address?.postal_code} ${shippingDetails.address?.city}<br>${shippingDetails.address?.state}, ${shippingDetails.address?.country}</p>`
        : '<p>Este pedido no requiere envío.</p>'

      // Enviar emails...
      await resend.emails.send({
        from: `RecuerdaQueTeQuiero <onboarding@resend.dev>`,
        to: customerEmail,
        subject: '¡Gracias por tu compra en RecuerdaQueTeQuiero!',
        html: `<h1>¡Hola!</h1><p>Hemos recibido tu pedido y nos pondremos a prepararlo con mucho cariño. ¡Gracias por apoyar la artesanía!</p>`,
      })
      await resend.emails.send({
        from: 'Notificación de Pedido <onboarding@resend.dev>',
        to: yourBusinessEmail,
        subject: '🎉 ¡Nuevo Pedido en tu Tienda!',
        html: `<h1>¡Has recibido un nuevo pedido!</h1><h2>Detalles del cliente:</h2><p>Email: ${customerEmail}</p>${shippingAddressHtml}<h2>Productos comprados:</h2><ul>${productListHtml}</ul>`,
      })
      console.log('Confirmation and notification emails sent successfully.')
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: corsHeaders })

  } catch (err) {
    console.error('Webhook Error:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400, headers: corsHeaders })
  }
})
