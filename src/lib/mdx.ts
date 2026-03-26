import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "learn");

export interface ArticleFrontmatter {
  title: string;
  description: string;
  category: string;
  slug: string;
  publishedAt: string;
  readTimeMinutes: number;
  tags: string[];
  coverImage?: string;
  featured?: boolean;
}

export interface Article extends ArticleFrontmatter {
  content: string;
}

export const getArticlesByCategory = (category: string): ArticleFrontmatter[] => {
  const dir = path.join(CONTENT_DIR, category);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw  = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      return { ...(data as Omit<ArticleFrontmatter, "slug" | "category">), slug, category };
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

export const getArticle = (category: string, slug: string): Article | null => {
  const filePath = path.join(CONTENT_DIR, category, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { ...(data as Omit<ArticleFrontmatter, "slug" | "category">), slug, category, content };
};

export const getAllArticleSlugs = (): { category: string; slug: string }[] => {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((d) => fs.statSync(path.join(CONTENT_DIR, d)).isDirectory())
    .flatMap((category) => {
      const dir = path.join(CONTENT_DIR, category);
      return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".mdx"))
        .map((file) => ({ category, slug: file.replace(/\.mdx$/, "") }));
    });
};

export const getAllCategories = (): string[] => {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((d) => fs.statSync(path.join(CONTENT_DIR, d)).isDirectory());
};

export const getFeaturedArticles = (limit = 6): ArticleFrontmatter[] => {
  return getAllCategories()
    .flatMap((c) => getArticlesByCategory(c))
    .filter((a) => a.featured)
    .slice(0, limit);
};

export const CATEGORY_META: Record<string, { label: string; description: string; emoji: string }> = {
  poultry:      { label: "Poultry",       description: "Chicken, layers, broilers, ducks",          emoji: "🐔" },
  crops:        { label: "Crops",         description: "Maize, beans, vegetables, horticulture",     emoji: "🌽" },
  livestock:    { label: "Livestock",     description: "Cattle, goats, sheep, pigs",                 emoji: "🐄" },
  inputs:       { label: "Farm Inputs",   description: "Fertilizers, seeds, pesticides, tools",      emoji: "🌱" },
  services:     { label: "Agri Services", description: "Tractor hire, consulting, transport",        emoji: "🚜" },
  "market-prices": { label: "Market Prices", description: "Weekly commodity prices across Kenya",   emoji: "📈" },
};
