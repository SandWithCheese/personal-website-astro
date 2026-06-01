import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!_ignore/**/*"],
    base: "./src/blog",
  }),
  schema: ({ image }) =>
    z.object({
      slug: z.string().min(1).refine((slug) => !slug.includes("/"), {
        message: "Blog slugs must not contain slashes.",
      }),
      title: z.string(),
      description: z.string(),
      cover: image(),
      coverAlt: z.string(),
      pubDate: z.coerce.date(),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { blog };
