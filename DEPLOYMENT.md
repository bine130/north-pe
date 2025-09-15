# 🚀 배포 가이드

## 📋 배포 아키텍처

- **프론트엔드**: Vercel (React)
- **백엔드**: Render (FastAPI + Docker)
- **데이터베이스**: Supabase (PostgreSQL)

## 🔧 백엔드 배포 (Render)

### 1. Render 대시보드 설정

1. **새 Web Service 생성**
   - GitHub 연결: `https://github.com/bine130/north-pe.git`
   - Root Directory: `backend`
   - Environment: `Docker`
   - Branch: `main`

2. **환경변수 설정**
   ```
   DATABASE_URL=postgresql://postgres.bxfqjnokvzdvomuzsupz:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://bxfqjnokvzdvomuzsupz.supabase.co
   SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   PORT=8000
   ```

3. **빌드 설정**
   - Build Command: `docker build -t backend .`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 2. 백엔드 파일 구조
```
backend/
├── Dockerfile              # Docker 컨테이너 설정
├── .dockerignore           # Docker 빌드 제외 파일
├── render-build.sh         # Render 빌드 스크립트
├── requirements.txt        # Python 의존성
├── main.py                # FastAPI 앱
└── ...
```

## 🌐 프론트엔드 배포 (Vercel)

### 1. Vercel 대시보드 설정

1. **새 프로젝트 생성**
   - GitHub 연결: `https://github.com/bine130/north-pe.git`
   - Root Directory: `frontend`
   - Framework Preset: `Create React App`

2. **환경변수 설정**
   ```
   REACT_APP_API_URL=https://[YOUR-RENDER-SERVICE].onrender.com
   ```

3. **빌드 설정**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm ci`

### 2. 프론트엔드 파일 구조
```
frontend/
├── vercel.json             # Vercel 배포 설정
├── package.json            # Node.js 의존성
├── .env                    # 환경변수 (로컬 개발용)
├── .env.example           # 환경변수 예시
└── ...
```

## 📝 배포 순서

### 1단계: 백엔드 배포
1. GitHub에 코드 푸시
2. Render에서 백엔드 서비스 생성
3. 환경변수 설정 (Supabase 정보)
4. 배포 완료 후 API URL 확인

### 2단계: 프론트엔드 배포
1. Vercel에서 프론트엔드 프로젝트 생성
2. 환경변수 설정 (백엔드 API URL)
3. 자동 배포 완료

## 🔍 배포 후 확인사항

### 백엔드 확인
```bash
curl https://[YOUR-RENDER-SERVICE].onrender.com/health
# 응답: {"status":"healthy"}

curl https://[YOUR-RENDER-SERVICE].onrender.com/api/categories/
# 응답: [카테고리 목록]
```

### 프론트엔드 확인
- Vercel URL 접속
- 카테고리 목록 로딩 확인
- API 통신 확인

## 🚨 주의사항

### Render (백엔드)
- **Free 플랜 제한**: 15분 비활성화 후 Sleep
- **Cold Start**: 첫 요청 시 30초 정도 지연 가능
- **환경변수**: 대시보드에서 직접 설정 필요

### Vercel (프론트엔드)
- **환경변수**: `REACT_APP_` 접두사 필수
- **CORS**: 백엔드에서 Vercel 도메인 허용 필요
- **캐싱**: 정적 파일 자동 캐싱

## 🔧 CORS 설정 업데이트

백엔드 배포 후 `main.py`에서 CORS 설정 수정:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4000",  # 로컬 개발
        "https://[YOUR-VERCEL-APP].vercel.app"  # 프로덕션
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 모니터링

### Render
- 대시보드에서 로그 확인
- Health check 엔드포인트 모니터링

### Vercel
- Analytics 탭에서 트래픽 확인
- Functions 탭에서 빌드 로그 확인

## 🔄 업데이트 방법

1. **코드 수정 후 GitHub 푸시**
2. **자동 배포** (Render, Vercel 모두 자동)
3. **배포 상태 확인**

---

배포 완료 후 두 서비스가 정상 통신하는지 확인하세요!