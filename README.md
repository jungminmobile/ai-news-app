# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 가져와 Claude가 한국어로 번역·요약·분류하고, 카드로 보여주는 웹앱입니다. 마음에 드는 뉴스는 '뉴스 저장' 버튼으로 Notion 데이터베이스에 내보낼 수 있습니다.

## 주요 기능

- Clerk 로그인(Google + 이메일). 모든 페이지와 API는 로그인 후에만 사용할 수 있습니다.
- 뉴스 가져오기: TechCrunch AI, The Verge AI 피드에서 최신 기사를 가져오고 URL 기준으로 중복을 제거합니다.
- Claude로 한국어 제목·요약 생성과 카테고리 자동 분류. 기존 카테고리 목록을 넘겨 표기가 흔들리지 않게 합니다.
- 카드 목록, 카테고리 필터, 카테고리 추가, 페이지네이션(페이지당 9개)
- Notion 저장: 카드의 '뉴스 저장' 버튼을 누르면 Notion DB에 행을 추가하고, 끝나면 '저장됨'으로 바뀝니다.
- 원문보기(새 탭)

## 기술 스택

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Clerk · Neon(Postgres) + Drizzle ORM · Anthropic SDK · Notion API

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다. 이 파일은 저장소에 올라가지 않습니다.

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon (Drizzle)
DATABASE_URL=

# Anthropic
ANTHROPIC_API_KEY=

# Notion
NOTION_TOKEN=
NOTION_DATABASE_ID=
```

### 3. Notion 데이터베이스 준비

Notion에서 통합(integration)을 만들어 토큰을 `NOTION_TOKEN`에 넣고, 저장할 데이터베이스를 그 통합에 연결(공유)합니다. 데이터베이스에는 아래 속성이 있어야 합니다.

| 속성 | 타입 |
|---|---|
| 제목 | 제목(title) |
| 원문 링크 | URL |
| 날짜 | 날짜 |
| 텍스트 | 텍스트(rich text) — 한국어 요약 |
| 카테고리 | 선택(select) |

`NOTION_DATABASE_ID`에는 데이터베이스 URL의 32자리 ID를 넣습니다.

### 4. 데이터베이스 마이그레이션

```bash
npm run db:migrate
```

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다.

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드(타입 체크 포함) |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint |
| `npm run db:generate` | 스키마 변경으로 마이그레이션 생성 |
| `npm run db:migrate` | 마이그레이션 적용 |
| `npm run db:seed -- <clerk_user_id>` | 예시 기사 추가(`--clean`으로 삭제) |

## 프로젝트 구조

```
src/
├─ app/
│  ├─ dashboard/          뉴스 카드 목록 페이지
│  └─ api/
│     ├─ news/fetch/      RSS 수집 + Claude 처리
│     ├─ categories/      카테고리 API
│     └─ notion/save/     Notion 저장
├─ components/            헤더, 카테고리 바, 뉴스 카드, 버튼 등
├─ db/                    Drizzle 스키마와 연결
├─ lib/                   rss.ts(피드 파싱), claude.ts(번역·요약·분류)
└─ proxy.ts               Clerk 인증 미들웨어
```

## 참고 문서

- [PRD.md](PRD.md) — 제품 요구사항
- [ui.md](ui.md) — UI 가이드

## 사용한 플러그인

- Frontend Design: UI 디자인 품질 향상
- commit-commands: 깃 워크플로 자동화
