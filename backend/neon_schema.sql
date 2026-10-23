-- AgriGenius Neon PostgreSQL Schema Migration
-- Copy and paste this script directly into Neon Console -> "SQL Editor" -> Click "Run"

-- 1. Ensure users table has all location and profile columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS dob VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS place VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS village VARCHAR(150);

-- 2. Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_code VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    farmer_name VARCHAR(255),
    location VARCHAR(255),
    land_acres DOUBLE PRECISION,
    soil_type VARCHAR(100),
    water_availability VARCHAR(100),
    previous_crop VARCHAR(100),
    previous_yield VARCHAR(100),
    next_season VARCHAR(100),
    budget DOUBLE PRECISION,
    main_objective VARCHAR(100),
    top_crop VARCHAR(100),
    language VARCHAR(20) DEFAULT 'en',
    report_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_code ON reports(report_code);

-- 3. Create chat_histories table
CREATE TABLE IF NOT EXISTS chat_histories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    query TEXT NOT NULL,
    answer TEXT NOT NULL,
    language VARCHAR(20) DEFAULT 'auto',
    confidence VARCHAR(20),
    grounded BOOLEAN DEFAULT TRUE,
    sources_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_histories_user_id ON chat_histories(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_histories_session_id ON chat_histories(session_id);
