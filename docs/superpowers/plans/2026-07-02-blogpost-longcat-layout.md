# 포스트 페이지 롱캣 스타일 레이아웃 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/layouts/BlogPost.astro`의 레이아웃을 longcat.chat 블로그 포스트 스타일(좌측 sticky TOC + 스크롤스파이, 중앙정렬 히어로, 720px 읽기 폭, blockquote/이미지 카드 강조)로 리디자인한다.

**Architecture:** 단일 파일(`BlogPost.astro`)의 템플릿 구조 + scoped `<style>` + 신규 인라인 `<script>`만 수정한다. 새 컴포넌트나 의존성은 추가하지 않는다.

**Tech Stack:** Astro 5 scoped style, 순수 CSS custom properties(기존 `global.css` 토큰 재사용), vanilla `IntersectionObserver`.

## Global Constraints

- `src/components/Header.astro`, `src/components/Footer.astro`는 수정하지 않는다.
- `src/styles/global.css`의 색상/폰트/코드블록 토큰은 수정하지 않는다 (accent는 기존 red 계열 `229, 72, 77` 유지).
- Shiki 코드 하이라이팅 설정(`astro.config.mjs`)은 수정하지 않는다.
- 새 npm 패키지를 추가하지 않는다.
- 이 프로젝트는 JS 유닛테스트 러너가 없다 (Astro 정적 사이트, `@astrojs/check`만 존재). 각 태스크의 검증은 `npm run build` 통과 + `npm run dev` 기동 후 `browse` 스킬로 실제 렌더링을 스크린샷/스냅샷으로 확인하는 방식으로 한다.
- 참조 스펙: `docs/superpowers/specs/2026-07-02-blogpost-longcat-layout-design.md`

---

### Task 1: 히어로 블록 분리 + 중앙정렬

**Files:**
- Modify: `src/layouts/BlogPost.astro:242-260` (템플릿 — `<article>` 안에 있던 `.cover`/`.article-head`를 `<main>` 바깥의 `.hero` 블록으로 이동)
- Modify: `src/layouts/BlogPost.astro:39-240` (scoped style — `.hero`, `.article-head`, `.head-meta`, `.tag-row` 규칙 추가/수정)

**Interfaces:**
- Consumes: 기존 `Astro.props`의 `heroImage`, `title`, `category`, `pubDate`, `updatedDate`, `description`, `tags` (변경 없음)
- Produces: `.hero` 클래스가 붙은 wrapper — Task 2에서 `<main>`과 형제 요소로 존재한다고 가정하고 그리드를 짠다.

- [ ] **Step 1: 템플릿에서 히어로를 `<main>` 밖으로 이동**

`src/layouts/BlogPost.astro`의 `<body>` 블록을 다음과 같이 변경한다 (기존 242~316줄 전체를 교체):

```astro
	<body>
		<Header />

		<div class="hero">
			{heroImage && <div class="cover"><Image width={1200} height={675} src={heroImage} alt={title} /></div>}

			<header class="article-head">
				<div class="head-meta">
					<a class="chip chip-accent" href={withBase(`/categories/${encodeURIComponent(category)}/`)}>#{category}</a>
					<span class="date"><FormattedDate date={pubDate} /></span>
					{updatedDate && <span class="date">(수정 <FormattedDate date={updatedDate} />)</span>}
				</div>
				<h1>{title}</h1>
				<p>{description}</p>

				<div class="tag-row">
					{tags.map((tag) => <a class="chip" href={withBase(`/tags/${encodeURIComponent(tag)}/`)}>#{tag}</a>)}
				</div>
			</header>
		</div>

		<main>
			<article>
				<section class="body">
					<slot />

					{
						series && (
							<section class="series-box">
								<h3>시리즈</h3>
								<a class="chip" href={withBase(`/series/${series.id}/`)}>{series.id}</a>
								<div class="series-nav">
									{
										previousInSeries ? (
											<a class="series-nav-card" href={withBase(`/blog/${previousInSeries.id}/`)}>
												<span class="series-nav-label">이전 글</span>
												<span class="series-nav-title">← {previousInSeries.data.title}</span>
											</a>
										) : (
											<span class="series-nav-card is-empty">
												<span class="series-nav-label">이전 글</span>
												<span class="series-nav-title">첫 번째 글입니다</span>
											</span>
										)
									}
									{
										nextInSeries ? (
											<a class="series-nav-card series-nav-next" href={withBase(`/blog/${nextInSeries.id}/`)}>
												<span class="series-nav-label">다음 글</span>
												<span class="series-nav-title">{nextInSeries.data.title} →</span>
											</a>
										) : (
											<span class="series-nav-card series-nav-next is-empty">
												<span class="series-nav-label">다음 글</span>
												<span class="series-nav-title">마지막 글입니다</span>
											</span>
										)
									}
								</div>
							</section>
						)
					}
				</section>

				<Comments />
			</article>

			{
				tocHeadings.length > 0 && (
					<aside class="toc" aria-label="Table of contents">
						<h3>목차</h3>
						<ul>
							{tocHeadings.map((item) => <li><a class={`depth-${item.depth}`} href={`#${item.slug}`} data-toc-link>{item.text}</a></li>)}
						</ul>
					</aside>
				)
			}
		</main>
		<Footer />
	</body>
```

(`data-toc-link` 속성은 Task 3의 스크롤스파이 스크립트가 사용한다.)

- [ ] **Step 2: `.hero` 스타일 추가, `.article-head`/`.head-meta`/`.tag-row` 중앙정렬로 수정**

`<style>` 블록에서 기존 `.cover`, `.article-head`, `.head-meta`, `.tag-row` 규칙(39~87줄, 119~124줄)을 아래로 교체한다:

```css
			.hero {
				width: min(720px, calc(100% - 2rem));
				margin: 0 auto 1.8rem;
				text-align: center;
			}

			.cover {
				margin-bottom: 1.1rem;
			}

			.cover img {
				width: 100%;
				border-radius: var(--radius-lg);
				box-shadow: var(--shadow);
			}

			.article-head {
				padding: 1.3rem;
				border: 1px solid rgb(var(--line));
				background: rgb(var(--surface));
				border-radius: var(--radius-lg);
			}

			.article-head h1 {
				color: rgb(6, 11, 17);
			}

			.article-head p {
				color: rgba(6, 11, 17, 0.72);
			}

			.head-meta {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				gap: 0.5rem;
				align-items: center;
				margin-bottom: 0.8rem;
			}

			.date {
				font-size: 0.87rem;
				color: rgba(6, 11, 17, 0.48);
			}

			.tag-row {
				display: flex;
				gap: 0.5rem;
				flex-wrap: wrap;
				justify-content: center;
				margin-top: 1.2rem;
			}
```

(`main`의 `margin-bottom: 1rem`이었던 `.article-head`는 이제 `.hero`가 `margin: 0 auto 1.8rem`으로 그 역할을 대신하므로 제거했다.)

- [ ] **Step 3: 빌드 확인**

Run: `cd /Users/derek/Workspace/01-Repository/personal/tech-blog && npm run build`
Expected: 에러 없이 빌드 완료 (Astro 타입/문법 에러가 있으면 여기서 잡힌다).

- [ ] **Step 4: 커밋**

```bash
git add src/layouts/BlogPost.astro
git commit -m "refactor: 포스트 히어로를 본문 그리드 밖으로 분리하고 중앙정렬"
```

---

### Task 2: 본문/TOC 그리드 재구성 (좌측 TOC, 720px 본문, breakpoint 조정)

**Files:**
- Modify: `src/layouts/BlogPost.astro` (scoped style — `main`, `.toc` 관련 규칙)

**Interfaces:**
- Consumes: Task 1에서 만든 `.hero` 블록 (그리드 밖에 위치, 영향 없음), 템플릿상 `<article>`이 `<main>`의 첫 번째 자식, `<aside class="toc">`가 두 번째 자식인 구조 (Task 1에서 이미 반영됨)
- Produces: `.toc`가 항상 `grid-column: 1`, `article`이 항상 `grid-column: 2`를 갖는 그리드 — TOC가 없는 포스트(`tocHeadings.length === 0`)에서도 본문이 좁은 컬럼에 끼이지 않는다.

- [ ] **Step 1: `main` 그리드와 `.toc` 위치/breakpoint 수정**

`<style>` 블록에서 기존 `main { ... }` 규칙(40~48줄)을 교체:

```css
			main {
				width: min(980px, calc(100% - 2rem));
				margin: 0 auto;
				display: grid;
				grid-template-columns: 230px minmax(0, 720px);
				gap: 1.8rem;
				justify-content: center;
				align-items: start;
			}

			main > article {
				grid-column: 2;
			}

			main > .toc {
				grid-column: 1;
			}
```

기존 `.toc { ... }` 규칙(190~199줄)에 `grid-column`은 위에서 별도 규칙으로 뺐으니 나머지는 그대로 두되, 아래 `@media (max-width: 1460px)` 블록(230~238줄)을 다음으로 교체:

```css
			@media (max-width: 1200px) {
				main {
					grid-template-columns: minmax(0, 720px);
				}

				main > article {
					grid-column: 1;
				}

				.toc {
					display: none;
				}
			}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 완료.

- [ ] **Step 3: 시각 확인 (데스크톱 폭)**

Run:
```bash
npm run dev &
sleep 2
B=~/.claude/skills/gstack/browse/dist/browse
$B viewport 1280x900
$B goto http://localhost:4321/blog/<존재하는-slug>/
$B screenshot /tmp/task2-desktop.png
```
Expected: 좌측에 TOC(230px), 우측에 720px 본문이 나란히 보인다. `<존재하는-slug>`는 `src/content/blog/`에 실제 있는 글 slug로 바꿔서 실행한다 (예: `find src/content/blog -name '*.md' | head -1`로 하나 확인).

- [ ] **Step 4: 커밋**

```bash
git add src/layouts/BlogPost.astro
git commit -m "feat: TOC를 좌측으로 이동하고 본문 폭을 720px로 축소"
```

---

### Task 3: TOC 스크롤스파이 (읽는 섹션 자동 강조)

**Files:**
- Modify: `src/layouts/BlogPost.astro` (scoped style — `.toc a`, `.toc a.is-active` 규칙 / 템플릿 끝에 `<script>` 추가)

**Interfaces:**
- Consumes: Task 1에서 TOC 링크에 추가한 `data-toc-link` 속성, `href="#<slug>"` (slug는 Astro 렌더러가 자동 부여하는 heading `id`와 일치)
- Produces: `.toc a`에 토글되는 `.is-active` 클래스. 이 태스크 이후 다른 태스크가 이 클래스에 의존하지 않는다 (터미널 기능).

- [ ] **Step 1: `.toc a` 스타일에 활성 상태 추가**

기존 `.toc a { ... }` 규칙(214~220줄)을 교체:

```css
			.toc a {
				display: block;
				text-decoration: none;
				font-size: 0.84rem;
				color: rgba(6, 11, 17, 0.48);
				line-height: 1.4;
				border-left: 2px solid transparent;
				padding-left: 0.6rem;
				transition: color 0.15s ease, border-color 0.15s ease;
			}

			.toc a.is-active {
				color: rgb(6, 11, 17);
				font-weight: 700;
				border-left-color: rgb(var(--accent));
			}
```

- [ ] **Step 2: 스크롤스파이 스크립트 추가**

`</main>` 다음, `<Footer />` 앞에 아래 `<script>`를 추가한다:

```astro
		<script>
			const tocLinks = document.querySelectorAll<HTMLAnchorElement>('.toc a[data-toc-link]');
			const headingByLink = new Map<string, HTMLAnchorElement>();

			tocLinks.forEach((link) => {
				const id = link.getAttribute('href')?.slice(1);
				if (id) headingByLink.set(id, link);
			});

			const headings = Array.from(headingByLink.keys())
				.map((id) => document.getElementById(id))
				.filter((el): el is HTMLElement => el !== null);

			if (headings.length > 0) {
				const setActive = (id: string) => {
					tocLinks.forEach((link) => link.classList.remove('is-active'));
					headingByLink.get(id)?.classList.add('is-active');
				};

				const observer = new IntersectionObserver(
					(entries) => {
						entries.forEach((entry) => {
							if (entry.isIntersecting) setActive(entry.target.id);
						});
					},
					{ rootMargin: '-88px 0px -70% 0px', threshold: 0 },
				);

				headings.forEach((heading) => observer.observe(heading));
			}
		</script>
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 완료 (Astro는 `<script>` 안 TS 문법을 기본적으로 처리한다).

- [ ] **Step 4: 시각 확인 (스크롤스파이 동작)**

Run:
```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:4321/blog/<h2가-여러-개인-slug>/
$B viewport 1280x900
$B js "window.scrollTo(0, 800)"
$B screenshot /tmp/task3-scrollspy.png
```
Expected: 스크린샷에서 스크롤된 위치에 해당하는 TOC 링크가 좌측 accent bar + 굵은 글씨로 강조되어 있다.

- [ ] **Step 5: 커밋**

```bash
git add src/layouts/BlogPost.astro
git commit -m "feat: TOC 스크롤스파이로 현재 읽는 섹션 자동 강조"
```

---

### Task 4: blockquote/이미지 카드 강조 + 최종 반응형 확인

**Files:**
- Modify: `src/layouts/BlogPost.astro` (scoped style — `.body :global(blockquote)`, `.body :global(img)` 규칙 추가)

**Interfaces:**
- Consumes: 없음 (독립적인 스타일 추가)
- Produces: 없음 (터미널 태스크 — 이후 다른 태스크가 이 결과에 의존하지 않는다)

- [ ] **Step 1: blockquote 강조 스타일 추가**

기존 `.body :global(p), .body :global(li), .body :global(blockquote) { ... }` 규칙(97~101줄)에서 `blockquote`를 분리하고 강조 스타일을 추가한다:

```css
			.body :global(p),
			.body :global(li) {
				color: rgba(6, 11, 17, 0.8);
			}

			.body :global(blockquote) {
				margin: 1.2rem 0;
				padding: 0.8rem 1.1rem;
				border-left: 4px solid rgb(var(--accent));
				background: rgb(var(--surface-strong));
				border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
				color: rgba(6, 11, 17, 0.8);
			}
```

- [ ] **Step 2: 본문 이미지에 테두리 추가**

`.body :global(h1), .body :global(h2), .body :global(h3), .body :global(h4) { ... }` 규칙(103~108줄) 다음에 추가:

```css
			.body :global(img) {
				border: 1px solid rgb(var(--line));
			}
```

(border-radius는 `global.css:124-128`의 전역 `img` 규칙이 이미 적용하므로 여기서는 border만 추가한다.)

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 에러 없이 완료.

- [ ] **Step 4: 전체 반응형 최종 확인**

Run:
```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:4321/blog/<blockquote와-이미지가-있는-slug>/
$B responsive /tmp/final-check
```
Expected: `/tmp/final-check-desktop.png`(TOC 좌측 sticky + 720px 본문 + 중앙정렬 히어로 + blockquote/이미지 카드), `/tmp/final-check-tablet.png`, `/tmp/final-check-mobile.png`(900px 이하 — 단일 컬럼, TOC 없음, 히어로는 중앙정렬 유지)가 모두 레이아웃 깨짐 없이 보인다. 세 스크린샷을 Read 도구로 확인한다.

- [ ] **Step 5: dev 서버 정리**

Run: `pkill -f "astro dev"` (Task 2에서 백그라운드로 띄운 dev 서버 종료 — 사용자가 본인 환경에서 다시 `npm run dev`로 확인할 것이므로 남겨두지 않는다)

- [ ] **Step 6: 커밋**

```bash
git add src/layouts/BlogPost.astro
git commit -m "style: blockquote와 본문 이미지에 카드 강조 스타일 적용"
```

---

## Self-Review Notes

- **스펙 커버리지:** 히어로 중앙정렬(Task 1), TOC 좌측 이동+breakpoint(Task 2), 스크롤스파이(Task 3), blockquote/이미지 카드(Task 4), 반응형 확인(Task 4 Step 4) — 스펙의 모든 섹션에 대응하는 태스크 있음. Header/Footer/global.css/Shiki 미변경은 Global Constraints에 명시.
- **타입 일관성:** `data-toc-link` 속성(Task 1에서 추가) → Task 3 스크립트의 `querySelectorAll('.toc a[data-toc-link]')`가 동일한 속성명 사용. `.is-active` 클래스명이 Task 3 CSS와 스크립트에서 일치.
- **플레이스홀더:** `<존재하는-slug>` 등은 실행자가 실제 저장소의 글 목록에서 채워 넣어야 하는 값이며, 코드/설정 값이 아니므로 허용 범위로 판단.
