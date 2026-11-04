import Link from "next/link";
import { SITE, categoryPath } from "@/lib/site";

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="wordmark" href="/">
          <span aria-hidden="true" className="wordmark-mark" />
          {SITE.wordmark}
        </Link>
        <nav aria-label="카테고리" className="category-nav">
          <Link aria-current={!active ? "page" : undefined} href="/">
            전체
          </Link>
          {SITE.categories.map((category) => (
            <Link
              aria-current={active === category.name ? "page" : undefined}
              href={categoryPath(category.name)}
              key={category.slug}
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <Link className="header-cta" href="/#subscribe">
          구독
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>{SITE.wordmark}</strong>
        <p>{SITE.description}</p>
      </div>
      <p className="site-footer-note">
        리뷰는 직접 사용한 경험을 바탕으로 작성하며, 협찬이나 제품 제공을 받은 경우 글에
        밝힙니다.
      </p>
    </footer>
  );
}
