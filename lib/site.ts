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
  categories: ["스마트폰", "노트북", "태블릿", "오디오", "AI·앱", "액세서리"],
};
