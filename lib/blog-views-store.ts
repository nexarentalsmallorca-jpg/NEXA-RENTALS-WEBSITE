import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const VIEWS_FILE = path.join(DATA_DIR, "blog-views.json");

export type BlogViewCounts = Record<string, number>;

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readLocalBlogViewCounts(): Promise<BlogViewCounts> {
  try {
    const raw = await readFile(VIEWS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as BlogViewCounts;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export async function incrementLocalBlogView(
  postId: string
): Promise<number> {
  await ensureDataDir();
  const counts = await readLocalBlogViewCounts();
  const next = (counts[postId] ?? 0) + 1;
  counts[postId] = next;
  await writeFile(VIEWS_FILE, JSON.stringify(counts, null, 2), "utf-8");
  return next;
}
