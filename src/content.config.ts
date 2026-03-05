import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			category: z.string().default('Dev'),
			tags: z.array(z.string()).default([]),
			series: z
				.object({
					id: z.string(),
					order: z.number().int().positive(),
				})
				.optional(),
			draft: z.boolean().default(false),
			heroImage: image().optional(),
		}),
});

const series = defineCollection({
	loader: glob({ base: './src/content/series', pattern: '**/*.json' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
	}),
});

export const collections = { blog, series };
