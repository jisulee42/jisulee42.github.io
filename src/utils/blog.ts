import { getCollection, type CollectionEntry } from 'astro:content';

export interface NamedPostGroup {
	readonly name: string;
	readonly posts: readonly CollectionEntry<'blog'>[];
}

export interface SeriesNavigation {
	readonly posts: readonly CollectionEntry<'blog'>[];
	readonly previous: CollectionEntry<'blog'> | null;
	readonly next: CollectionEntry<'blog'> | null;
}

export function sortPostsByDate(posts: readonly CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
	return [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	return sortPostsByDate(posts);
}

export function getTagCounts(posts: readonly CollectionEntry<'blog'>[]): ReadonlyMap<string, number> {
	const tagCount = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.data.tags) {
			tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
		}
	}
	return tagCount;
}

export function getCategoryCounts(posts: readonly CollectionEntry<'blog'>[]): ReadonlyMap<string, number> {
	const categoryCount = new Map<string, number>();
	for (const post of posts) {
		const category = post.data.category;
		categoryCount.set(category, (categoryCount.get(category) ?? 0) + 1);
	}
	return categoryCount;
}

export function getPostsByTag(posts: readonly CollectionEntry<'blog'>[], tag: string): CollectionEntry<'blog'>[] {
	return sortPostsByDate(posts.filter((post) => post.data.tags.includes(tag)));
}

export function getPostsByCategory(
	posts: readonly CollectionEntry<'blog'>[],
	category: string,
): CollectionEntry<'blog'>[] {
	return sortPostsByDate(posts.filter((post) => post.data.category === category));
}

export function getSeriesNavigation(
	posts: readonly CollectionEntry<'blog'>[],
	post: CollectionEntry<'blog'>,
): SeriesNavigation {
	if (!post.data.series) {
		return { posts: [], previous: null, next: null };
	}

	const seriesPosts = posts
		.filter((entry) => entry.data.series?.id === post.data.series?.id)
		.sort((a, b) => {
			const left = a.data.series?.order ?? 0;
			const right = b.data.series?.order ?? 0;
			return left - right;
		});

	const currentIndex = seriesPosts.findIndex((entry) => entry.id === post.id);

	return {
		posts: seriesPosts,
		previous: currentIndex > 0 ? seriesPosts[currentIndex - 1] : null,
		next: currentIndex >= 0 && currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null,
	};
}
