import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  // Remove the JWT auth cookie
  try {
    cookieStore.delete("token")
  } catch (e) {
    // Fallback: overwrite cookie if delete fails
    cookieStore.set("token", "", { maxAge: 0, path: "/", httpOnly: true })
  }
  return NextResponse.json({ success: true })
}

export async function GET() {
  // Support GET as well to make testing easier
  const cookieStore = await cookies()
  try {
    cookieStore.delete("token")
  } catch (e) {
    cookieStore.set("token", "", { maxAge: 0, path: "/", httpOnly: true })
  }
  return NextResponse.json({ success: true })
}