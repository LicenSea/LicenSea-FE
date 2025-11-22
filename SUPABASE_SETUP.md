# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입
2. 새 프로젝트 생성
3. Settings > API에서 URL과 anon key 복사

## 2. 데이터베이스 스키마 생성

Supabase 대시보드의 SQL Editor에서 다음 SQL 실행:

```sql
-- Works 테이블
CREATE TABLE works (
  work_id TEXT PRIMARY KEY,
  cap_id TEXT,
  creator TEXT NOT NULL,
  parent_id TEXT REFERENCES works(work_id),
  blob_id TEXT,
  transaction_digest TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata fields
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  category TEXT NOT NULL,

  -- Work fields
  fee BIGINT NOT NULL DEFAULT 0, -- MIST 단위

  -- LicenseOption fields
  license_rule TEXT,
  license_price BIGINT, -- MIST 단위
  royalty_ratio BIGINT DEFAULT 0,

  -- Royalty accumulation (Nested/Cascading 방식)
  royalty_earned BIGINT DEFAULT 0, -- 누적 보상 (MIST 단위)
  royalty_claimed BIGINT DEFAULT 0 -- 인출한 보상 (MIST 단위)
);

-- 인덱스 생성
CREATE INDEX idx_works_creator ON works(creator);
CREATE INDEX idx_works_parent_id ON works(parent_id);
CREATE INDEX idx_works_category ON works(category);
CREATE INDEX idx_works_created_at ON works(created_at DESC);
CREATE INDEX idx_works_royalty_earned ON works(royalty_earned);

-- Lineage 테이블 (부모-자식 관계)
CREATE TABLE lineage (
  child_id TEXT NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (child_id, parent_id)
);

CREATE INDEX idx_lineage_child ON lineage(child_id);
CREATE INDEX idx_lineage_parent ON lineage(parent_id);

-- Royalty 계산용 뷰
CREATE OR REPLACE VIEW work_royalties AS
SELECT
  p.work_id as parent_work_id,
  p.title as parent_title,
  p.creator as parent_creator,
  p.royalty_ratio,
  c.work_id as child_work_id,
  c.title as child_title,
  c.fee as child_fee,
  (c.fee * p.royalty_ratio / 100) as royalty_amount
FROM works p
JOIN lineage l ON p.work_id = l.parent_id
JOIN works c ON l.child_id = c.work_id
WHERE p.royalty_ratio > 0;
```

## 3. 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. RLS (Row Level Security) 설정 (선택적)

공개 읽기, 인증된 쓰기:

```sql
-- Works 테이블
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Works are viewable by everyone"
  ON works FOR SELECT
  USING (true);

CREATE POLICY "Works are insertable by authenticated users"
  ON works FOR INSERT
  WITH CHECK (true);

-- Lineage 테이블
ALTER TABLE lineage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lineage is viewable by everyone"
  ON lineage FOR SELECT
  USING (true);

CREATE POLICY "Lineage is insertable by authenticated users"
  ON lineage FOR INSERT
  WITH CHECK (true);
```
