import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import Appointment from "@/models/Appointment"
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

export async function DELETE(_req, context) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verify(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params

    await connectToDatabase()
    const user = await User.findById(payload.sub).lean()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Only allow cancelling your own appointment (patient) or therapist's own appointment
    const filter = user.role === "patient" ? { _id: id, patientId: payload.sub } : { _id: id, therapistId: payload.sub }
    const res = await Appointment.deleteOne(filter)
    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Appointment DELETE error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}