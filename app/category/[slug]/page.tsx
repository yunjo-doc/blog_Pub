import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RSS_ALTERNATE, SITE } from "@/lib/site";
import PostList from "../../post-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = Promise<{ slug: string }>;

function findCategory(slug: string) {
  return SITE.categories.find((item) => item.slug === slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = findCategory((await params).slug);

  if (!category) {
    return { title: "카테고리를 찾을 수 없습니다", robots: { index: false } };
  }

  const title = `${category.name} 리뷰와 사용 팁`;
  const description = `${SITE.name}의 ${category.name} 리뷰, 구매 가이드, 사용 팁을 모았어요.`;
  const url = `/category/${category.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url, types: RSS_ALTERNATE },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      url,
      siteName: SITE.name,
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const category = findCategory((await params).slug);

  if (!category) {
    notFound();
  }

  return <PostList category={category.name} />;
}
