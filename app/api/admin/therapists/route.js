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
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await connectToDatabase()
    const therapists = await User.find({ role: "therapist" }).sort({ createdAt: -1 }).lean()
    const data = therapists.map((t) => ({
      id: String(t._id),
      name: t.name || "Unnamed",
      email: t.email,
      therapistStatus: t.therapistStatus || "pending",
      certificateUrl: t.certificateUrl || "",
      createdAt: t.createdAt,
    }))
    return NextResponse.json({ therapists: data })
  } catch (err) {
    console.error("Admin therapists GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}