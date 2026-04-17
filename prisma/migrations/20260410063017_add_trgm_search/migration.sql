-- This is an empty migration.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS users_username_trgm_idx
  ON users USING GIN (username gin_trgm_ops);

CREATE INDEX IF NOT EXISTS users_full_name_trgm_idx
  ON users USING GIN (full_name gin_trgm_ops);