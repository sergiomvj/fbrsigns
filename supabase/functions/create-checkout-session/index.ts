// @ts-nocheck
// Create Stripe Checkout Session
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, customer_email, success_url, cancel_url, metadata = {} } = await req.json();

    console.log("[Create Checkout] Request received:", { items, customer_email, metadata });

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "No items provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.amount * (item.quantity || 1));
    }, 0);

    console.log(`[Create Checkout] Total amount: ${totalAmount} cents`);

    // IMPORTANT: order_id must be passed in metadata
    const orderId = metadata.order_id;
    
    if (!orderId) {
      console.error("[Create Checkout] ❌ CRITICAL: No order_id provided in metadata!");
      return new Response(
        JSON.stringify({ error: "order_id is required in metadata" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          ...(item.description && { description: item.description }),
        },
        unit_amount: item.amount, // Already in cents
      },
      quantity: item.quantity || 1,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: success_url || `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get("origin")}/payment-cancel`,
      customer_email: customer_email,
      metadata: {
        order_id: orderId,
        ...metadata,
      },
      payment_intent_data: {
        metadata: {
          order_id: orderId,
        },
      },
    });

    console.log(`[Create Checkout] ✅ Session created: ${session.id}`);
    console.log(`[Create Checkout] Order ID: ${orderId}`);
    console.log(`[Create Checkout] URL: ${session.url}`);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Create Checkout] 🚨 Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
