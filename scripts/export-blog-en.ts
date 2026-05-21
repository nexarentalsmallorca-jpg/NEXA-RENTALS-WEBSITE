import { writeFileSync } from "fs";
import { blogPosts } from "../lib/blogs";
import { additionalBlogPosts } from "../lib/blog-content/additional-posts";

const posts = [...blogPosts, ...additionalBlogPosts].map((p) => ({
  id: p.id,
  en: p.translations.en,
}));

writeFileSync(".blog-posts-export.json", JSON.stringify(posts));
