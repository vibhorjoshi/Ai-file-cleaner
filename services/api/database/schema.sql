-- AI File Management System Database Schema
-- Postgres + pgvector for production deployment on Neon

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (seeded test accounts in MVP)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- License keys for desktop app
CREATE TABLE license_keys (
    key UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    revoked BOOLEAN DEFAULT FALSE
);

-- Upload sessions (web) for auditability
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    total_files INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Files catalog (ephemeral for MVP)
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES uploads(id),
    file_name TEXT,
    mime_type TEXT,
    size_bytes BIGINT,
    sha256 TEXT,
    phash TEXT, -- for images
    text_excerpt TEXT, -- for PDF/TXT
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Vector table (pgvector)
CREATE TABLE file_embeddings (
    file_id UUID PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
    kind TEXT CHECK (kind IN ('image','text')),
    embedding vector(768), -- DistilBERT/text
    embedding_img vector(512) -- CLIP/image (nullable)
);

-- Duplicate groups (for UX replay)
CREATE TABLE dedupe_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES uploads(id),
    group_index INT,
    kept_file_id UUID REFERENCES files(id)
);

-- Indexes for vector similarity search
CREATE INDEX ON file_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON file_embeddings USING ivfflat (embedding_img vector_cosine_ops);

-- Additional indexes for performance
CREATE INDEX ON files (sha256);
CREATE INDEX ON files (upload_id);
CREATE INDEX ON files (mime_type);
CREATE INDEX ON license_keys (user_id);
CREATE INDEX ON uploads (user_id);
CREATE INDEX ON dedupe_groups (upload_id);

-- Seed data for MVP testing
INSERT INTO users (email, password_hash) VALUES
    ('admin@aifilecleanup.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LevcLFUvcFkofmee2'), -- password: admin123
    ('demo@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LevcLFUvcFkofmee2'); -- password: demo123