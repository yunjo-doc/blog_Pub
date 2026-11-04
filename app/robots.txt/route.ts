import { SITE } from "@/lib/site";

// 다음(Daum) 웹마스터도구 인증 줄은 주석 형식이라 직접 텍스트로 만들어요.
const DAUM_WEBMASTER_PIN =
  "#DaumWebMasterTool:10a34ddc043eca66b76ca075927d458e49600539bfacdd28c9e158b8a02ee14b:u1KY4V8+6gddZ3NiGzwUZw==";

export function GET() {
  const body = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "",
    `Host: ${SITE.url}`,
    `Sitemap: ${SITE.url}/sitemap.xml`,
    "",
    DAUM_WEBMASTER_PIN,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
