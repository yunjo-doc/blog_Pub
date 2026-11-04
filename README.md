# 기어로그 (GEARLOG)

IT·전자기기 리뷰 블로그. Next.js 15 + Supabase.

## 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

Supabase가 연결되지 않았거나 글이 없으면 예시 글이 표시됩니다.

## 처음 설정

1. Supabase 새 프로젝트 생성 → SQL Editor에서 `supabase/schema.sql` 실행
2. `.env.local`에 Supabase URL과 publishable 키, `ADMIN_PASSWORD` 입력
3. 배포 시 같은 환경변수 + `NEXT_PUBLIC_SITE_URL`(실제 주소)을 설정

## 글 작성

Supabase Table Editor의 `posts` 테이블에 행을 추가합니다.

| 컬럼 | 설명 |
|---|---|
| `slug` | 주소에 쓰일 영문 이름 (`/posts/slug`) |
| `category` | `lib/site.ts`의 카테고리 중 하나 |
| `rating` | 0~5 평점 (리뷰가 아니면 비워두기) |
| `verdict` | 한 줄 평 |
| `featured` | 홈 상단 추천 글 |
| `status` | `published`일 때만 사이트에 표시 |

본문(`content`)에서 쓸 수 있는 형식: `## 제목`, `### 소제목`, `- 목록`, `> 인용`, `**굵게**`,
`![설명](이미지주소)`, `[링크 글자](주소)`(문단 안에서는 링크, 한 줄 단독이면 버튼), 주소만 한 줄(버튼).

## 블로그 이름·카테고리 바꾸기

`lib/site.ts` 한 파일만 수정하면 됩니다.

## 관리자

`/admin/views` — 조회 통계 (아이디 `admin`, 비밀번호는 `ADMIN_PASSWORD`).
