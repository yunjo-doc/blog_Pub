import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts, isSample } = await getPosts();

  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...SITE.categories.map((category) => ({
      url: `${SITE.url}/?category=${encodeURIComponent(category)}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    // 예시 글은 사이트맵에 넣지 않음
    ...(isSample ? [] : posts).map((post) => ({
      url: `${SITE.url}/posts/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.published_at ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
