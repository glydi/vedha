-- ──────────────────────────────────────────────────────────
--  Vedha Database Initialization Script
--  Run this once to bootstrap the PostgreSQL database.
--  JPA ddl-auto=update will handle table creation from entities,
--  but this script ensures the database exists and extensions
--  are enabled.
-- ──────────────────────────────────────────────────────────

-- Enable useful extensions
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(255) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    avatar_url  VARCHAR(1024),
    bio         TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Tags ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- ── Code Snippets ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS code_snippet (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(512) NOT NULL,
    description TEXT,
    code        TEXT NOT NULL,
    language    VARCHAR(128),
    is_public   BOOLEAN DEFAULT TRUE,
    status      VARCHAR(32) DEFAULT 'PUBLISHED',
    github_url  VARCHAR(1024),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_id    BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- ── Snippet-Tags Join ───────────────────────────────────
CREATE TABLE IF NOT EXISTS snippet_tags (
    snippet_id BIGINT REFERENCES code_snippet(id) ON DELETE CASCADE,
    tag_id     BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (snippet_id, tag_id)
);

-- ── Snippet Shared Users Join ───────────────────────────
CREATE TABLE IF NOT EXISTS snippet_shared_users (
    snippet_id BIGINT REFERENCES code_snippet(id) ON DELETE CASCADE,
    user_id    BIGINT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (snippet_id, user_id)
);

-- ── Collections ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id    BIGINT REFERENCES users(id) ON DELETE CASCADE,
    parent_id   BIGINT REFERENCES collections(id) ON DELETE SET NULL
);

-- ── Collection-Snippets Join ────────────────────────────
CREATE TABLE IF NOT EXISTS collection_snippets (
    collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
    snippet_id    BIGINT REFERENCES code_snippet(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, snippet_id)
);

-- ── Comments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT NOT NULL,
    line_number INTEGER,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    snippet_id  BIGINT REFERENCES code_snippet(id) ON DELETE CASCADE,
    user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE
);

-- ── Snippet Versions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS snippet_versions (
    id             BIGSERIAL PRIMARY KEY,
    code           TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    snippet_id     BIGINT REFERENCES code_snippet(id) ON DELETE CASCADE
);

-- ── Indexes ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_snippets_owner    ON code_snippet(owner_id);
CREATE INDEX IF NOT EXISTS idx_snippets_language ON code_snippet(language);
CREATE INDEX IF NOT EXISTS idx_snippets_public   ON code_snippet(is_public);
CREATE INDEX IF NOT EXISTS idx_comments_snippet  ON comments(snippet_id);
CREATE INDEX IF NOT EXISTS idx_versions_snippet  ON snippet_versions(snippet_id);
