import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { RSS_ALTERNATE, categoryPath } from "@/lib/site";
import PostList from "./post-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  alternates: { canonical: "/", types: RSS_ALTERNATE },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // 예전 주소(/?category=노트북)는 새 주소(/category/laptop)로 이동
  if (category) {
    permanentRedirect(categoryPath(category));
  }

  return <PostList />;
}
