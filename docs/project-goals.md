# Project Goals — fbrsigns (E-commerce Signs)

This document is the **source of truth** for what this project is for.
Use it as the gatekeeper for new work and scope.

## 1) Mission
Deliver a **production-ready e-commerce** for selling signs/plates/services to the US market, with a complete purchase flow, payments, customer area, and strong SEO/performance.

## 2) Goals (must-have)
1. **Product catalog**
   - Browse, filters, product detail pages.

2. **Cart + checkout**
   - Reliable cart operations, checkout UX, wishlist.

3. **Payments fully implemented**
   - Stripe (primary) and/or PayPal.
   - Payment confirmation + webhook processing.

4. **Orders & customer dashboard**
   - Order creation in backend.
   - Customer can view order history and tracking.

5. **Contact/quote flows**
   - Contact and quotation requests operational.

6. **Internationalization**
   - PT/EN/ES planned; translations complete enough for launch.

7. **SEO & performance baseline**
   - Dynamic meta tags, sitemap, schema markup, image optimization.

## 3) Non-goals
- Custom ERP; integrate with existing providers instead.
- Feature creep that delays payments/orders stability.

## 4) Decision rule (“Should we do this?”)
Approve changes if they:
- unblock revenue (payments, orders, fulfillment),
- reduce cart/checkout friction,
- improve reliability/observability of transactions,
- improve SEO that increases qualified traffic.

Defer if they:
- are nice-to-have UI tweaks before payments/orders are solid,
- add complexity without increasing conversion or operational reliability.
