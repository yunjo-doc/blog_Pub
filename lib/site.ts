// 블로그 이름·주소·소개 문구는 여기서 한 번에 바꿀 수 있어요.
export const SITE = {
  name: "기어로그",
  wordmark: "GEARLOG",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  tagline: "써보고 말하는 IT 리뷰",
  description:
    "스마트폰, 노트북, 태블릿, 오디오, AI 도구까지. 직접 써보고 장단점을 솔직하게 정리하는 IT·전자기기 리뷰 블로그.",
  keywords: ["IT 리뷰", "전자기기 리뷰", "스마트폰", "노트북", "태블릿", "이어폰", "AI 도구", "사용기"],
  author: "기어로그 에디터",
  categories: ["스마트폰", "노트북", "태블릿", "오디오", "AI·앱", "액세서리"],
};
