-- ============================================================
-- Package-Am Database Schema  (idempotent — safe to re-run)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255)        NOT NULL,
  email            VARCHAR(255) UNIQUE NOT NULL,
  password_hash    VARCHAR(255)        NOT NULL,
  cashback_balance INTEGER             NOT NULL DEFAULT 500,
  role             VARCHAR(20)         NOT NULL DEFAULT 'customer'
                     CHECK (role IN ('customer','vendor','admin')),
  created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ── Vendors ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id              SERIAL PRIMARY KEY,
  owner_user_id   UUID         REFERENCES users(id) ON DELETE SET NULL,
  name            VARCHAR(255) NOT NULL,
  emoji           VARCHAR(10)  NOT NULL DEFAULT '🍽️',
  tagline         VARCHAR(255),
  description     TEXT,
  address         VARCHAR(500),
  city            VARCHAR(100),
  state           VARCHAR(100),
  rating          DECIMAL(3,1) NOT NULL DEFAULT 0,
  review_count    INTEGER      NOT NULL DEFAULT 0,
  delivery_time   VARCHAR(50),
  min_order       INTEGER      NOT NULL DEFAULT 0,
  categories      TEXT[]       NOT NULL DEFAULT '{}',
  is_open         BOOLEAN      NOT NULL DEFAULT TRUE,
  badge           VARCHAR(100),
  phone           VARCHAR(20),
  instagram       VARCHAR(100),
  tiktok          VARCHAR(100),
  status          VARCHAR(20)  NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  applied_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Menu items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id           SERIAL PRIMARY KEY,
  vendor_id    INTEGER      REFERENCES vendors(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  category     VARCHAR(50)  NOT NULL,
  price        INTEGER      NOT NULL,
  rating       DECIMAL(3,1) NOT NULL DEFAULT 0,
  prep_time    VARCHAR(50),
  image        VARCHAR(500),
  badge        VARCHAR(100),
  is_available BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status            VARCHAR(20)  NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','preparing','ready','delivered','cancelled')),
  order_for         VARCHAR(10)  NOT NULL DEFAULT 'myself'
                      CHECK (order_for IN ('myself','friend')),
  recipient_name    VARCHAR(255) NOT NULL,
  recipient_phone   VARCHAR(20)  NOT NULL,
  recipient_state   VARCHAR(100) NOT NULL,
  recipient_address TEXT         NOT NULL,
  subtotal          INTEGER      NOT NULL,
  delivery_fee      INTEGER      NOT NULL DEFAULT 1500,
  total             INTEGER      NOT NULL,
  cashback_earned   INTEGER      NOT NULL DEFAULT 0,
  placed_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Order items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER      REFERENCES menu_items(id) ON DELETE SET NULL,
  vendor_id    INTEGER      REFERENCES vendors(id)    ON DELETE SET NULL,
  name         VARCHAR(255) NOT NULL,
  price        INTEGER      NOT NULL,
  quantity     INTEGER      NOT NULL CHECK (quantity > 0),
  image        VARCHAR(500)
);

-- ── Cashback transactions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS cashback_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      INTEGER     NOT NULL,
  type        VARCHAR(10) NOT NULL CHECK (type IN ('earned','redeemed')),
  description VARCHAR(255),
  order_id    UUID        REFERENCES orders(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_menu_items_vendor   ON menu_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_orders_user         ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor  ON order_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_cashback_user       ON cashback_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status      ON vendors(status);

-- ── Seed: Gineer Tasty Grills (pre-approved) ─────────────────
INSERT INTO vendors (name, emoji, tagline, description, address, city, state,
                     rating, review_count, delivery_time, min_order, categories,
                     is_open, badge, phone, instagram, tiktok, status)
VALUES (
  'Gineer Tasty Grills','🍕','Tickle Your Taste Bud',
  'Enugu''s home of authentic pizza, shawarma, burgers, grills and refreshing drinks.',
  'Amazon Extension, Rangers Avenue, Beside Ignition Lounge',
  'Enugu','Enugu',4.9,243,'20–40 min',3000,
  ARRAY['Pizza','Shawarma','Burgers','Drinks','Desserts'],
  true,'🔥 Popular','08064129532','@gineertasty','gineer.tasty.grill','approved'
) ON CONFLICT DO NOTHING;

-- ── Seed: Gineer menu items ──────────────────────────────────
INSERT INTO menu_items (vendor_id,name,category,price,rating,prep_time,image,badge) VALUES
  (1,'Gineer Special Mix Pizza (Medium)','pizza',14000,5.0,'30–40 min','/gineer/pizzza.jpg','⭐ All Protein'),
  (1,'Beef Pizza (Medium)','pizza',12000,4.8,'30–40 min','/gineer/pizza-with-pack.jpg','🔥 Bestseller'),
  (1,'Chicken Pizza (Medium)','pizza',10000,4.7,'30–40 min','/gineer/pizzzapack.jpg',NULL),
  (1,'Chicken & Beef Mix Pizza (Medium)','pizza',13000,4.8,'30–40 min','/gineer/plenty-pizza.jpg','💛 Fan Fav'),
  (1,'Turkey Pizza (Medium)','pizza',13000,4.7,'30–40 min','/gineer/photo_10_2026-06-06_03-51-32.jpg',NULL),
  (1,'Suya Mix Pizza (Large)','pizza',16000,4.9,'30–40 min','/gineer/pizzza.jpg','🔥 Spicy Hit'),
  (1,'Chicken Shawarma (King Size)','shawarma',5000,4.8,'15–25 min','/gineer/sharwama.jpg','🔥 Bestseller'),
  (1,'Turkey Shawarma (King Size)','shawarma',7000,4.9,'15–25 min','/gineer/sharwama.jpg','⭐ Top Rated'),
  (1,'Mixed Shawarma — Chicken & Beef (King)','shawarma',6000,4.7,'15–25 min','/gineer/parfait-and-sharwama.jpg',NULL),
  (1,'Suya Mix Shawarma (King Size)','shawarma',7000,4.8,'15–25 min','/gineer/sharwama.jpg','🔥 Spicy'),
  (1,'Gineer Zero Veggies Shawarma','shawarma',8000,4.9,'15–25 min','/gineer/sharwama.jpg','🆕 Special'),
  (1,'Gineer All Combo Shawarma','shawarma',12000,5.0,'20–30 min','/gineer/parfait-and-sharwama.jpg','👑 Ultimate'),
  (1,'Beef Burger (Single Patty)','fast-food',4500,4.6,'20–30 min','/gineer/Burger.jpg',NULL),
  (1,'Chicken Burger','fast-food',7000,4.7,'20–30 min','/gineer/photo_4_2026-06-06_03-51-32.jpg','💛 Fan Fav'),
  (1,'Burger Combo (Burger, Sausage & Chips)','fast-food',10000,4.8,'25–35 min','/gineer/burger-chips.jpg','🔥 Best Value'),
  (1,'Loaded Fries','snacks',7000,4.7,'15–20 min','/gineer/sweet.jpg',NULL),
  (1,'Vanilla Milkshake','drinks',4000,4.6,'10–15 min','/gineer/yorgut.jpg',NULL),
  (1,'Mixed Oreo Milkshake','drinks',5000,4.8,'10–15 min','/gineer/yorgut.jpg','⭐ Top Pick'),
  (1,'Fruit Parfait (12oz)','snacks',5000,4.8,'10–15 min','/gineer/parfait.jpg','🆕 New'),
  (1,'Zobo Drink (50cl)','drinks',1000,4.5,'5–10 min','/gineer/photo_7_2026-06-06_03-51-32.jpg','🥤 Refreshing')
ON CONFLICT DO NOTHING;
