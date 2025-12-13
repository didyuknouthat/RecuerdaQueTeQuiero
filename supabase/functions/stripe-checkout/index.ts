import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@11.1.0';

// Define la forma de los datos que esperamos recibir del carrito
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

// Inicializa Stripe con la clave secreta que guardaste antes de forma segura
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
});

// La función principal que se ejecuta cuando se recibe una petición
serve(async (req) => {
  // Esta parte es necesaria por seguridad web (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // 1. Obtiene los productos del carrito que envía la petición
    const cartItems: CartItem[] = await req.json();

    // 2. Convierte los productos del carrito al formato que Stripe necesita
    const line_items = cartItems.map((item) => {
      return {
        price_data: {
          currency: 'eur', // ¡CAMBIADO A EUROS!
          product_data: {
            name: item.name,
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe necesita el precio en céntimos
        },
        quantity: item.quantity,
      };
    });

    // 3. Crea una Sesión de Pago segura en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      // IMPORTANTE: Aquí le dices a Stripe a dónde enviar al usuario después del pago
      success_url: `https://recuerdaquetequiero.netlify.app/`, // Más adelante podemos crear una página de "gracias"
      cancel_url: `https://recuerdaquetequiero.netlify.app/`,
    });

    // 4. Devuelve la URL de la página de pago de Stripe
    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
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
