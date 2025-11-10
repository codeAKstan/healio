import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import Notification from "@/models/Notification"

const JWT_SECRET = process.env.JWT_SECRET

async function verify(token) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch (e) {
    return null
  }
}

export async function GET(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verify(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const onlyUnread = searchParams.get("unread") === "true"

    await connectToDatabase()
    const user = await User.findById(payload.sub).lean()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const query = { userId: payload.sub }
    if (onlyUnread) query.read = false
    const docs = await Notification.find(query).sort({ createdAt: -1 }).limit(50).lean()
    const list = docs.map((n) => ({
      id: String(n._id),
      type: n.type,
      title: n.title,
      body: n.body,
      data: n.data || {},
      read: !!n.read,
      createdAt: n.createdAt,
    }))
    const unreadCount = await Notification.countDocuments({ userId: payload.sub, read: false })
    return NextResponse.json({ notifications: list, unread: unreadCount })
  } catch (err) {
    console.error("Notifications GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}