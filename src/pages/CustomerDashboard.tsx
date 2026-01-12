import React, { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, Package, LogOut, Settings, Heart } from "lucide-react";

import { useWishlist } from "@/hooks/useWishlist";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { wishlist } = useWishlist();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/");
      } else {
        setUser(user);
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8 text-white">My FBRSigns</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Profile</h2>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </GlassCard>

          {/* Orders Card */}
          <GlassCard className="p-6 md:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Orders Column */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
                    <p className="text-sm text-gray-400">Track and manage your orders</p>
                  </div>
                </div>
                
                <div className="text-center py-8 text-gray-400 bg-black/20 rounded-lg">
                  <p>No active orders found.</p>
                  <Button variant="link" className="text-primary mt-2" onClick={() => navigate('/ecommerce')}>
                    Start Shopping
                  </Button>
                </div>
              </div>

              {/* Wishlist Column */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">My Wishlist</h2>
                    <p className="text-sm text-gray-400">Saved items ({wishlist.length})</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {wishlist.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-black/20 rounded-lg">
                      <p>Your wishlist is empty.</p>
                      <Button variant="link" className="text-primary mt-2" onClick={() => navigate('/products')}>
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wishlist.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/wishlist')}>
                          <img 
                            src={item.products?.image_url || "/placeholder.svg"} 
                            alt={item.products?.name} 
                            className="w-12 h-12 rounded object-cover bg-muted"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate text-white">{item.products?.name}</h4>
                            <p className="text-xs text-primary font-medium">
                              ${item.products?.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {wishlist.length > 3 && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-xs text-muted-foreground hover:text-white"
                          onClick={() => navigate('/wishlist')}
                        >
                          View all {wishlist.length} items
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageLayout>
  );
};

export default CustomerDashboard;
