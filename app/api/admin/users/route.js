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
    const users = await User.find({}).sort({ createdAt: -1 }).lean()
    const data = users.map((u) => ({
      id: String(u._id),
      name: u.name || "",
      email: u.email,
      role: u.role,
      status: u.role === "therapist" ? (u.therapistStatus || "pending") : "active",
      createdAt: u.createdAt,
    }))
    return NextResponse.json({ users: data })
  } catch (err) {
    console.error("Admin users GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}