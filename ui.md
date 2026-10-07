# UI 가이드

앱 이름: **AI 뉴스 수집기**
스택: Next.js App Router + Tailwind CSS v4 (`src/app/globals.css`의 `@theme inline` 토큰 사용)

방향은 **깔끔하고 읽기 편한 스타일**이다. 흰 배경, 넉넉한 여백, 얇은 테두리, 절제된 색(포인트 컬러 1개)을 쓴다. 장식(그라디언트, 큰 그림자)은 쓰지 않는다.

---

## 1. 디자인 토큰

`globals.css`의 `:root`에 CSS 변수를 정의하고 `@theme inline`으로 Tailwind 색에 연결한다. 컴포넌트에서는 임의 hex 대신 아래 토큰(또는 Tailwind 기본 `slate`, `indigo` 팔레트)을 쓴다.

| 용도 | 라이트 | 다크 | Tailwind 클래스 |
|---|---|---|---|
| 페이지 배경 | `#f8fafc` | `#0b0f17` | `bg-slate-50 dark:bg-[#0b0f17]` |
| 카드/헤더 표면 | `#ffffff` | `#111827` | `bg-white dark:bg-gray-900` |
| 테두리 | `slate-200` | `gray-800` | `border-slate-200 dark:border-gray-800` |
| 본문 텍스트 | `slate-900` | `slate-100` | `text-slate-900 dark:text-slate-100` |
| 보조 텍스트 | `slate-500` | `slate-400` | `text-slate-500 dark:text-slate-400` |
| 포인트(Primary) | `indigo-600` | `indigo-400` | `bg-indigo-600 hover:bg-indigo-700` |
| 선택된 칩 | `indigo-600` 배경 + 흰 글자 | 동일 | — |

- 다크 모드는 `prefers-color-scheme`를 따른다(현재 `globals.css`와 동일).
- 모서리: 카드 `rounded-xl`, 버튼·칩 `rounded-lg` / `rounded-full`.
- 그림자: 카드는 기본 `shadow-sm`, hover 시 `shadow-md`까지만.

### 폰트

- 한글 가독성을 위해 본문은 시스템 한글 폰트 스택을 쓴다: `font-sans`에 `Pretendard`가 없으면 `"Apple SD Gothic Neo", "Malgun Gothic", sans-serif`로 폴백.
- 현재 `globals.css`의 `body { font-family: Arial... }`는 `var(--font-sans)`를 쓰도록 바꾼다.
- 본문 `text-[15px] leading-relaxed`, 한국어 줄바꿈은 `break-keep`.

| 요소 | 클래스 |
|---|---|
| 앱 이름 | `text-lg font-bold tracking-tight` |
| 카드 제목 | `text-base font-semibold leading-snug` |
| 카드 요약 | `text-sm leading-relaxed text-slate-600` |
| 메타(출처·날짜) | `text-xs text-slate-500` |

---

## 2. 전체 레이아웃

```
┌──────────────────────────────────────────────┐
│ Header   AI 뉴스 수집기      [뉴스 가져오기] [저장한 뉴스] [UserButton] │
├──────────────────────────────────────────────┤
│ Category bar  [전체] [LLM] [로봇] [규제] ... [+ 카테고리 추가]         │
├──────────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐                          │
│ │카드│ │카드│ │카드│   (반응형 그리드)          │
│ └────┘ └────┘ └────┘                          │
└──────────────────────────────────────────────┘
```

- 페이지 컨테이너: `mx-auto w-full max-w-6xl px-4 sm:px-6`
- 헤더와 카테고리 바는 스크롤 시 상단 고정: `sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200`
- 본문 영역 상하 여백: `py-6 sm:py-8`

---

## 3. 헤더

```tsx
<header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
  <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
    <h1 className="text-lg font-bold tracking-tight">AI 뉴스 수집기</h1>
    <nav className="flex items-center gap-2">
      <button className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
        뉴스 가져오기
      </button>
      {/* 저장한 뉴스 링크, Clerk <UserButton /> */}
    </nav>
  </div>
</header>
```

- Primary 버튼은 화면에 하나(`뉴스 가져오기`)만 둔다. 나머지는 secondary(테두리형) 스타일.
- 가져오는 중에는 버튼을 `disabled:opacity-50`으로 두고 라벨을 "가져오는 중…"으로 바꾼다.

---

## 4. 카테고리 바 (카드 목록 위)

가로로 나열한 칩 끝에 **카테고리 추가 버튼**을 둔다. 칩이 많아지면 줄바꿈 대신 가로 스크롤한다(모바일에서 한 줄 유지).

```tsx
<div className="border-b border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
  <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
    {/* 선택됨 */}
    <button className="shrink-0 rounded-full bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white">
      전체
    </button>
    {/* 기본 */}
    <button className="shrink-0 rounded-full border border-slate-200 px-3.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:border-gray-700 dark:text-slate-300 dark:hover:bg-gray-800">
      LLM
    </button>
    {/* …카테고리 칩 반복… */}

    {/* 맨 끝: 카테고리 추가 */}
    <button
      aria-label="카테고리 추가"
      className="shrink-0 inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
    >
      <span aria-hidden>+</span> 카테고리 추가
    </button>
  </div>
</div>
```

- 항상 첫 칩은 **전체**, 마지막은 **+ 카테고리 추가**(점선 테두리로 일반 칩과 구분).
- **미분류**(카테고리 삭제된 뉴스)는 카테고리 칩들 맨 뒤, 추가 버튼 앞에 둔다.
- 칩 순서는 사용자 카테고리 목록 순서를 따른다.
- 추가 버튼을 누르면 이름 입력 모달(`<dialog>`)이 열린다(Enter 추가 / Esc 취소, 중복·빈 이름은 모달 안에 오류 표시).
- 이름 변경·삭제는 칩 hover 시 나타나는 작은 메뉴(`⋯`)나 별도 관리 화면에서 처리한다.
- 선택된 칩에는 `aria-pressed="true"`를 준다.

---

## 5. 뉴스 카드 목록

그리드는 화면 크기에 맞춰 열 수를 바꾼다.

```tsx
<ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
```

### 카드

```tsx
<li className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
  <div className="mb-3 flex items-center justify-between gap-2">
    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
      LLM
    </span>
    <span className="text-xs text-slate-500">TechCrunch · 2026.10.07</span>
  </div>

  <h2 className="break-keep text-base font-semibold leading-snug">한국어 제목</h2>
  <p className="mt-2 line-clamp-4 break-keep text-sm leading-relaxed text-slate-600 dark:text-slate-400">
    한국어 요약
  </p>

  <div className="mt-auto flex gap-2 pt-4">
    {/* 버튼 3개 */}
  </div>
</li>
```

표시 항목: **카테고리 뱃지 · 출처 · 날짜 · 한국어 제목 · 한국어 요약 · 버튼 3개**. 영어 원제목은 카드에 노출하지 않는다.

- 제목은 최대 2줄(`line-clamp-2`), 요약은 최대 4줄(`line-clamp-4`)로 잘라 카드 높이를 비슷하게 맞춘다.
- 버튼 영역은 `mt-auto`로 카드 하단에 고정한다.
- 카테고리 뱃지가 없는 경우(미분류)는 `bg-slate-100 text-slate-600`의 "미분류" 뱃지를 쓴다.

### 카드 버튼 3개

| 버튼 | 스타일 | 상태 |
|---|---|---|
| 저장하기 | Primary: `bg-indigo-600 text-white hover:bg-indigo-700` | 저장 후 "저장됨" + `disabled`, `bg-slate-100 text-slate-500` |
| Notion 저장 | Secondary: `border border-slate-200 hover:bg-slate-50` | **저장하기 전에는 `disabled:opacity-40 disabled:cursor-not-allowed`** |
| 원문보기 | Secondary 링크 | `<a target="_blank" rel="noopener noreferrer">`로 새 탭 |

공통: `flex-1 rounded-lg px-3 py-2 text-sm font-medium transition`. 키보드 포커스는 `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`.

---

## 6. 상태별 화면

- **빈 상태**(가져오기 전): 중앙 정렬 안내문 + Primary 버튼.
  `flex flex-col items-center gap-3 py-24 text-center text-slate-500` / "아직 가져온 뉴스가 없어요. 뉴스를 가져와 보세요."
- **로딩**: 카드 모양 스켈레톤 6개(`animate-pulse`, `bg-slate-200 rounded` 막대 3줄). 스피너만 띄우지 않는다.
- **오류**: 목록 위에 `rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700` 배너 + "다시 시도" 버튼.
- **필터 결과 없음**: "이 카테고리에는 뉴스가 없어요."

---

## 7. 반응형·접근성

- 기준 브레이크포인트: 모바일 기본 1열 → `md`(768px) 2열 → `lg`(1024px) 3열.
- 모바일에서 헤더 버튼은 아이콘+짧은 라벨로 줄이고, 카테고리 바는 가로 스크롤.
- 터치 대상은 최소 높이 36px 이상(`py-1.5`~`py-2` 유지).
- 색만으로 상태를 전달하지 않는다(선택된 칩은 색 + `aria-pressed`, 저장됨은 색 + 텍스트).
- 대비: 본문은 `slate-900/slate-600`, 최소 `slate-500`까지만 사용한다(그보다 연한 텍스트 금지).
- 아이콘 단독 버튼에는 `aria-label`을 붙인다.

---

## 8. 구현 시 컴포넌트 구분 (제안)

| 컴포넌트 | 역할 |
|---|---|
| `AppHeader` | 앱 이름, 가져오기 버튼, 사용자 메뉴 |
| `CategoryBar` | 전체/카테고리 칩 + 추가 버튼 + 추가 모달 |
| `NewsCard` | 카드 1개, 버튼 3개 |
| `NewsGrid` | 그리드, 빈/로딩/오류 상태 |

Tailwind 클래스가 반복되면 `Button`, `Chip` 같은 작은 컴포넌트로 묶는다. 이 문서의 클래스 조합을 기준으로 삼고, 새 패턴이 필요하면 이 문서를 먼저 갱신한다.
