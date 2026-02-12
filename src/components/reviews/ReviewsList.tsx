import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { ReviewForm } from "./ReviewForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  status: string;
  verified_purchase: boolean;
  user: {
    full_name?: string;
    email?: string;
  };
}

interface ReviewsListProps {
  productId: string;
  allowReview?: boolean;
  orderId?: string;
}

export function ReviewsList({ productId, allowReview = false, orderId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0], // 5, 4, 3, 2, 1 stars
  });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function loadReviews() {
    try {
      setLoading(true);

      // Fetch approved reviews with user data
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .eq("product_id", productId)
        .eq("status", "APPROVED")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reviewsData = (data || []) as Review[];
      setReviews(reviewsData);

      // Calculate stats
      if (reviewsData.length > 0) {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / total;

        const distribution = [5, 4, 3, 2, 1].map(
          (stars) => reviewsData.filter((r) => r.rating === stars).length
        );

        setStats({ average, total, distribution });
      }
    } catch (error) {
      console.error("[ReviewsList] Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-900">
                {stats.average.toFixed(1)}
              </div>
              <StarRating rating={Math.round(stats.average)} size="sm" className="mt-2" />
              <p className="text-sm text-slate-500 mt-1">
                {stats.total} {stats.total === 1 ? "avaliação" : "avaliações"}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 w-full max-w-md space-y-2">
              {[5, 4, 3, 2, 1].map((stars, index) => {
                const count = stats.distribution[index];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-3">{stars}</span>
                    <StarRating rating={stars} size="sm" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review Form */}
      {allowReview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Escrever Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm
              productId={productId}
              orderId={orderId}
              onReviewSubmitted={loadReviews}
            />
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          Avaliações dos Clientes
        </h3>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma avaliação ainda</p>
              {allowReview && (
                <p className="text-sm mt-1">
                  Seja o primeiro a avaliar este produto!
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.user?.full_name?.charAt(0) ||
                        review.user?.email?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {review.user?.full_name ||
                          review.user?.email?.split("@")[0] ||
                          "Usuário"}
                      </span>
                      
                      {review.verified_purchase && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-500/10 text-green-600"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Compra Verificada
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-slate-400">
                        {format(new Date(review.created_at), "dd MMM yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>

                    <p className="text-slate-700 mt-3">{review.comment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
