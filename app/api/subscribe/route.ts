import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, status: "error", error: "Supabase environment variables are missing." },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    source?: string;
  } | null;

  const email = body?.email?.trim().toLowerCase().slice(0, 320) ?? "";

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ ok: false, status: "invalid" }, { status: 400 });
  }

  const { error } = await supabase.from("subscribers").insert({
    email,
    source: body?.source?.slice(0, 200) || null,
  });

  // 23505 = unique_violation: 이미 구독 중인 이메일
  if (error?.code === "23505") {
    return NextResponse.json({ ok: true, status: "exists" });
  }

  if (error) {
    return NextResponse.json(
      { ok: false, status: "error", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, status: "subscribed" });
}
