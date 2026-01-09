import { supabase } from "@/integrations/supabase/client";

export const createPaymentIntent = async (
  amount: number, 
  metadata: any = {}
): Promise<{ clientSecret: string } | null> => {
  try {
    console.log("[Stripe Service] Creating PaymentIntent for amount:", amount);
    
    const payload = { 
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata 
    };

    const { data, error } = await supabase.functions.invoke("create-payment-intent", {
      body: payload,
    });

    if (error) {
      console.error("[Stripe Service] Supabase Function Error:", error);
      throw new Error(error.message || "Unknown error invoking function");
    }

    if (data?.error) {
      console.error("[Stripe Service] Payment Intent Creation Error:", data.error);
      throw new Error(data.error);
    }

    console.log("[Stripe Service] PaymentIntent created successfully");
    return { clientSecret: data.clientSecret };
  } catch (error) {
    console.error("[Stripe Service] Critical Error:", error);
    throw error;
  }
};
