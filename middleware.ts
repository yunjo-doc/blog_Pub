import { NextResponse, type NextRequest } from "next/server";

const ADMIN_USERNAME = "admin";

function unauthorized() {
  return new NextResponse("관리자 인증이 필요합니다.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="KWITH Admin", charset="UTF-8"',
    },
  });
}

function decodeBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  try {
    const bytes = Uint8Array.from(atob(header.slice(6)), (char) =>
      char.charCodeAt(0)
    );
    const decoded = new TextDecoder().decode(bytes);
    const separator = decoded.indexOf(":");

    if (separator < 0) {
      return null;
    }

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  // 비밀번호가 설정되지 않았으면 관리자 화면을 열지 않음
  if (!adminPassword) {
    return new NextResponse("관리자 비밀번호(ADMIN_PASSWORD)가 설정되지 않았습니다.", {
      status: 503,
    });
  }

  const credentials = decodeBasicAuth(request.headers.get("authorization"));

  if (
    credentials?.username !== ADMIN_USERNAME ||
    credentials.password !== adminPassword
  ) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
