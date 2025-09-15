# North PE 설치 가이드

## 사전 준비사항

1. **Node.js** (v16 이상)
2. **Python** (3.8 이상)
3. **PostgreSQL** (포터블 버전 포함됨)

## 설치 순서

### 1. PostgreSQL 초기화 (자동화됨)

PostgreSQL Portable이 포함되어 있어 별도 설치가 필요하지 않습니다.
`start.bat` 실행 시 자동으로 초기화됩니다.

### 2. 백엔드 환경 설정

```bash
cd backend

# 가상환경 생성 (선택사항)
python -m venv venv
venv\Scripts\activate  # Windows

# 패키지 설치
pip install -r requirements.txt

# .env 파일 수정 (필요시)
# DATABASE_URL을 실제 PostgreSQL 연결 정보로 변경
```

### 3. 프론트엔드 환경 설정

```bash
cd frontend

# 패키지 설치
npm install
```

## 실행 방법

### 방법 1: 배치 파일 사용 (Windows)
```bash
start.bat
```

### 방법 2: 수동 실행

#### 백엔드 서버
```bash
cd backend
python -m uvicorn main:app --reload
```

#### 프론트엔드 서버
```bash
cd frontend
npm start
```

## 접속 정보

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

## 주요 기능

1. **토픽 관리**
   - 토픽 생성/수정/삭제
   - 리치 에디터를 통한 콘텐츠 작성
   - 템플릿 기반 답안 구조 생성

2. **검색 기능**
   - 토픽명 검색
   - 키워드 검색
   - 암기법(두음) 검색

3. **버전 관리**
   - 토픽별 수정 이력 관리
   - 변경 사유 기록
   - 이전 버전 조회

4. **키워드 및 암기법**
   - 토픽별 키워드 태깅
   - 암기법 생성 및 관리

## 문제 해결

### PostgreSQL 연결 오류
- PostgreSQL 서비스가 실행 중인지 확인
- .env 파일의 DATABASE_URL 확인
- 방화벽 설정 확인

### 포트 충돌
- 3000, 8000 포트가 이미 사용 중인 경우
- 다른 포트로 변경하여 실행

### 패키지 설치 오류
- Node.js와 Python 버전 확인
- 관리자 권한으로 실행