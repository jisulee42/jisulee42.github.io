# Derek Tech Blog

Astro + GitHub Pages based personal tech blog.

## Features

- Markdown and MDX posting
- Tag and category archive pages
- Series navigation inside post pages
- Dark mode with localStorage persistence
- Giscus comments integration
- RSS and sitemap generation
- GitHub Pages automatic deployment via Actions

## Local Development

```bash
npm install
npm run dev
```

## Content Authoring

- Posts directory: `src/content/blog/`
- Series metadata: `src/content/series/`
- Frontmatter schema: `src/content.config.ts`

Example frontmatter:

```md
---
title: "A New Post"
description: "How I built this blog"
pubDate: "2026-03-04"
category: "Dev"
tags: ["astro", "github-pages"]
series:
  id: "astro-blog-foundation"
  order: 1
draft: false
---
```

## GitHub Pages Setup

1. Create repo and push this project
2. In `astro.config.mjs`, update:
   - `site`: `https://<username>.github.io`
   - `base`: `/<repo-name>`
3. GitHub repo settings -> Pages -> Source: GitHub Actions
4. Push to `main` branch

Deployment workflow: `.github/workflows/deploy.yml`

## Giscus Setup

Copy `.env.example` to `.env` and fill values from https://giscus.app

```bash
cp .env.example .env
```

Variables:

- `PUBLIC_GISCUS_REPO`
- `PUBLIC_GISCUS_REPO_ID`
- `PUBLIC_GISCUS_CATEGORY`
- `PUBLIC_GISCUS_CATEGORY_ID`

## Build

```bash
npm run build
npm run preview
```
