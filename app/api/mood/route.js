import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import Mood from "@/models/Mood"

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
    const items = await Mood.find({ userId: payload.sub }).sort({ createdAt: -1 }).lean()
    const data = items.map((m) => ({
      id: String(m._id),
      mood: m.mood,
      intensity: m.intensity,
      notes: m.notes || "",
      createdAt: m.createdAt,
    }))
    return NextResponse.json({ moods: data })
  } catch (err) {
    console.error("Mood GET error:", err)
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
    const { mood, intensity, notes } = body
    if (!mood || !intensity) {
      return NextResponse.json({ error: "Mood and intensity are required" }, { status: 400 })
    }

    await connectToDatabase()
    const created = await Mood.create({ userId: payload.sub, mood, intensity, notes })
    return NextResponse.json({
      id: String(created._id),
      mood: created.mood,
      intensity: created.intensity,
      notes: created.notes || "",
      createdAt: created.createdAt,
    })
  } catch (err) {
    console.error("Mood POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}