import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import Availability from "@/models/Availability"
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

export async function GET(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verify(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectToDatabase()
    const user = await User.findById(payload.sub).lean()
    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // If a therapistId query param is provided, allow authenticated patients (or anyone logged in)
    // to fetch that therapist's availability (therapist must be approved).
    const { searchParams } = new URL(req.url)
    const therapistId = searchParams.get("therapistId")
    let targetTherapistId = null
    if (therapistId) {
      const therapistUser = await User.findById(therapistId).lean()
      if (!therapistUser || therapistUser.role !== "therapist" || therapistUser.therapistStatus !== "approved") {
        return NextResponse.json({ error: "Invalid therapist" }, { status: 400 })
      }
      targetTherapistId = therapistId
    } else {
      // Default: therapist fetching their own availability
      if (user.role !== "therapist") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      targetTherapistId = payload.sub
    }

    const slots = await Availability.find({ therapistId: targetTherapistId }).sort({ day: 1, from: 1 }).lean()
    const data = slots.map((s) => ({ id: String(s._id), day: s.day, from: s.from, to: s.to }))
    return NextResponse.json({ slots: data })
  } catch (err) {
    console.error("Availability GET error:", err)
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
    const { day, from, to } = body
    if (!day || !from || !to) {
      return NextResponse.json({ error: "Day, from, and to are required" }, { status: 400 })
    }

    await connectToDatabase()
    const user = await User.findById(payload.sub).lean()
    if (!user || user.role !== "therapist") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const created = await Availability.create({ therapistId: payload.sub, day, from, to })
    return NextResponse.json({ id: String(created._id), day: created.day, from: created.from, to: created.to })
  } catch (err) {
    console.error("Availability POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}