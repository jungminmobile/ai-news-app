# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@ui.md

## 프로젝트 현황

`PRD.md`가 제품 기준 문서다. 해외 AI 뉴스를 RSS로 가져와 Claude가 한국어로 번역·요약·분류해 카드로 보여주고, 사용자가 '저장하기'로 Neon DB에 보관하거나 'Notion 저장'으로 Notion에 내보내는 웹앱이다. 사용자는 Clerk(Google + 이메일)로 가입·로그인하는 개인 사용자다.

현재는 `create-next-app` 기본 템플릿만 있다(Next.js 16 App Router, React 19, TypeScript, Tailwind v4, `src/` 디렉터리, `@/*` → `src/*`). PRD의 나머지 스택(Clerk, Drizzle/Neon, Anthropic SDK, Notion MCP)은 아직 설치되지 않았고, 테스트 러너도 없다.

## 명령어

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드 (타입 체크 포함)
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)

## 범위

- 포함: 로그인, 뉴스 가져오기, 번역·요약·자동 분류, 카드 표시, 카테고리 필터, 카테고리 관리, 저장하기, Notion 저장, 원문보기, 저장한 뉴스 목록
- 제외(만들지 말 것): 자동 주기 수집(스케줄러), 소스 추가/삭제 UI, 모바일 앱, 알림
- 뉴스 소스는 두 개로 고정:
  - TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/`
  - The Verge AI: `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`

## 아키텍처

### 데이터 흐름

RSS 파싱 → URL 중복 제거 → Claude 호출(번역·요약·분류, JSON 출력) → 응답으로 반환해 화면에만 표시 → '저장하기' 시 DB 저장

- **가져오기는 저장하지 않는다.** `POST /api/news/fetch`는 결과만 반환한다. 카드는 '저장하기' 전까지 브라우저 localStorage에만 보관되어 새로고침해도 유지된다.
- 피드당 최신 10개(최대 20개)만 가져온다(비용 관리). 20개를 처리하므로 Claude 호출은 배치/병렬로 한다(타임아웃 방지).
- URL 기준으로 중복을 제거한다. 다시 가져와도 중복 카드가 생기면 안 되고, 이미 저장한 기사는 '저장됨'으로 표시한다.
- 카드 표시 항목: 한국어 제목, 한국어 요약, 출처, 날짜, 카테고리 뱃지. 버튼 3개: 저장하기(같은 기사 재저장 불가) / Notion 저장 / 원문보기(새 탭).

### 카테고리

- 미리 정한 목록 없이 **Claude가 제안**한다. 표기 흔들림을 막기 위해 프롬프트에 사용자의 현재 카테고리 목록을 넘겨 재사용하게 한다.
- 새 카테고리 이름은 '저장하기' 시점에만 `categories`에 추가된다.
- 관리 화면에서 추가/이름 변경/삭제. 이름 변경은 해당 뉴스에 그대로 반영되고 자동 재분류는 없다. 삭제하면 해당 뉴스의 `category_id`가 null('미분류')이 된다.
- 상단 칩/탭 필터는 가져온 카드 화면과 저장한 뉴스 목록 양쪽에 있다.

### Notion 저장

- **'저장하기'로 DB에 저장된 뉴스만 가능**하고, 저장 전 카드에서는 버튼을 비활성화한다.
- 공식 Notion MCP 서버를 사용한다(Next.js 서버가 MCP 클라이언트). 지정한 Notion DB에 제목·요약·카테고리·원문 링크·날짜 행을 추가한다.
- **미정:** Notion MCP는 사용자별 OAuth 인증이 필요한데, 인증 방식과 토큰 저장 방법이 아직 정해지지 않았다. 임의로 정하지 말고 확인할 것.

### 인증·보안

- 모든 페이지와 API는 로그인 후에만 사용 가능하다. 미로그인 접근은 로그인 화면으로 이동시킨다.
- 모든 API는 로그인 사용자 기준으로 `user_id`를 검증하고, 모든 쿼리를 `user_id`로 제한한다.
- 비밀 키(`ANTHROPIC_API_KEY`, Clerk 키, `DATABASE_URL`)는 `.env.local`에 두고 저장소에 올리지 않는다.

### DB 스키마 (초안, Drizzle)

- `articles`: id, user_id, url, source, title_en, title_ko, summary_ko, category_id(nullable = 미분류), published_at, saved_at — `unique(user_id, url)`
- `categories`: id, user_id, name — `unique(user_id, name)`
- `notion_saves`: id, user_id, article_url, notion_page_url, created_at
- `user_settings`: user_id, Notion 대상 DB ID 등

### API (초안)

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/news/fetch` | RSS 수집 + Claude 처리, 결과 반환(저장 안 함) |
| POST | `/api/articles` | 카드 데이터를 DB에 저장 |
| GET | `/api/articles` | 저장한 뉴스 목록(카테고리 필터) |
| GET/POST/PATCH/DELETE | `/api/categories` | 카테고리 조회/추가/수정/삭제 |
| POST | `/api/notion/save` | Notion DB에 행 추가(MCP 호출) |

## 수락 기준 (PRD 10절 요약)

- 로그인 없이 접근하면 차단된다.
- 가져오기 후 카드가 표시되지만 DB에는 저장되지 않고, 새로고침해도 유지되며, 다시 눌러도 중복 카드가 없다.
- 저장하기 → DB 저장, 같은 기사는 '저장됨'으로 표시되고 재저장되지 않는다.
- 카테고리 추가/수정/삭제·필터가 동작하고, 삭제 시 뉴스는 '미분류'로 이동한다.
- 원문보기는 새 탭, Notion 저장은 지정한 Notion DB에 행을 생성한다.
