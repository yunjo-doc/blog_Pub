import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";
import NewsletterForm from "./newsletter-form";
import PageViewTracker from "./page-view-tracker";
import { Cover, PostCard, Rating } from "./post-card";
import { SiteFooter, SiteHeader } from "./site-chrome";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = Promise<{ category?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { category } = await searchParams;

  if (category && SITE.categories.includes(category)) {
    return {
      title: `${category} 리뷰`,
      alternates: { canonical: `/?category=${encodeURIComponent(category)}` },
    };
  }

  return { alternates: { canonical: "/" } };
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { category: rawCategory } = await searchParams;
  const category =
    rawCategory && SITE.categories.includes(rawCategory) ? rawCategory : undefined;
  const { posts, isSample } = await getPosts();
  const filtered = category ? posts.filter((post) => post.category === category) : posts;
  const featured = category ? undefined : (posts.find((post) => post.featured) ?? posts[0]);
  const listed = featured ? filtered.filter((post) => post.id !== featured.id) : filtered;

  return (
    <>
      <PageViewTracker path={category ? `/?category=${category}` : "/"} title={category ? `${category} 목록` : "홈"} />
      <SiteHeader active={category} />

      <main className="page">
        {isSample ? (
          <p className="sample-notice">
            지금 보이는 글은 예시예요. Supabase를 연결하고 글을 발행하면 실제 글로 바뀌어요.
          </p>
        ) : null}

        {featured ? (
          <section aria-label="추천 글" className="feature">
            <Link className="feature-card" href={`/posts/${featured.slug}`}>
              <div className="feature-media">
                <Cover post={featured} priority />
              </div>
              <div className="feature-body">
                <p className="eyebrow">
                  에디터 추천 · {featured.category}
                  {featured.rating !== null ? <Rating value={featured.rating} /> : null}
                </p>
                <h1>{featured.title}</h1>
                <p className="feature-excerpt">{featured.excerpt}</p>
                <span className="text-link">자세히 읽기 →</span>
              </div>
            </Link>
          </section>
        ) : (
          <section className="list-heading">
            <p className="eyebrow">카테고리</p>
            <h1>{category} 리뷰</h1>
          </section>
        )}

        <section aria-labelledby="latest-title" className="latest" id="latest">
          <div className="section-title">
            <h2 id="latest-title">{category ? `글 ${filtered.length}개` : "최신 리뷰와 가이드"}</h2>
          </div>

          {listed.length ? (
            <div className="post-grid">
              {listed.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="empty">아직 이 카테고리에 올라온 글이 없어요.</p>
          )}
        </section>

        <section className="newsletter" id="subscribe">
          <div>
            <p className="eyebrow">뉴스레터</p>
            <h2>새 리뷰가 올라오면 메일로 알려드릴게요.</h2>
            <p>광고 없이, 일주일에 한 번만 보내요.</p>
          </div>
          <NewsletterForm />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
