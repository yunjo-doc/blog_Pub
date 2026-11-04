import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase environment variables are missing." },
      { status: 200 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    path?: string;
    slug?: string;
    title?: string;
  } | null;

  const path = body?.path?.slice(0, 500) || "/";
  const slug = body?.slug?.slice(0, 200) || null;
  const title = body?.title?.slice(0, 300) || null;

  const { error } = await supabase.from("page_views").insert({
    path,
    slug,
    title,
    referrer: request.headers.get("referer"),
    user_agent: request.headers.get("user-agent"),
  });

  return NextResponse.json({
    ok: !error,
    error: error ? error.message : null,
  });
}