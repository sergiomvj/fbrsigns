# 🔧 CONFIGURAÇÃO DO WEBHOOK STRIPE - FBR SIGNS

## ⚠️ PROBLEMA RESOLVIDO
Os pagamentos não estavam sendo registrados no sistema porque:
1. **Faltava a Edge Function** `stripe-webhook` para processar o webhook da Stripe
2. **O `order_id` não estava sendo passado** corretamente nos metadata

---

## 🚀 PASSOS PARA CONFIGURAR

### 1. Deploy das Edge Functions

```bash
cd /path/to/fbrsigns

# Deploy create-checkout-session
supabase functions deploy create-checkout-session

# Deploy stripe-webhook
supabase functions deploy stripe-webhook
```

### 2. Configurar Variáveis de Ambiente no Supabase

No Dashboard do Supabase, vá em:
**Project Settings** → **Edge Functions** → **Environment Variables**

Adicione:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Configurar Webhook no Dashboard da Stripe

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **"Add endpoint"**
3. Configure:
   - **Endpoint URL**: `https://[PROJECT_REF].supabase.co/functions/v1/stripe-webhook`
   - **Events to listen to**:
     - `checkout.session.completed` ✅ (obrigatório)
     - `payment_intent.succeeded` ✅ (recomendado)
     - `checkout.session.expired` ⚠️ (opcional)
     - `payment_intent.payment_failed` ⚠️ (opcional)

4. Copie o **Signing secret** (começa com `whsec_`)
5. Cole no Supabase como `STRIPE_WEBHOOK_SECRET`

### 4. Testar o Webhook

Use o Stripe CLI para testar localmente:
```bash
stripe login
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

Ou use o botão "Send test webhook" no dashboard da Stripe.

---

## 📋 FLUXO CORRIGIDO

```
1. Cliente faz pedido no fbrsigns
   ↓
2. Sistema cria pedido no banco (status: PENDING)
   ↓
3. Sistema chama create-checkout-session COM order_id
   ↓
4. Stripe redireciona cliente para checkout
   ↓
5. Cliente paga na Stripe
   ↓
6. Stripe envia webhook → stripe-webhook function
   ↓
7. Sistema atualiza pedido para PAID ✅
```

---

## 🔍 DEBUG

### Logs do Webhook
No Supabase Dashboard:
**Edge Functions** → **stripe-webhook** → **Logs**

### Verificar se o order_id está sendo passado
No componente de checkout, verifique:
```typescript
metadata: {
  order_id: orderId,  // ← DEVE estar presente
  ...
}
```

### Testar manualmente
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/stripe-webhook \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## ✅ VERIFICAÇÃO

Após configurar:
1. Faça um pedido de teste
2. Pague com cartão de teste: `4242 4242 4242 4242`
3. Verifique no banco se o pedido mudou para `PAID`
4. Verifique os logs do webhook no Supabase

---

## 🆘 SUPORTE

Se o problema persistir:
1. Verifique os logs do webhook no Supabase
2. Confirme que `STRIPE_WEBHOOK_SECRET` está configurado
3. Verifique se o endpoint da Stripe está ativo
4. Confirme que o `order_id` está sendo passado no checkout

---

**Arquivos criados/modificados:**
- `supabase/functions/stripe-webhook/index.ts` ← NOVO
- `supabase/functions/create-checkout-session/index.ts` ← ATUALIZADO
- `src/components/payments/StripeHostedCheckout.tsx` ← Precisa passar order_id

**Última atualização:** 2026-02-12
**Responsável:** Leon Guavamango 🦁
