import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GlassButton } from "@/components/ui/glass-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useCart } from "@/hooks/useCart";
import { LanguageSelector } from "@/components/LanguageSelector";
import { cn } from "@/lib/utils";
import fbrSignsLogo from "@/assets/fbrsigns-logo.png";
import { supabase } from "@/integrations/supabase/client";

interface NavigationItem {
  name: string;
  href: string;
  external?: boolean;
}

const getNavigation = (t: any): NavigationItem[] => [
  { name: t('navigation:menu.home'), href: "/" },
  { name: t('navigation:menu.ecommerce'), href: "/ecommerce" },
  { name: t('navigation:menu.services'), href: "/services" },
  // { name: t('navigation:menu.portfolio'), href: "/portfolio" },
  { name: t('navigation:menu.about'), href: "/about" },
  { name: t('navigation:menu.contact'), href: "/contact" },
  { name: 'FBRSIGNS.shop', href: "https://fbrsigns.quotearea.com/", external: true },
];

interface GlassNavbarProps {
  onCartOpen?: () => void;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({ onCartOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = useCart();
  const [user, setUser] = useState<any>(null);

  const navigation = getNavigation(t);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-card backdrop-blur-glass border-glass-neutral/20 shadow-glass"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={fbrSignsLogo}
              alt="FBRSigns Logo"
              className="h-10 w-auto transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-200 text-foreground/80 hover:text-foreground hover:bg-glass-neutral/5"
                  )}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-glass-neutral/10 text-primary shadow-glass"
                      : "text-foreground/80 hover:text-foreground hover:bg-glass-neutral/5"
                  )}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => {
                if (onCartOpen) {
                  onCartOpen();
                } else {
                  window.location.href = '/ecommerce';
                }
              }}
            >
              <ShoppingCart className="h-5 w-5" />
              {state.itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {state.itemCount > 99 ? '99+' : state.itemCount}
                </Badge>
              )}
            </Button>

            {/* Login Button / Dashboard */}
            {user ? (
              <Link to="/dashboard">
                <GlassButton variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  My FBRSigns
                </GlassButton>
              </Link>
            ) : (
              <LoginDialog>
                <GlassButton variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {t('common:buttons.login')}
                </GlassButton>
              </LoginDialog>
            )}

            <Link to="/quote-request">
              <GlassButton variant="default" size="sm">
                {t('common:buttons.getQuote')}
              </GlassButton>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="relative mr-1"
              onClick={() => {
                if (onCartOpen) {
                  onCartOpen();
                } else {
                  window.location.href = '/ecommerce';
                }
              }}
            >
              <ShoppingCart className="h-6 w-6" />
              {state.itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                >
                  {state.itemCount > 99 ? '99+' : state.itemCount}
                </Badge>
              )}
            </Button>

            <GlassButton
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden glass-card border-t border-glass-neutral/20">
          <div className="px-4 py-6 space-y-4">
            {navigation.map((item) => (
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "block px-4 py-3 rounded-lg font-medium transition-all duration-200 text-foreground/80 hover:text-foreground hover:bg-glass-neutral/10"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "block px-4 py-3 rounded-lg font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-foreground/80 hover:text-foreground hover:bg-glass-neutral/10"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
            <div className="pt-4 space-y-3">
              {/* Mobile Language Selector */}
              <div className="flex justify-center">
                <LanguageSelector />
              </div>

              <Link to="/wishlist" onClick={() => setIsOpen(false)}>
                <GlassButton variant="ghost" className="w-full justify-start px-4">
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist
                </GlassButton>
              </Link>

              {/* Mobile Login / Dashboard */}
              {user ? (
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <GlassButton variant="outline" className="w-full" size="lg">
                    <User className="h-4 w-4 mr-2" />
                    My FBRSigns
                  </GlassButton>
                </Link>
              ) : (
                <LoginDialog>
                  <GlassButton variant="outline" className="w-full" size="lg">
                    <User className="h-4 w-4 mr-2" />
                    {t('common:buttons.login')}
                  </GlassButton>
                </LoginDialog>
              )}

              <Link to="/quote-request" onClick={() => setIsOpen(false)}>
                <GlassButton variant="default" className="w-full" size="lg">
                  {t('common:buttons.getQuote')}
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};