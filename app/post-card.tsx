/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatDate, getCoverImage, type Post } from "@/lib/posts";

export function Rating({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  return (
    <span aria-label={`평점 5점 만점에 ${value}점`} className={`rating rating-${size}`}>
      <span aria-hidden="true" className="rating-star">
        ★
      </span>
      {value.toFixed(1)}
    </span>
  );
}

export function Cover({ post, priority }: { post: Post; priority?: boolean }) {
  const image = getCoverImage(post);

  if (image) {
    return (
      <img
        alt=""
        className="cover"
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        src={image}
      />
    );
  }

  return (
    <div aria-hidden="true" className="cover cover-placeholder">
      <span>{post.category}</span>
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link className="post-card" href={`/posts/${post.slug}`}>
      <div className="post-card-media">
        <Cover post={post} />
        {post.rating !== null ? <Rating value={post.rating} /> : null}
      </div>
      <div className="post-card-body">
        <span className="chip">{post.category}</span>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <div className="post-meta">
          <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
          {post.read_time ? <span>{post.read_time} 읽기</span> : null}
        </div>
      </div>
    </Link>
  );
}
