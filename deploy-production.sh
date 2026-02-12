#!/bin/bash
# deploy-fbrsigns-production.sh - Deploy completo do FBRSigns

echo "╔════════════════════════════════════════════════════════╗"
echo "║     🚀 DEPLOY FBRSIGNS - PRODUÇÃO                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="/data/workspace/repos/fbrsigns"
PROJECT_REF="sssmxxigyipnqcaxpsfx"

cd $PROJECT_DIR

echo "📁 Diretório: $PROJECT_DIR"
echo "🆔 Project Ref: $PROJECT_REF"
echo ""

# ============================================
# PASSO 1: DEPLOY DAS EDGE FUNCTIONS
# ============================================
echo "═══════════════════════════════════════════════════════════"
echo "⚡ PASSO 1: Deploy das Edge Functions"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Verificar se está logado no Supabase
echo "🔑 Verificando login no Supabase..."
supabase projects list > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Não está logado no Supabase CLI"
    echo ""
    echo "Execute: supabase login"
    echo "Ou acesse: https://supabase.com/dashboard"
    echo ""
fi

# Linkar o projeto
echo "🔗 Linkando projeto..."
supabase link --project-ref $PROJECT_REF

# Deploy das funções
echo ""
echo "📤 Deploy create-checkout-session..."
supabase functions deploy create-checkout-session --project-ref $PROJECT_REF

echo ""
echo "📤 Deploy stripe-webhook..."
supabase functions deploy stripe-webhook --project-ref $PROJECT_REF

# Verificar status
echo ""
echo "✅ Funções deployadas!"
supabase functions list --project-ref $PROJECT_REF

# ============================================
# PASSO 2: BUILD DO FRONTEND
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🏗️  PASSO 2: Build do Frontend"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "📦 Instalando dependências..."
npm ci

echo ""
echo "🔨 Build de produção..."
npm run build

if [ -d "dist" ]; then
    echo "✅ Build completo!"
    echo "📁 Arquivos em: $PROJECT_DIR/dist"
else
    echo "❌ Erro no build!"
    exit 1
fi

# ============================================
# PASSO 3: DEPLOY DO FRONTEND
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🌐 PASSO 3: Deploy do Frontend"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Escolha onde fazer deploy:"
echo ""
echo "1️⃣  VERCEL (recomendado)"
echo "   - Execute: vercel --prod"
echo "   - Ou: npx vercel --prod"
echo ""
echo "2️⃣  NETLIFY"
echo "   - Execute: netlify deploy --prod --dir=dist"
echo ""
echo "3️⃣  SURGE.SH"
echo "   - Execute: npx surge dist/"
echo ""
echo "4️⃣  SERVIDOR PRÓPRIO (EasyPanel/Docker)"
echo "   - Execute: docker-compose up -d --build"
echo "   - Ou: rsync -avz dist/ user@server:/var/www/fbrsigns/"
echo ""

# ============================================
# PASSO 4: VERIFICAÇÃO
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🧪 PASSO 4: Verificação"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "URLs para testar:"
echo ""
echo "🔗 Edge Functions:"
echo "   https://$PROJECT_REF.supabase.co/functions/v1/create-checkout-session"
echo "   https://$PROJECT_REF.supabase.co/functions/v1/stripe-webhook"
echo ""
echo "🔗 Site:"
echo "   (conforme onde fez deploy)"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ DEPLOY CONCLUÍDO!"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "📝 TESTES RECOMENDADOS:"
echo ""
echo "1. Testar checkout:"
echo "   - Acesse o site"
echo "   - Adicione produto ao carrinho"
echo "   - Vá para checkout"
echo "   - Use cartão de teste: 4242 4242 4242 4242"
echo "   - Data: qualquer futura, CVC: qualquer"
echo ""
echo "2. Verificar webhook no Stripe:"
echo "   https://dashboard.stripe.com/webhooks/we_1T08cF7zYjvi46Nknl4L8KEp"
echo "   - Deve mostrar 'Successful' nas entregas"
echo ""
echo "3. Verificar pedido no banco:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/editor"
echo "   - Tabela: orders"
echo "   - Status deve mudar para 'PAID'"
echo ""
