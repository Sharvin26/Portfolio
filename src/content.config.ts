import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tldr: z.string(),
    publishDate: z.coerce.date(),

    readingOrder: z.number().int().positive(),
    updatedDate: z.coerce.date().optional(),
    primaryKeyword: z.string(),
    category: z.string(),
    relatedSlugs: z.array(z.string()).default([]),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .default([]),
  }),
});

export const collections = { guides };
