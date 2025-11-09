import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET

async function verify(token) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch (e) {
    return null
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("token")?.value
  const isAdminLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login")
  console.log(`[middleware] path=${pathname} token=${token ? 'present' : 'absent'}`)

  // Protect /admin
  if (pathname.startsWith("/admin")) {
    if (isAdminLogin) {
      // Allow access to the admin login page without a token
      return NextResponse.next()
    }
    if (!token) {
      const url = new URL("/admin/login", req.url)
      return NextResponse.redirect(url)
    }
    const payload = await verify(token)
    if (!payload || payload.role !== "admin") {
      const url = new URL("/admin/login", req.url)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Protect /dashboard (any authenticated user)
  if (pathname.startsWith("/dashboard")) {
    console.log("[middleware] protecting /dashboard")
    if (!token) {
      const url = new URL("/login", req.url)
      console.log("[middleware] redirecting to /login due to missing token")
      return NextResponse.redirect(url)
    }
    const payload = await verify(token)
    if (!payload) {
      const url = new URL("/login", req.url)
      console.log("[middleware] redirecting to /login due to invalid token")
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/dashboard", "/dashboard/:path*"],
}