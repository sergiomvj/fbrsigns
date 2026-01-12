import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
  products?: any; // To store the joined product data
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('content');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWishlist(session.user.id);
      } else {
        setWishlist([]);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWishlist(session.user.id);
      } else {
        setWishlist([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchWishlist = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      setWishlist(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.product_id === productId);
  }, [wishlist]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: t('common:auth.loginRequired') || "Login Required",
        description: t('common:auth.loginToWishlist') || "Please login to add items to your wishlist.",
        variant: "destructive",
      });
      return false; // Indicating action failed due to auth
    }

    const exists = isInWishlist(productId);

    try {
      if (exists) {
        // Remove
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setWishlist(prev => prev.filter(item => item.product_id !== productId));
        toast({
          title: t('common:wishlist.removed') || "Removed from Wishlist",
          description: t('common:wishlist.removedDesc') || "Item removed from your wishlist.",
        });
      } else {
        // Add
        const { data, error } = await supabase
          .from('wishlist_items')
          .insert({
            user_id: user.id,
            product_id: productId
          })
          .select()
          .single();

        if (error) throw error;

        // Fetch product details to add to local state immediately if needed, 
        // or just re-fetch wishlist. For performance, let's re-fetch or optimistic update.
        // For now, simpler to fetchWishlist again or just add the ID. 
        // Let's re-fetch to get the product join data properly.
        fetchWishlist(user.id);

        toast({
          title: t('common:wishlist.added') || "Added to Wishlist",
          description: t('common:wishlist.addedDesc') || "Item added to your wishlist.",
        });
      }
      return true;
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    wishlist,
    isLoading,
    isInWishlist,
    toggleWishlist,
    refreshWishlist: () => user && fetchWishlist(user.id)
  };
}
