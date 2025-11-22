# Next.js 마이그레이션 완료

## 주요 변경사항

### 1. 프로젝트 구조

- Vite → Next.js 15
- `src/pages/` → `src/app/` (App Router)
- React Router → Next.js 라우팅

### 2. 트랜잭션 처리

- **프론트엔드**: 트랜잭션 생성 및 서명 (`useSignTransaction`)
- **서버**: 서명된 트랜잭션 실행 및 Indexer 저장 (`/api/transaction/execute`)

### 3. Indexer (Supabase)

- Work 저장 및 조회
- 부모/자식 관계 관리 (Lineage)
- 정산 계산 (Royalty)

### 4. API Routes

- `/api/works` - Works 조회
- `/api/transaction/execute` - 트랜잭션 실행
- `/api/lineage/[workId]` - 부모/자식 관계 조회
- `/api/royalty/calculate` - 정산 계산

## 완료된 작업

✅ Next.js 프로젝트 초기화
✅ Supabase Indexer 로직 구현
✅ API Routes 생성
✅ Marketplace 페이지 변환
✅ Work 페이지 변환
✅ Upload 페이지 핵심 로직 수정

## 남은 작업

⚠️ **Upload 페이지 UI 완성 필요**

- 기존 `src/pages/Upload.tsx`의 `renderStepContent()` 함수 내용을
- `src/app/upload/page.tsx`에 복사 필요
- 현재 핵심 로직만 구현되어 있음

⚠️ **Dashboard 페이지 변환 필요**

- `src/pages/Dashboard.tsx`를 `src/app/dashboard/page.tsx`로 변환
- `useNavigate` → `useRouter` 변경
- `navigate()` → `router.push()` 변경

⚠️ **의존성 설치 필요**

```bash
npm install
```

⚠️ **환경 변수 설정 필요**
`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

⚠️ **Supabase 스키마 생성 필요**
`SUPABASE_SETUP.md` 참고

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 주의사항

1. **Upload 페이지**: 전체 UI 코드 복사 필요
2. **Dashboard 페이지**: Next.js 라우팅으로 변환 필요
3. **Supabase 설정**: 반드시 스키마 생성 필요
4. **환경 변수**: `.env.local` 파일 필수
