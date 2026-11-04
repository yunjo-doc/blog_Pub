import { cache } from "react";
import { SITE } from "./site";
import { getSupabaseClient } from "./supabase";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  author: string;
  rating: number | null;
  verdict: string | null;
  featured: boolean;
  read_time: string;
  published_at: string | null;
  updated_at: string | null;
};

const POST_COLUMNS =
  "id,title,slug,excerpt,content,cover_image_url,category,tags,author,rating,verdict,featured,read_time,published_at,updated_at";

// DB가 연결되지 않았거나 글이 없을 때 보여줄 예시 글
export const samplePosts: Post[] = [
  {
    id: "sample-1",
    title: "노트북 고를 때 꼭 확인할 5가지, 사양표 읽는 법",
    slug: "how-to-choose-laptop",
    excerpt:
      "CPU 이름만 보고 고르면 후회합니다. 무게, 배터리, 화면, 메모리, 포트까지 사양표에서 놓치기 쉬운 부분을 순서대로 정리했어요.",
    content: `노트북은 한 번 사면 3~5년을 쓰는 물건이라 처음 고를 때 기준을 세워두는 게 중요해요.

## 1. 용도부터 정하기

문서 작업과 영상 시청이 대부분이라면 고성능 CPU보다 가벼운 무게와 긴 배터리가 더 체감됩니다.

## 2. 메모리는 16GB부터

브라우저 탭을 여러 개 띄우는 요즘에는 8GB가 금방 부족해져요. 대부분 메모리를 나중에 늘릴 수 없으니 처음부터 넉넉하게 고르세요.

## 3. 화면 밝기와 색 영역

밝기(nit)와 색 영역(sRGB, DCI-P3) 수치를 함께 보면 실내외 사용감과 사진 작업 적합도를 가늠할 수 있어요.

## 4. 포트 구성

USB-C 충전 지원, HDMI 유무를 확인하면 동글을 덜 들고 다닐 수 있어요.

## 5. 무게와 배터리

매일 들고 다닌다면 1.3kg 안팎, 실사용 배터리 8시간 이상을 기준으로 잡아보세요.`,
    cover_image_url: null,
    category: "노트북",
    tags: ["구매 가이드", "노트북"],
    author: SITE.author,
    rating: null,
    verdict: null,
    featured: true,
    read_time: "5분",
    published_at: "2026-11-04",
    updated_at: null,
  },
  {
    id: "sample-2",
    title: "무선 이어폰 노이즈 캔슬링, 숫자보다 중요한 것",
    slug: "anc-earbuds-guide",
    excerpt:
      "노이즈 캔슬링 성능은 착용감과 이어팁에 따라 크게 달라집니다. 매장에서 짧게 들어볼 때 확인할 포인트를 정리했어요.",
    content: `노이즈 캔슬링(ANC)은 제품 설명의 수치보다 귀에 얼마나 잘 맞는지가 더 큰 영향을 줘요.

## 이어팁부터 맞추기

기본 이어팁이 귀에 헐겁다면 차음이 새면서 ANC 효과가 크게 줄어요. 사이즈를 바꿔가며 들어보세요.

## 주변음 모드의 자연스러움

출퇴근길에 자주 켜는 기능이라 목소리가 얼마나 자연스럽게 들리는지 꼭 확인하세요.

## 통화 품질

바람 부는 야외에서 통화가 잘 되는지는 리뷰 영상의 실제 녹음 샘플로 확인하는 게 정확해요.`,
    cover_image_url: null,
    category: "오디오",
    tags: ["이어폰", "구매 가이드"],
    author: SITE.author,
    rating: 4.5,
    verdict: "착용감이 맞으면 ANC 체감이 확 달라져요.",
    featured: false,
    read_time: "4분",
    published_at: "2026-11-03",
    updated_at: null,
  },
  {
    id: "sample-3",
    title: "AI 요약 도구로 회의록 정리 시간 줄이기",
    slug: "ai-meeting-notes",
    excerpt:
      "녹음, 받아쓰기, 요약까지 한 번에 처리하는 흐름을 만들어 봤어요. 정확도를 높이는 설정과 주의할 점도 함께 담았습니다.",
    content: `회의가 많은 날에는 기록을 남기는 것만으로도 시간이 꽤 들어요. AI 도구를 쓰면 이 과정을 크게 줄일 수 있어요.

## 녹음 품질이 절반

마이크와 가까운 자리에서 녹음하면 받아쓰기 정확도가 눈에 띄게 올라가요.

## 요약 요청은 구체적으로

"결정 사항, 담당자, 마감일만 표로 정리해줘"처럼 원하는 형식을 정해주면 결과가 훨씬 깔끔해요.

## 민감한 내용은 주의

외부 서비스에 회의 내용을 올리기 전에 회사 보안 정책을 꼭 확인하세요.`,
    cover_image_url: null,
    category: "AI·앱",
    tags: ["AI", "생산성"],
    author: SITE.author,
    rating: null,
    verdict: null,
    featured: false,
    read_time: "3분",
    published_at: "2026-11-02",
    updated_at: null,
  },
  {
    id: "sample-4",
    title: "스마트폰 배터리 오래 쓰는 설정 7가지",
    slug: "phone-battery-settings",
    excerpt:
      "화면 주사율, 위치 권한, 백그라운드 앱만 정리해도 하루 사용 시간이 달라집니다. 바로 따라 할 수 있는 설정을 모았어요.",
    content: `배터리 사용 시간은 설정 몇 가지로도 꽤 늘릴 수 있어요.

## 화면 설정

주사율 자동 조절과 다크 모드를 켜면 화면이 쓰는 전력을 줄일 수 있어요.

## 위치 권한 정리

"항상 허용"으로 되어 있는 앱을 "사용 중에만 허용"으로 바꿔보세요.

## 충전 습관

완충과 완전 방전을 반복하기보다 20~80% 사이를 유지하면 배터리 수명에 도움이 돼요.`,
    cover_image_url: null,
    category: "스마트폰",
    tags: ["스마트폰", "팁"],
    author: SITE.author,
    rating: null,
    verdict: null,
    featured: false,
    read_time: "4분",
    published_at: "2026-11-01",
    updated_at: null,
  },
];

function normalize(row: Partial<Post> & { id: string }): Post {
  return {
    id: row.id,
    title: row.title || "제목 없는 글",
    slug: row.slug || row.id,
    excerpt: row.excerpt || "",
    content: row.content || "",
    cover_image_url: row.cover_image_url ?? null,
    category: row.category || "리뷰",
    tags: row.tags ?? [],
    author: row.author || SITE.author,
    rating: row.rating === null || row.rating === undefined ? null : Number(row.rating),
    verdict: row.verdict ?? null,
    featured: Boolean(row.featured),
    read_time: row.read_time || "",
    published_at: row.published_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

export async function getPosts(): Promise<{ posts: Post[]; isSample: boolean }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { posts: samplePosts, isSample: true };
  }

  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error || !data?.length) {
    return { posts: samplePosts, isSample: true };
  }

  return { posts: data.map(normalize), isSample: false };
}

// generateMetadata와 페이지가 같은 요청에서 한 번만 조회하도록 캐시
export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (data) {
      return normalize(data);
    }
  }

  return samplePosts.find((post) => post.slug === slug) ?? null;
});

export function isSamplePost(post: Post) {
  return post.id.startsWith("sample-");
}

export function formatDate(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function getDescription(post: Post) {
  return (post.excerpt || post.content)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[#*_>`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
}

export function getCoverImage(post: Post) {
  return (
    post.cover_image_url ||
    post.content.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/)?.[1] ||
    null
  );
}
