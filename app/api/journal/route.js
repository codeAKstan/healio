import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import Journal from "@/models/Journal"

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
    const items = await Journal.find({ userId: payload.sub }).sort({ createdAt: -1 }).lean()
    const data = items.map((j) => ({
      id: String(j._id),
      title: j.title,
      content: j.content,
      mood: j.mood,
      createdAt: j.createdAt,
    }))
    return NextResponse.json({ journals: data })
  } catch (err) {
    console.error("Journal GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verify(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { title, content, mood } = body
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    await connectToDatabase()
    const created = await Journal.create({ userId: payload.sub, title, content, mood: mood || "neutral" })
    return NextResponse.json({
      id: String(created._id),
      title: created.title,
      content: created.content,
      mood: created.mood,
      createdAt: created.createdAt,
    })
  } catch (err) {
    console.error("Journal POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}