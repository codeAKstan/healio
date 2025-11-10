import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
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

export async function PATCH(req, context) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verify(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const id = (await context.params)?.id
    await connectToDatabase()
    const notif = await Notification.findById(id)
    if (!notif) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (String(notif.userId) !== String(payload.sub)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    notif.read = true
    await notif.save()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Notifications PATCH error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}