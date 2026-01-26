import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StripeHostedCheckoutProps {
    items: Array<{
        name: string;
        amount: number; // in cents
        quantity?: number;
    }>;
    customerEmail?: string;
    metadata?: Record<string, any>;
    buttonText?: string;
    className?: string;
}

export function StripeHostedCheckout({
    items,
    customerEmail,
    metadata = {},
    buttonText = "Pay with Stripe (Secure)",
    className = "w-full"
}: StripeHostedCheckoutProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            console.log("[Hosted Checkout] Initiating session...");

            const { data, error } = await supabase.functions.invoke("create-checkout-session", {
                body: {
                    items,
                    customer_email: customerEmail,
                    success_url: window.location.origin + "/payment-success",
                    cancel_url: window.location.origin + "/payment-cancel",
                    metadata
                },
            });

            if (error) throw error;

            if (data?.url) {
                console.log("[Hosted Checkout] Redirecting to:", data.url);
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned from server.");
            }
        } catch (error: any) {
            console.error("[Hosted Checkout] Error:", error);
            toast({
                title: "Checkout Error",
                description: error.message || "Could not initialize secure payment session.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCheckout}
            disabled={isLoading || items.length === 0}
            className={className}
        >
            {isLoading ? "Redirecting to Stripe..." : buttonText}
        </Button>
    );
}
