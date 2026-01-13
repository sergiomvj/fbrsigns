import { supabase } from "@/integrations/supabase/client";

export const createPaymentIntent = async (
  amount: number, 
  metadata: any = {}
): Promise<{ clientSecret: string } | null> => {
  console.log("[Stripe Service] Starting createPaymentIntent...");
  console.log("[Stripe Service] Amount:", amount);
  console.log("[Stripe Service] Metadata:", metadata);

  try {
    const payload = { 
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata 
    };

    console.log("[Stripe Service] Invoking Supabase Function 'create-payment-intent'...");
    
    // Using direct fetch to get better error details
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
       console.warn("[Stripe Service] No auth token found. Request might fail if function requires auth.");
    }

    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`;
    console.log("[Stripe Service] Target URL:", functionUrl);

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("[Stripe Service] ❌ Server returned error status:", response.status);
      console.error("[Stripe Service] ❌ Error Body:", responseData);
      throw new Error(responseData.error || `Server returned ${response.status}: ${JSON.stringify(responseData)}`);
    }

    console.log("[Stripe Service] ✅ PaymentIntent created successfully. Client Secret received.");
    return { clientSecret: responseData.clientSecret };

    /* 
    // Legacy invocation - kept for reference
    const { data, error } = await supabase.functions.invoke("create-payment-intent", {
      body: payload,
    });
    */

  } catch (error: any) {
    console.error("[Stripe Service] 🚨 CRITICAL EXCEPTION:", error);
    console.error("[Stripe Service] Stack:", error.stack);
    throw error;
  }
};
