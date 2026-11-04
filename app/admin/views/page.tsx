import type { Metadata } from "next";
import { getSupabaseClient } from "@/lib/supabase";
import { SiteHeader } from "../../site-chrome";
import ViewsCharts, { type ContentInfo, type DailyCount } from "./views-charts";

export const metadata: Metadata = {
  title: "조회 통계",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageView = {
  id: string;
  path: string;
  slug: string | null;
  title: string | null;
  created_at: string;
};

const PAGE_SIZE = 1000;
const MAX_ROWS = 100000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKstDay(value: string | number) {
  return new Date(new Date(value).getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function getContentKey(row: PageView) {
  return row.slug || row.path || "/";
}

function getContentTitle(row: PageView) {
  if (row.title) return row.title;
  if (!row.slug && (row.path || "/") === "/") return "홈";

  return getContentKey(row);
}

async function getPageViews() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { rows: [] as PageView[], error: "Supabase 환경변수가 없습니다." };
  }

  // Supabase는 한 번에 최대 1,000건만 돌려주므로 나눠서 불러온다
  const rows: PageView[] = [];

  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("page_views")
      .select("id,path,slug,title,created_at")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      return { rows, error: error.message };
    }

    rows.push(...((data ?? []) as PageView[]));

    if (!data || data.length < PAGE_SIZE) break;
  }

  return { rows, error: null };
}

function summarize(rows: PageView[]) {
  const daily = new Map<string, DailyCount>();
  const contents = new Map<string, ContentInfo & { total: number }>();

  rows.forEach((row) => {
    const key = getContentKey(row);
    const day = toKstDay(row.created_at);
    const dailyKey = `${key}|${day}`;

    daily.set(dailyKey, { k: key, d: day, c: (daily.get(dailyKey)?.c ?? 0) + 1 });

    const existing = contents.get(key);

    // rows는 최신순이므로 처음 본 제목이 최신 제목
    contents.set(key, {
      key,
      title: existing?.title ?? getContentTitle(row),
      total: (existing?.total ?? 0) + 1,
    });
  });

  return {
    daily: Array.from(daily.values()),
    contents: Array.from(contents.values())
      .sort((a, b) => b.total - a.total)
      .map(({ key, title }) => ({ key, title })),
  };
}

export default async function AdminViewsPage() {
  const { rows, error } = await getPageViews();
  const today = toKstDay(Date.now());
  const weekAgo = toKstDay(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const totalViews = rows.length;
  const todayViews = rows.filter((row) => toKstDay(row.created_at) === today).length;
  const weeklyViews = rows.filter((row) => toKstDay(row.created_at) >= weekAgo).length;
  const { daily, contents } = summarize(rows);

  return (
    <>
      <SiteHeader />
      <main className="page">
        <section className="admin-shell">
          <div className="admin-heading">
            <p>관리자</p>
            <h1>페이지 조회 통계</h1>
            <span>한국 시간(KST) 기준으로 집계합니다.</span>
          </div>

          {error ? <div className="admin-alert">{error}</div> : null}

          <div className="admin-stat-grid">
            <article>
              <span>전체 조회</span>
              <strong>{totalViews.toLocaleString("ko-KR")}</strong>
            </article>
            <article>
              <span>오늘 조회</span>
              <strong>{todayViews.toLocaleString("ko-KR")}</strong>
            </article>
            <article>
              <span>최근 7일</span>
              <strong>{weeklyViews.toLocaleString("ko-KR")}</strong>
            </article>
          </div>

          <ViewsCharts contents={contents} daily={daily} today={today} />

          <section className="admin-panel">
            <h2>최근 조회 로그</h2>
            <div className="admin-log">
              {rows.slice(0, 30).map((row) => (
                <div className="admin-log-row" key={row.id}>
                  <span>{new Date(row.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
                  <strong>{row.title || row.path}</strong>
                  <small>{row.path}</small>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
