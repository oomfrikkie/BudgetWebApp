-- ============================================================
-- Budget App — Database Init
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255)   NOT NULL,
  email            VARCHAR(255)   NOT NULL UNIQUE,
  password_hash    VARCHAR(255)   NOT NULL DEFAULT '',
  estimated_salary NUMERIC(10,2)  NOT NULL DEFAULT 0,
  hourly_rate      NUMERIC(10,2)  NOT NULL DEFAULT 0,
  hours_per_week   INT            NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         VARCHAR(64)  PRIMARY KEY,
  label      VARCHAR(128) NOT NULL,
  emoji      VARCHAR(16)  NOT NULL,
  color      VARCHAR(32)  NOT NULL
);

-- ------------------------------------------------------------
-- transactions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        transaction_type NOT NULL,
  category_id VARCHAR(64)     REFERENCES categories(id) ON DELETE SET NULL,
  amount      NUMERIC(10,2)   NOT NULL,
  description VARCHAR(500)    NOT NULL DEFAULT '',
  date        DATE            NOT NULL,
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- budgets  (monthly limit per category per user)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
  id          SERIAL       PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id VARCHAR(64)  NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  UNIQUE (user_id, category_id)
);

-- ------------------------------------------------------------
-- income_schedules  (recurring income sources per user)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS income_schedules (
  id            SERIAL        PRIMARY KEY,
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label         VARCHAR(255)  NOT NULL,
  amount        NUMERIC(10,2) NOT NULL,
  day_of_month  INT           NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
  active        BOOLEAN       NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Seed Data
-- ============================================================

INSERT INTO categories (id, label, emoji, color) VALUES
  ('grocery',        'Grocery',        '🛒', '#22c55e'),
  ('insurance',      'Insurance',      '🛡️', '#f59e0b'),
  ('rent',           'Rent',           '🏠', '#ef4444'),
  ('transport',      'Transport',      '🚌', '#3b82f6'),
  ('entertainment',  'Entertainment',  '🎬', '#a855f7'),
  ('subscriptions',  'Subscriptions',  '📱', '#ec4899'),
  ('other',          'Other',          '📦', '#6b7280')
ON CONFLICT (id) DO NOTHING;

-- Demo user — password: admin123
INSERT INTO users (id, name, email, password_hash, estimated_salary, hourly_rate, hours_per_week)
SELECT
  '00000000-0000-0000-0000-000000000001',
  'Alex Johnson',
  'alex@example.com',
  crypt('admin123', gen_salt('bf', 10)),
  2800, 17.5, 40
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'alex@example.com'
);

INSERT INTO income_schedules (user_id, label, amount, day_of_month) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Monthly Salary', 2840, 1),
  ('00000000-0000-0000-0000-000000000001', 'Side Grant',      500, 24)
ON CONFLICT DO NOTHING;

INSERT INTO budgets (user_id, category_id, amount)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'grocery',       300),
  ('00000000-0000-0000-0000-000000000001', 'insurance',     100),
  ('00000000-0000-0000-0000-000000000001', 'rent',          900),
  ('00000000-0000-0000-0000-000000000001', 'transport',     150),
  ('00000000-0000-0000-0000-000000000001', 'entertainment', 200),
  ('00000000-0000-0000-0000-000000000001', 'subscriptions',  60),
  ('00000000-0000-0000-0000-000000000001', 'other',         150)
ON CONFLICT (user_id, category_id) DO NOTHING;

INSERT INTO transactions (user_id, type, category_id, amount, description, date) VALUES
  -- May 2026
  ('00000000-0000-0000-0000-000000000001', 'expense', 'rent',          850,  'Monthly rent',        '2026-05-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'subscriptions',  45,  'Netflix + Spotify',   '2026-05-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'grocery',        62,  'Weekly groceries',    '2026-05-03'),
  ('00000000-0000-0000-0000-000000000001', 'income',  NULL,           2840,  'Monthly salary',      '2026-05-01'),
  -- April 2026
  ('00000000-0000-0000-0000-000000000001', 'income',  NULL,           2840,  'Monthly salary',      '2026-04-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'rent',          850,  'Monthly rent',        '2026-04-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'subscriptions',  45,  'Netflix + Spotify',   '2026-04-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'grocery',       175,  'Groceries',           '2026-04-08'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'transport',      88,  'Monthly transit pass','2026-04-02'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'entertainment',  65,  'Cinema & dinner',     '2026-04-14'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'insurance',      72,  'Health insurance',    '2026-04-05'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'grocery',        92,  'Weekly groceries',    '2026-04-20'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'entertainment',  40,  'Concert tickets',     '2026-04-26'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'other',          35,  'Haircut',             '2026-04-18'),
  -- March 2026
  ('00000000-0000-0000-0000-000000000001', 'income',  NULL,           2840,  'Monthly salary',      '2026-03-01'),
  ('00000000-0000-0000-0000-000000000001', 'income',  NULL,            150,  'Freelance project',   '2026-03-15'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'rent',          850,  'Monthly rent',        '2026-03-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'subscriptions',  45,  'Netflix + Spotify',   '2026-03-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'grocery',       210,  'Groceries',           '2026-03-10'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'transport',      88,  'Monthly transit pass','2026-03-02'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'entertainment', 120,  'Weekend trip',        '2026-03-20'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'insurance',      72,  'Health insurance',    '2026-03-05'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'other',          55,  'Books & supplies',    '2026-03-22'),
  -- February 2026
  ('00000000-0000-0000-0000-000000000001', 'income',  NULL,           2840,  'Monthly salary',      '2026-02-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'rent',          850,  'Monthly rent',        '2026-02-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'subscriptions',  45,  'Netflix + Spotify',   '2026-02-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'grocery',       162,  'Groceries',           '2026-02-12'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'transport',      88,  'Monthly transit pass','2026-02-02'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'entertainment',  80,  'Valentine''s dinner', '2026-02-14'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'insurance',      72,  'Health insurance',    '2026-02-05'),
  -- January 2026
  ('00000000-0000-0000-0000-000000000001', 'income',  NULL,           2840,  'Monthly salary',      '2026-01-01'),
  ('00000000-0000-0000-0000-000000000001', 'income',  NULL,            200,  'Holiday bonus',       '2026-01-05'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'rent',          850,  'Monthly rent',        '2026-01-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'subscriptions',  45,  'Netflix + Spotify',   '2026-01-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'grocery',       195,  'Groceries',           '2026-01-10'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'transport',      88,  'Monthly transit pass','2026-01-02'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'entertainment',  95,  'New Year celebration','2026-01-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'insurance',      72,  'Health insurance',    '2026-01-05'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'other',         120,  'New year clothes',    '2026-01-08'),
  -- December 2025
  ('00000000-0000-0000-0000-000000000001', 'income',  NULL,           2840,  'Monthly salary',      '2025-12-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'rent',          850,  'Monthly rent',        '2025-12-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'subscriptions',  45,  'Netflix + Spotify',   '2025-12-01'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'grocery',       240,  'Holiday groceries',   '2025-12-15'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'entertainment', 180,  'Christmas gifts',     '2025-12-20'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'transport',      88,  'Monthly transit pass','2025-12-02'),
  ('00000000-0000-0000-0000-000000000001', 'expense', 'insurance',      72,  'Health insurance',    '2025-12-05');
