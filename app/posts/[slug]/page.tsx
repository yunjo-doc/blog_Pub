/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import {
  formatDate,
  getCoverImage,
  getDescription,
  getPost,
  getPosts,
} from "@/lib/posts";
import { SITE } from "@/lib/site";
import PageViewTracker from "../../page-view-tracker";
import { PostCard, Rating } from "../../post-card";
import { SiteFooter, SiteHeader } from "../../site-chrome";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ slug: string }>;

function getLinkLabel(url: string) {
  try {
    return `${new URL(url).hostname.replace(/^www\./, "")} 바로가기`;
  } catch {
    return "링크 바로가기";
  }
}

function renderInline(text: string): ReactNode[] {
  // **굵게** 와 [텍스트](주소) 를 처리
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g).map((part, index) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);

    if (bold) return <strong key={index}>{bold[1]}</strong>;
    if (link) {
      return (
        <a href={link[2]} key={index} rel="noopener noreferrer" target="_blank">
          {link[1]}
        </a>
      );
    }

    return part;
  });
}

function renderContent(content: string) {
  const imagePattern = /^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/;
  const buttonPattern = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/;
  const bareUrlPattern = /^<?(https?:\/\/[^\s<>]+)>?$/;
  const lines = content.split("\n").map((line) => line.trim());
  const nodes: ReactNode[] = [];
  let list: string[] = [];

  function flushList() {
    if (list.length) {
      nodes.push(
        <ul key={`list-${nodes.length}`}>
          {list.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  }

  lines.forEach((line, index) => {
    const listItem = line.match(/^[-*]\s+(.+)$/);

    if (listItem) {
      list.push(listItem[1]);
      return;
    }

    flushList();

    if (!line) return;

    const image = line.match(imagePattern);
    const button = line.match(buttonPattern);
    const bareUrl = line.match(bareUrlPattern);
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    const key = `${index}-${line.slice(0, 20)}`;

    if (image) {
      nodes.push(
        <figure key={key}>
          <img alt={image[1] || ""} loading="lazy" src={image[2]} />
          {image[1] ? <figcaption>{image[1]}</figcaption> : null}
        </figure>
      );
    } else if (button || bareUrl) {
      const href = button ? button[2] : bareUrl![1];

      nodes.push(
        <p className="button-row" key={key}>
          <a className="button" href={href} rel="noopener noreferrer" target="_blank">
            {button ? button[1] : getLinkLabel(href)}
          </a>
        </p>
      );
    } else if (heading) {
      nodes.push(
        heading[1] === "##" ? <h2 key={key}>{heading[2]}</h2> : <h3 key={key}>{heading[2]}</h3>
      );
    } else if (line.startsWith("> ")) {
      nodes.push(<blockquote key={key}>{renderInline(line.slice(2))}</blockquote>);
    } else {
      nodes.push(<p key={key}>{renderInline(line)}</p>);
    }
  });

  flushList();

  return nodes;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "글을 찾을 수 없습니다", robots: { index: false } };
  }

  const url = `/posts/${post.slug}`;
  const description = getDescription(post);
  const image = getCoverImage(post);

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: SITE.name,
      locale: "ko_KR",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: [post.author],
      tags: post.tags,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const { posts } = await getPosts();
  const related = posts
    .filter((item) => item.id !== post.id && item.category === post.category)
    .concat(posts.filter((item) => item.id !== post.id && item.category !== post.category))
    .slice(0, 3);
  const image = getCoverImage(post);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: getDescription(post),
    image: image ? [image] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/posts/${post.slug}`,
    keywords: post.tags.join(", ") || undefined,
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        type="application/ld+json"
      />
      <PageViewTracker path={`/posts/${post.slug}`} slug={post.slug} title={post.title} />
      <SiteHeader active={post.category} />

      <main className="page">
        <article className="article">
          <header className="article-header">
            <Link className="chip" href={`/?category=${encodeURIComponent(post.category)}`}>
              {post.category}
            </Link>
            <h1>{post.title}</h1>
            {post.excerpt ? <p className="article-lead">{post.excerpt}</p> : null}
            <div className="post-meta">
              <span>{post.author}</span>
              <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
              {post.read_time ? <span>{post.read_time} 읽기</span> : null}
            </div>
          </header>

          {post.rating !== null || post.verdict ? (
            <aside aria-label="한눈에 보기" className="verdict">
              {post.rating !== null ? <Rating size="lg" value={post.rating} /> : null}
              <div>
                <strong>한 줄 평</strong>
                <p>{post.verdict || "본문에서 자세한 평가를 확인하세요."}</p>
              </div>
            </aside>
          ) : null}

          <div className="article-body">{renderContent(post.content || post.excerpt)}</div>

          {post.tags.length ? (
            <ul aria-label="태그" className="tags">
              {post.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          ) : null}
        </article>

        {related.length ? (
          <section aria-labelledby="related-title" className="latest">
            <div className="section-title">
              <h2 id="related-title">함께 읽으면 좋은 글</h2>
            </div>
            <div className="post-grid">
              {related.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}
