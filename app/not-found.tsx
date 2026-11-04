import Link from "next/link";
import { SiteFooter, SiteHeader } from "./site-chrome";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="page not-found">
        <p className="eyebrow">404</p>
        <h1>찾으시는 글이 없어요.</h1>
        <p>주소가 바뀌었거나 삭제된 글일 수 있어요.</p>
        <Link className="button" href="/">
          홈으로 가기
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
