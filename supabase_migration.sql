-- Supabase PostgreSQL Migration Script
-- Generated from SQLite database schema

-- Enable UUID extension for Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if exists (for clean migration)
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS weekly_exams CASCADE;
DROP TABLE IF EXISTS exam_history CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS mnemonics CASCADE;
DROP TABLE IF EXISTS keywords CASCADE;
DROP TABLE IF EXISTS topic_versions CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Categories table (self-referencing)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topics table
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topic versions for history tracking
CREATE TABLE topic_versions (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    content TEXT,
    version INTEGER,
    changed_by VARCHAR(100),
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keywords for search
CREATE TABLE keywords (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    keyword VARCHAR(100)
);

-- Mnemonics (암기법)
CREATE TABLE mnemonics (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    mnemonic VARCHAR(100),
    full_text TEXT
);

-- Exam history
CREATE TABLE exam_history (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    exam_round VARCHAR(50),
    question_number VARCHAR(50),
    score FLOAT
);

-- Assignments
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) CHECK (type IN ('목차과제', '셀프테스트')),
    title VARCHAR(200),
    description TEXT,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    user_id VARCHAR(100),
    file_path VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score FLOAT,
    feedback TEXT
);

-- Templates
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weekly exams
CREATE TABLE weekly_exams (
    id SERIAL PRIMARY KEY,
    week_number INTEGER NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam questions
CREATE TABLE exam_questions (
    id SERIAL PRIMARY KEY,
    weekly_exam_id INTEGER REFERENCES weekly_exams(id) ON DELETE CASCADE,
    session INTEGER NOT NULL,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('서론', '본론', '결론', '단답', '약술')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_topics_category ON topics(category);
CREATE INDEX idx_topics_title ON topics(title);
CREATE INDEX idx_topic_versions_topic_id ON topic_versions(topic_id);
CREATE INDEX idx_keywords_topic_id ON keywords(topic_id);
CREATE INDEX idx_keywords_keyword ON keywords(keyword);
CREATE INDEX idx_mnemonics_topic_id ON mnemonics(topic_id);
CREATE INDEX idx_mnemonics_mnemonic ON mnemonics(mnemonic);
CREATE INDEX idx_exam_history_topic_id ON exam_history(topic_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_weekly_exams_category_id ON weekly_exams(category_id);
CREATE INDEX idx_exam_questions_weekly_exam_id ON exam_questions(weekly_exam_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Optional but recommended for Supabase
-- Enable RLS on all tables
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE mnemonics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for authenticated users)
-- You can modify these based on your authentication needs
CREATE POLICY "Enable all for authenticated users" ON topics
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON topic_versions
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON keywords
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON mnemonics
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON exam_history
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON assignments
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON submissions
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON categories
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON templates
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON weekly_exams
    FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON exam_questions
    FOR ALL USING (true);

-- Sample data insertion (from current SQLite data)
-- Categories
INSERT INTO categories (name, description) VALUES
('경영학', '경영 및 관리 관련 토픽'),
('공학', '기술 및 엔지니어링 관련 토픽'),
('컴퓨터공학', '소프트웨어 및 컴퓨터 과학'),
('데이터베이스', '데이터베이스 관리 및 설계'),
('네트워크', '네트워크 및 통신'),
('보안', '정보보안 및 암호화'),
('인공지능', 'AI 및 머신러닝'),
('소프트웨어공학', '소프트웨어 개발 방법론'),
('프로젝트관리', '프로젝트 관리 및 방법론'),
('기타', '기타 토픽');

-- Templates
INSERT INTO templates (name, description, content, category) VALUES
('기본 답안 템플릿', '정보관리기술사 기본 답안 작성 템플릿',
'# {{제목}}

## I. 서론
### 1. 정의
-

### 2. 배경 및 필요성
-

## II. 본론
### 1. 개념도
```
[개념도/아키텍처]
```

### 2. 구성요소
| 구분 | 내용 | 설명 |
|------|------|------|
| | | |

### 3. 특징
-
-

### 4. 적용사례
-

## III. 결론
### 1. 기대효과
-

### 2. 시사점
- ', '기본');

COMMENT ON TABLE topics IS '토픽 관리 테이블';
COMMENT ON TABLE topic_versions IS '토픽 버전 이력 관리';
COMMENT ON TABLE keywords IS '검색용 키워드';
COMMENT ON TABLE mnemonics IS '암기법 관리';
COMMENT ON TABLE exam_history IS '출제 이력';
COMMENT ON TABLE assignments IS '과제 관리';
COMMENT ON TABLE submissions IS '과제 제출';
COMMENT ON TABLE categories IS '카테고리 관리';
COMMENT ON TABLE templates IS '템플릿 관리';
COMMENT ON TABLE weekly_exams IS '주간 모의고사';
COMMENT ON TABLE exam_questions IS '모의고사 문제';