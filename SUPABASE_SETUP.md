# 📚 Supabase 연동 가이드

## ✅ 완료된 작업

### 1. 데이터베이스 마이그레이션
- SQLite → PostgreSQL 스키마 변환 완료
- Supabase에 테이블 생성 완료

### 2. 백엔드 설정
- `database_config.py`: 자동으로 Supabase/SQLite 선택
- `database_supabase.py`: Supabase 전용 연결 모듈
- 모든 라우터 파일 업데이트 완료
- `.env` 파일 생성 (비밀번호 입력 필요)

### 3. 프론트엔드 설정
- `.env` 파일 생성 (API 키 입력 필요)

## 🔧 남은 설정

### 1. Supabase 대시보드에서 정보 가져오기

1. **Database Password** (백엔드용)
   - Supabase Dashboard → Settings → Database
   - "Database password" 확인

2. **Anon Key** (프론트엔드용)
   - Supabase Dashboard → Settings → API
   - "anon public" 키 복사

### 2. 환경변수 설정

#### 백엔드 (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres.bxfqjnokvzdvomuzsupz:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://bxfqjnokvzdvomuzsupz.supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

#### 프론트엔드 (`frontend/.env`)
```env
REACT_APP_SUPABASE_URL=https://bxfqjnokvzdvomuzsupz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
REACT_APP_API_URL=http://localhost:8000
```

### 3. 패키지 설치

#### 백엔드
```bash
cd backend
pip install -r requirements.txt
```

#### 프론트엔드 (선택사항 - 직접 Supabase 사용시)
```bash
cd frontend
npm install @supabase/supabase-js
```

### 4. 연결 테스트

```bash
cd backend
python test_supabase.py
```

성공 메시지가 나오면 연결 완료!

### 5. 서버 실행

```bash
# 백엔드
cd backend
uvicorn main:app --reload

# 프론트엔드
cd frontend
npm start
```

## 📝 주요 변경사항

### 백엔드
- SQLite → PostgreSQL (Supabase)
- 자동 전환 가능 (환경변수 유무에 따라)
- Connection pooling 사용

### 데이터베이스
- AUTO_INCREMENT → SERIAL
- DATETIME → TIMESTAMP
- Row Level Security (RLS) 적용
- 트리거로 updated_at 자동 업데이트

## 🚨 주의사항

1. **비밀번호 보안**: `.env` 파일은 절대 Git에 커밋하지 마세요
2. **RLS 정책**: 현재는 모든 접근 허용. 프로덕션에서는 수정 필요
3. **Connection Pooling**: Supabase 무료 플랜은 동시 연결 제한 있음

## 💡 트러블슈팅

### 연결 실패시
1. 비밀번호가 정확한지 확인
2. IP 제한이 있는지 확인 (Supabase Dashboard → Settings → Database)
3. Connection pooler 사용 중인지 확인

### 타입 에러시
- PostgreSQL과 SQLite의 데이터 타입 차이 확인
- SERIAL vs INTEGER PRIMARY KEY
- TIMESTAMP vs DATETIME