// @ts-nocheck
// Stripe Webhook Handler - Processa pagamentos confirmados
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("[Stripe Webhook] Missing stripe-signature header");
      return new Response("Missing signature", { status: 400, headers: corsHeaders });
    }

    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!endpointSecret) {
      console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500, headers: corsHeaders });
    }

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400, headers: corsHeaders });
    }

    console.log(`[Stripe Webhook] Event received: ${event.type}`);
    console.log(`[Stripe Webhook] Event ID: ${event.id}`);

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      console.log(`[Stripe Webhook] ✅ Payment successful!`);
      console.log(`[Stripe Webhook] Session ID: ${session.id}`);
      console.log(`[Stripe Webhook] Customer: ${session.customer_email}`);
      console.log(`[Stripe Webhook] Amount: ${session.amount_total}`);
      console.log(`[Stripe Webhook] Metadata:`, session.metadata);

      // Extract order_id from metadata
      const orderId = session.metadata?.order_id;
      
      if (!orderId) {
        console.error(`[Stripe Webhook] ❌ No order_id found in session metadata!`);
        console.error(`[Stripe Webhook] Session metadata:`, session.metadata);
        return new Response("No order_id in metadata", { status: 400, headers: corsHeaders });
      }

      // Update order in database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .update({
          status: "PAID",
          payment_status: "COMPLETED",
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (orderError) {
        console.error(`[Stripe Webhook] ❌ Error updating order ${orderId}:`, orderError);
        return new Response(`Database error: ${orderError.message}`, { status: 500, headers: corsHeaders });
      }

      console.log(`[Stripe Webhook] ✅ Order ${orderId} updated successfully!`);
      console.log(`[Stripe Webhook] Order status: ${order.status}`);

      // Create order status history entry
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: orderId,
          status: "PAID",
          notes: `Payment confirmed via Stripe. Session: ${session.id}`,
          created_at: new Date().toISOString(),
        });

      if (historyError) {
        console.error(`[Stripe Webhook] ⚠️ Error creating status history:`, historyError);
        // Don't fail the webhook for this, just log
      }

      // Send notification (optional, can be implemented later)
      console.log(`[Stripe Webhook] 📧 Payment confirmation processed for order ${orderId}`);
    }

    // Handle payment intent succeeded (for non-checkout payments)
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log(`[Stripe Webhook] PaymentIntent succeeded: ${paymentIntent.id}`);
      
      // If there's metadata with order_id, update it
      const orderId = paymentIntent.metadata?.order_id;
      if (orderId) {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "PAID",
            payment_status: "COMPLETED",
            stripe_payment_intent_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (error) {
          console.error(`[Stripe Webhook] Error updating order from PaymentIntent:`, error);
        } else {
          console.log(`[Stripe Webhook] ✅ Order ${orderId} updated from PaymentIntent`);
        }
      }
    }

    // Handle failed payments
    if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
      console.log(`[Stripe Webhook] ⚠️ Payment failed or expired: ${event.type}`);
      
      const obj = event.data.object;
      const orderId = obj.metadata?.order_id;
      
      if (orderId) {
        await supabase
          .from("orders")
          .update({
            status: "PAYMENT_FAILED",
            payment_status: "FAILED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
        
        console.log(`[Stripe Webhook] Order ${orderId} marked as failed`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Stripe Webhook] 🚨 Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
