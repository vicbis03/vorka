-- ─────────────────────────────────────────────────────────────────────────────
-- AUTODROP STORE — Schéma Supabase
-- Coller dans SQL Editor → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Produits
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  price        INTEGER NOT NULL,        -- en centimes (ex: 1990 = 19,90€)
  image_url    TEXT,
  type         TEXT NOT NULL CHECK (type IN ('digital', 'physical')),
  download_url TEXT,                    -- pour produits digitaux
  cj_product_id TEXT,                  -- ID CJ Dropshipping pour physiques
  cj_variant_id TEXT,                  -- variante CJ si nécessaire
  stock        INTEGER DEFAULT -1,      -- -1 = illimité
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Commandes
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_name    TEXT,
  shipping_address JSONB,              -- adresse pour les physiques
  total_amount     INTEGER NOT NULL,   -- en centimes
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'error')),
  fulfillment_ref  TEXT,               -- ref CJ ou email ID Resend
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Lignes de commande
CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity   INTEGER DEFAULT 1,
  unit_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index utiles
CREATE INDEX idx_orders_stripe ON orders(stripe_session_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_active ON products(active);

-- ─── Données de test ──────────────────────────────────────────────────────────
INSERT INTO products (name, description, price, type, download_url, stock, image_url)
VALUES (
  'Pack Templates Notion Premium',
  '50 templates Notion pour productivité, gestion de projet et finance personnelle. Accès instantané après achat.',
  1990,
  'digital',
  'https://ton-bucket.com/notion-pack.zip',
  -1,
  'https://images.unsplash.com/photo-1484807352052-23338990c6c6?w=800'
);

INSERT INTO products (name, description, price, type, cj_product_id, stock, image_url)
VALUES (
  'Tapis de bureau XL',
  'Tapis de bureau 90x40cm, imperméable, avec base antidérapante. Livré en 7-14 jours.',
  2490,
  'physical',
  'CJXXXXXXXX',  -- Remplacer par vrai ID CJ
  100,
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800'
);
