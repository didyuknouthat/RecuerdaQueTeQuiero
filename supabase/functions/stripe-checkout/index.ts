import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// CAMBIO CLAVE: Usar una versión moderna de la librería de Stripe
import Stripe from 'https://esm.sh/stripe@15.12.0';

console.log("Stripe Checkout function booting up!");

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  type?: string; // Añadimos el tipo para saber si es físico
}

// La función principal que se ejecuta cuando se recibe una petición
serve(async (req) => {
  console.log(`Request received: ${req.method}`);

  // Esta parte es necesaria por seguridad web (CORS)
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request for CORS.");
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-control-Allow-Headers': '*',
      },
    });
  }

  try {
    console.log("Attempting to process payment...");

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in Supabase secrets.");
    }
    console.log("Stripe secret key loaded.");

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    });
    console.log("Stripe client initialized.");

    const cartItems: CartItem[] = await req.json();
    console.log("Received cart items:", JSON.stringify(cartItems, null, 2));

    const hasPhysicalProduct = cartItems.some(item => item.type === 'creation');

    const line_items = cartItems.map((item) => {
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });
    console.log("Formatted line items for Stripe.");

    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      shipping_address_collection: hasPhysicalProduct ? {
        allowed_countries: ['ES', 'FR', 'DE', 'PT', 'IT', 'US', 'GB', 'CA'],
      } : undefined,
      // ¡NUEVO! Añade los gastos de envío si procede
      shipping_options: hasPhysicalProduct ? [
        {
          shipping_rate: 'shr_1SdwAGLYNXJuQ0AWbWDIi2o0',
        },
      ] : [],
      success_url: `https://recuerdaquetequiero.netlify.app/`,
      cancel_url: `https://recuerdaquetequiero.netlify.app/`,
    });
    console.log("Stripe session created successfully!");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("!!! FATAL ERROR IN CHECKOUT FUNCTION !!!");
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
});
