# 포스트 상세 페이지 레이아웃 리디자인 (longcat.chat 블로그 참고)

날짜: 2026-07-02
상태: 승인 대기

## 목표

`longcat.chat/blog/longcat-2.0/` 포스트 페이지의 레이아웃 스타일(좌측 스티키 목차,
중앙정렬 히어로, 좁은 읽기 폭)을 이 블로그의 포스트 상세 페이지에 적용한다.
nav(`Header.astro`)와 전역 색상 토큰, 폰트, 코드블록 하이라이팅은 변경하지 않는다.

## 참고 대상(longcat) 시각 특징

- 미니멀 상단 nav (로고 + 우측 언어선택) — 이번 작업 범위 밖, 참고만
- 히어로: 제목/날짜/유틸리티 버튼 모두 중앙 정렬
- 좌측에 얇은 sticky 목차, 계층 들여쓰기, 읽고 있는 섹션은 좌측 accent bar + 굵은 글씨로 자동 강조
- 본문 컬럼은 우측, 좁은 읽기 폭(약 650~750px), 넉넉한 line-height
- 이미지/차트는 둥근 모서리 + 얇은 border 카드
- 화이트 배경, 여백 많음, accent 컬러는 절제되게 사용

## 대상 파일

- `src/layouts/BlogPost.astro` — 구조와 scoped style 전부
- (신규) 스크롤스파이용 인라인 `<script>` 블록 — `BlogPost.astro` 내부에 추가, 별도 컴포넌트 분리는 하지 않음

변경하지 않음: `src/components/Header.astro`, `src/components/Footer.astro`,
`src/styles/global.css`의 색상/폰트 토큰, Shiki 코드블록 설정.

## 레이아웃 구조 변경

현재: `main`이 `minmax(0, 1080px) 280px` 2컬럼 그리드 (본문 좌측, TOC 우측 280px),
`article-head`는 좌측 정렬로 그리드 안(본문 컬럼)에 위치.

변경 후:

- `main` 그리드를 `230px minmax(0, 720px)` 로 바꾸고 순서를 TOC(좌) → 본문(우)으로 스왑.
- `article-head`(커버 이미지 포함)는 그리드 밖으로 빼서 페이지 폭 전체를 쓰는 별도 히어로 블록으로
  분리하고, 내부 콘텐츠는 본문과 동일한 720px 폭으로 중앙 정렬.
- TOC 숨김 breakpoint를 기존 1460px에서 1200px로 낮춘다 (필요 폭이 줄었으므로).

## 히어로(article-head) 변경

- 카테고리 chip, 날짜, `h1`, description, 태그 row를 모두 중앙 정렬(`text-align: center`,
  `chip`/`tag-row`는 `justify-content: center`)로 변경.
- 커버 이미지(`heroImage`)는 히어로 블록 상단에 유지, 폭 720px로 제한.
- 색상/폰트 크기는 기존 값 유지, 정렬만 변경.

## TOC 변경

- 위치를 좌측으로 이동, `position: sticky; top: 88px` 유지, 폭 230px, 계층 들여쓰기(`depth-3`,
  `depth-4`) 유지.
- **스크롤스파이 추가(신규 기능)**: `tocHeadings`에 대응하는 본문 heading들을
  `IntersectionObserver`로 관찰해, 뷰포트 상단 근처에 들어온 heading에 대응하는 TOC 링크에
  `.is-active` 클래스를 토글한다. `.is-active`는 좌측 `border-left: 2px solid var(--accent)`
  + `font-weight: 700` + 진한 텍스트 색, 비활성 링크는 기존 `--muted` 회색 유지.
- 옵저버는 `BlogPost.astro` 하단에 인라인 `<script>`로 작성 (Astro 기본 방식, 별도 프레임워크 불필요).

## 본문 카드 변경

- `.body` 폭을 720px로 축소 (grid 컬럼 자체가 720px로 줄어들므로 `.body`는 `width: 100%`만
  유지하면 됨).
- `blockquote` 강조 스타일 추가: `border-left: 4px solid rgb(var(--accent))`,
  배경 `rgb(var(--surface-strong))`, 좌측 패딩 확보. 기존에는 텍스트 색상만 있었음.
- 이미지에 `border: 1px solid rgb(var(--line))` 추가 (기존 `border-radius`는 전역 CSS에 이미 있음,
  이번 변경은 테두리만 추가).
- 코드블록, 폰트 크기, 링크 색상 등 나머지는 변경하지 않는다.

## 시리즈 네비게이션

- 위치·마크업 변경 없음. 폭이 720px로 좁아진 본문 컬럼에 맞춰 자연스럽게 축소된다.

## 반응형

- 900px 이하 모바일: 기존과 동일하게 단일 컬럼, TOC 숨김. 히어로 중앙정렬은 모바일에서도
  자연스러우므로 별도 분기 불필요.
- 1200px 이하 ~ 900px 초과: TOC 숨김(1200px가 새 breakpoint), 본문만 단일 컬럼으로 표시.

## 변경하지 않는 것 (범위 밖)

- `Header.astro` nav 구조/스타일
- 전역 색상 토큰(`--accent` 등 red 계열 유지, green으로 전환하지 않음)
- 폰트(SUIT/JetBrains Mono), 코드블록 Shiki 테마
- Comments(Giscus), Footer

## 가정 사항 (사용자 응답 타임아웃으로 추천안 채택 — 리뷰 시 확인 필요)

1. **히어로 정렬**: 전체 중앙정렬로 가정 (longcat 스타일에 가장 가까움). 사용자가 "좌측 정렬
   유지"를 원하면 이 섹션만 되돌리면 됨.
2. **TOC 스크롤스파이**: longcat처럼 스크롤 위치에 따라 현재 섹션이 자동으로 강조되는 기능을
   포함하는 것으로 가정. 원치 않으면 `IntersectionObserver` 스크립트만 제거하면 sticky 위치
   이동만 남는다.

## 성공 기준

1. 데스크톱(1280px 이상)에서 포스트 페이지를 열면 좌측에 sticky TOC, 우측에 720px 폭 본문이
   보인다.
2. 스크롤 시 TOC가 계속 같은 위치(sticky)를 유지하고, 현재 읽고 있는 섹션에 해당하는 TOC 링크가
   자동으로 강조(accent bar + bold)된다.
3. 히어로(카테고리/날짜/제목/설명/태그)가 중앙 정렬로 보인다.
4. blockquote와 본문 이미지가 카드 형태(테두리 강조)로 보인다.
5. 900px 이하 모바일에서는 기존과 동일하게 단일 컬럼으로 깨지지 않고 보인다.
6. nav(`Header.astro`)는 시각적으로 변경되지 않는다.
7. `npm run build`가 에러 없이 통과한다.
