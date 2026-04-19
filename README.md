# AutoDrop Store 🛒

Site e-commerce 100% automatisé — tu vends, le produit s'envoie tout seul.

## Stack

| Service | Usage | Coût |
|--------|-------|------|
| Vercel | Hébergement Next.js | Gratuit |
| Supabase | Base de données | Gratuit |
| Stripe | Paiements | 0€ + 1,5% par vente |
| Resend | Emails automatiques | Gratuit (3000/mois) |
| CJ Dropshipping | Fulfillment physique | Gratuit |

---

## Installation

### 1. Cloner et installer

```bash
git clone <ton-repo>
cd autodrop-store
npm install
```

### 2. Créer les comptes gratuits

- **Supabase** → https://supabase.com → Nouveau projet
- **Stripe** → https://stripe.com → Activer les webhooks
- **Resend** → https://resend.com → Générer une clé API
- **CJ Dropshipping** → https://cjdropshipping.com → API Keys

### 3. Variables d'environnement

Copier `.env.example` → `.env.local` et remplir :

```bash
cp .env.example .env.local
```

### 4. Créer la base de données Supabase

Aller dans **SQL Editor** sur Supabase et coller le contenu de `supabase/schema.sql`.

### 5. Configurer le webhook Stripe

```bash
# En local (test)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# En production : ajouter l'URL dans le dashboard Stripe
# https://ton-domaine.vercel.app/api/webhooks/stripe
# Événements à écouter : checkout.session.completed
```

### 6. Lancer en local

```bash
npm run dev
```

### 7. Déployer sur Vercel

```bash
npx vercel --prod
# Ajouter les variables d'env dans le dashboard Vercel
```

---

## Ajouter des produits

Dans Supabase → Table Editor → `products` :

| Champ | Exemple |
|-------|---------|
| name | "Pack Templates Notion" |
| description | "50 templates premium" |
| price | 1990 (= 19,90€ en centimes) |
| image_url | URL d'une image |
| type | `digital` ou `physical` |
| download_url | URL fichier (si digital) |
| cj_product_id | ID produit CJ (si physical) |
| stock | -1 = illimité (digital), ou nombre |

---

## Flux automatique

```
Client achète
     ↓
Stripe Checkout
     ↓
Webhook /api/webhooks/stripe
     ↓
Produit digital ?  →  Email avec lien téléchargement (Resend)
Produit physique ? →  Commande auto CJ Dropshipping
     ↓
Commande enregistrée dans Supabase
```
