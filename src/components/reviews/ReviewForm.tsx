import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ productId, orderId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, selecione uma avaliação em estrelas",
        variant: "destructive",
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Comentário muito curto",
        description: "Por favor, escreva um comentário com pelo menos 10 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Você precisa estar logado para avaliar");
      }

      // Check if user already reviewed this product
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .single();

      if (existingReview) {
        throw new Error("Você já avaliou este produto");
      }

      // Create review
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        order_id: orderId || null,
        rating,
        comment: comment.trim(),
        status: "APPROVED", // Can be changed to PENDING for moderation
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado por compartilhar sua opinião",
      });

      // Reset form
      setRating(0);
      setComment("");

      // Notify parent
      onReviewSubmitted?.();

    } catch (error: any) {
      console.error("[ReviewForm] Error:", error);
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Sua avaliação
        </label>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          size="lg"
          interactive
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Seu comentário
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte sua experiência com o produto..."
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">
          Mínimo 10 caracteres
        </p>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Avaliação"
        )}
      </Button>
    </form>
  );
}
