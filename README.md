# Brand E-com (MVP)
- Next.js 15 (App Router), Tailwind v4
- Cart + Checkout → WhatsApp redirect
- Admin (localStorage): shipping zones
- Quote PDF: /api/quote?orderId=...

## Local
npm i
cp .env.example .env.local
npm run dev

## Env
NEXT_PUBLIC_BRAND_NAME=BrandName
NEXT_PUBLIC_PRIMARY_COLOR=#0EA5E9
NEXT_PUBLIC_WHATSAPP_NUMBER=256700000000

## Deploy
vercel --prod --yes
