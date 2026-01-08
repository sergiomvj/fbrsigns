import { supabase } from "@/integrations/supabase/client";

export const getStripePublishableKey = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("integrations")
      .select("config")
      .eq("provider", "stripe")
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching Stripe key:", error);
      return null;
    }

    const config = data?.config as { publishable_key: string } | null;
    return config?.publishable_key || null;
  } catch (error) {
    console.error("Error in getStripePublishableKey:", error);
    return null;
  }
};

export const createPaymentIntent = async (
  amount: number, 
  metadata: any = {}
): Promise<{ clientSecret: string } | null> => {
  try {
    const { data, error } = await supabase.functions.invoke("create-payment-intent", {
      body: { 
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata 
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return { clientSecret: data.clientSecret };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};
