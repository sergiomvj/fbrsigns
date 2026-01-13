import React from "react";
import { Link } from "react-router-dom";
import { 
  Zap, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";

const footerSections = {
  services: [
    { name: "Custom Signage", href: "/services#custom" },
    { name: "Digital Displays", href: "/services#digital" },
    { name: "Vehicle Wraps", href: "/services#vehicle" },
    { name: "Installation", href: "/services#installation" },
  ],
  products: [
    { name: "Banners", href: "/products#banners" },
    { name: "Yard Signs", href: "/products#yard-signs" },
    { name: "Trade Show Displays", href: "/products#trade-show" },
    { name: "LED Signs", href: "/products#led" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Careers", href: "/careers" },
    { name: "News", href: "/news" },
  ],
  support: [
    { name: "Contact", href: "/contact" },
    { name: "FAQs", href: "/faq" },
    { name: "Support", href: "/support" },
    { name: "Privacy Policy", href: "/privacy-policy" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
];

export const GlassFooter = () => {
  const { data: companyInfo } = useCompanyInfo();
  
  return (
    <footer className="relative mt-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      
      <GlassCard className="relative mx-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gradient">
                  {companyInfo?.company_name || "FBRSigns"}
                </span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Transforming your vision into stunning visual communication solutions. 
                Professional signage that makes your brand stand out.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                {companyInfo?.company_phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{companyInfo.company_phone}</span>
                  </div>
                )}
                {companyInfo?.company_email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm">{companyInfo.company_email}</span>
                  </div>
                )}
                {companyInfo?.company_address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{companyInfo.company_address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Services</h3>
              <ul className="space-y-3">
                {footerSections.services.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Products</h3>
              <ul className="space-y-3">
                {footerSections.products.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-3">
                {footerSections.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-glass-neutral/5 border border-glass-neutral/20 hover:bg-gradient-primary hover:shadow-glow transition-all duration-300 group"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-glass-neutral/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 {companyInfo?.company_name || "FBRSigns"}. All rights reserved. <span className="text-xs opacity-50 ml-2">v2026.01.13.12.35</span>
            </p>
            <div className="flex space-x-6">
              <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </GlassCard>
    </footer>
  );
};