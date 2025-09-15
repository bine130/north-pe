# 🏆 ITPE - 강북심화반 관리 시스템

## 📋 프로젝트 개요
정보관리기술사 강북심화반을 위한 종합 관리 시스템입니다.
- **현재 기수**: 3기
- **수강생 수**: 40명
- **주요 기능**: 학습 관리, 주간모의고사, 성적 관리

## 핵심 기능

### 1. 편집 이력 관리
- 토픽별 버전 관리 (Git 방식)
- 변경사항 비교 (diff view)
- 이전 버전 복원 기능
- 수정 날짜/사유 기록

### 2. 전용 에디터
#### 템플릿 기반 작성
- 서론(정의) → 특성 → 구성요소 → 비교 구조 자동생성
- 암기법 생성 도구 (예: "비복변무순복")
- 기술사 답안 형식 템플릿

#### 표/다이어그램 편집
- 드래그&드롭 표 생성
- Mermaid.js 기반 다이어그램 작성
- 시각화 자료 관리

#### 출제정보 관리
- 회차, 문제번호 자동 포맷팅
- 출제 빈도 분석
- 점수 기록

### 3. 토픽 검색 기능
- **토픽명 검색**: 제목 기반 검색
- **키워드 검색**: 태그된 키워드로 검색
- **두음 검색**: 암기법 두음으로 검색 (예: "비복변무순복" → 해당 토픽)
- **통합 검색**: 토픽명, 키워드, 두음 동시 검색
- **필터링**: 카테고리, 출제 빈도, 최근 수정일 기준

### 4. 숙제 관리 기능
#### 목차과제 숙제
- 토픽별 목차 구성 과제 생성
- 답안 구조 작성 연습
- PDF 제출 및 피드백

#### 셀프테스트 숙제
- 실전 문제 출제
- 시간제한 설정 가능
- PDF 답안 제출
- 제출 이력 관리

#### 숙제 관리 기능
- 숙제 생성/배포
- 제출 기한 설정
- 제출 파일(PDF) 관리
- 채점 및 피드백 기능

### 5. 콘텐츠 관리
- 토픽별 계층구조 (대분류 → 중분류 → 소분류)
- 키워드 태깅 시스템
- 연관 토픽 추천
- PDF 내보내기 (시험장 지참용)

## 기술 스택 (오픈소스 기반)

### 프론트엔드
- **Framework**: React + TypeScript (MIT)
- **Editor**: TipTap 또는 Lexical (MIT)
- **State Management**: Zustand (MIT)
- **UI Components**: Ant Design 또는 MUI (MIT)
- **Diagram**: Mermaid.js (MIT)

### 백엔드
- **Framework**: FastAPI (MIT)
- **ORM**: SQLAlchemy (MIT)
- **Database**: PostgreSQL (PostgreSQL License)

### 버전관리 도구
- **diff-match-patch** (Apache 2.0): Google의 diff 라이브러리
- **jsondiffpatch** (MIT): JSON 비교/패치

## 데이터베이스 스키마

```sql
-- 토픽 테이블
topics (id, title, category, created_at, updated_at)

-- 토픽 버전 관리
topic_versions (id, topic_id, content, version, changed_by, change_reason, created_at)

-- 키워드 관리
keywords (id, topic_id, keyword)

-- 두음(암기법) 관리
mnemonics (id, topic_id, mnemonic, full_text)

-- 출제 이력
exam_history (id, topic_id, exam_round, question_number, score)

-- 숙제 관리
assignments (id, type, title, description, due_date, created_at)

-- 숙제 제출
submissions (id, assignment_id, user_id, file_path, submitted_at, score, feedback)
```

## 목표 사용자
- 정보관리기술사 수험생 (학습자)
- 서브노트 작성/관리자

## 해결하고자 하는 문제
- 방대한 학습 내용의 체계적 정리 필요
- 효율적인 복습 시스템 부재
- 버전 관리 없는 서브노트 수정의 어려움
- 기술사 답안 형식에 맞는 작성 도구 부재

## 기대 효과
- 학습 효율성 향상
- 체계적인 지식 관리
- 편집 이력을 통한 안전한 콘텐츠 관리
- 표준화된 답안 형식 제공

## 향후 확장 계획 (차별화 요소)
- AI 답안 평가 기능
- 커뮤니티 공유 서브노트
- 학습 진도 트래킹
- 모의고사 자동 생성

---
*개발 진행 상황과 추가 아이디어를 계속 업데이트합니다.*