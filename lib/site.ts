// 블로그 이름·주소·소개 문구는 여기서 한 번에 바꿀 수 있어요.
export const SITE = {
  name: "AI 생활연구소",
  wordmark: "AI 생활연구소",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  tagline: "AI와 IT 기기로 더 편한 생활",
  description:
    "AI 도구부터 스마트폰, 노트북, 오디오까지. 직접 써보고 생활에 도움이 되는 사용법과 솔직한 리뷰를 정리하는 블로그.",
  keywords: ["AI 생활연구소", "AI 활용", "IT 리뷰", "전자기기 리뷰", "스마트폰", "노트북", "태블릿", "이어폰", "AI 도구", "사용기"],
  author: "AI 생활연구소 에디터",
  // name: 글의 category 칸에 넣는 이름, slug: 주소에 쓰이는 영문 이름 (/category/slug)
  categories: [
    { name: "스마트폰", slug: "smartphone" },
    { name: "노트북", slug: "laptop" },
    { name: "태블릿", slug: "tablet" },
    { name: "오디오", slug: "audio" },
    { name: "AI·앱", slug: "ai-apps" },
    { name: "액세서리", slug: "accessories" },
  ],
  // Google Search Console / 네이버 서치어드바이저 HTML 태그 인증 코드 (content 값만)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "vUFebJYruh3TMh4XVUuSkiA1JGYSIa02a10L8TkbUaU",
    naver: process.env.NAVER_SITE_VERIFICATION || undefined,
  },
};

// 페이지별 alternates에 함께 넣어야 RSS 링크가 유지됨
export const RSS_ALTERNATE = {
  "application/rss+xml": [{ url: "/rss.xml", title: SITE.name }],
};

export function categoryPath(name: string) {
  const category = SITE.categories.find((item) => item.name === name);

  return category ? `/category/${category.slug}` : "/";
}
