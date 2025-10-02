import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = req.cookies.get("admin")?.value
    if (cookie !== "1") {
      const url = new URL("/admin/login", req.url)
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"]
}
