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

export async function PATCH(req, { params }) {
  try {
    const { id } = params
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
    const updated = await Journal.findOneAndUpdate(
      { _id: id, userId: payload.sub },
      { title, content, mood },
      { new: true },
    )
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({
      id: String(updated._id),
      title: updated.title,
      content: updated.content,
      mood: updated.mood,
      createdAt: updated.createdAt,
    })
  } catch (err) {
    console.error("Journal PATCH error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = params
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verify(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()
    const res = await Journal.deleteOne({ _id: id, userId: payload.sub })
    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Journal DELETE error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}