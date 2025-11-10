import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET

async function verify(token) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch (e) {
    return null
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verify(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()
    const therapists = await User.find({ role: "therapist", therapistStatus: "approved" }).lean()
    const list = therapists.map((t) => ({
      id: String(t._id),
      name: t.name || t.email || "Therapist",
      email: t.email,
      specialization: t.specialization || "General",
      avatar: (t.name || t.email || "U")
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "U",
    }))
    return NextResponse.json({ therapists: list })
  } catch (err) {
    console.error("Therapists GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}