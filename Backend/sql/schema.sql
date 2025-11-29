-- ELSIP Database Schema (PostgreSQL)
CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    region VARCHAR(100) NOT NULL,
    kebele_id VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10),
    skills TEXT[],
    assessment_score INTEGER,
    assessment_completed BOOLEAN DEFAULT FALSE,
    profile_verified BOOLEAN DEFAULT FALSE,
    qr_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    employer_id INTEGER,
    required_skills TEXT[],
    location VARCHAR(100),
    salary_range VARCHAR(100),
    contract_duration VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills_assessment (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES workers(id),
    skill_category VARCHAR(100),
    question_count INTEGER,
    score INTEGER,
    completed_at TIMESTAMP,
    results JSONB
);

CREATE TABLE IF NOT EXISTS job_matches (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES workers(id),
    job_id INTEGER REFERENCES jobs(id),
    match_score NUMERIC(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workers_skills ON workers USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING GIN (required_skills);
CREATE INDEX IF NOT EXISTS idx_workers_qr_token ON workers(qr_token);
