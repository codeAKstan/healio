import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import Appointment from "@/models/Appointment"

const JWT_SECRET = process.env.JWT_SECRET

async function verify(token) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch (e) {
    return null
  }
}

function timeAgo(fromDate) {
  const now = new Date()
  const diffMs = now - new Date(fromDate)
  const mins = Math.floor(diffMs / (1000 * 60))
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verify(token)
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await connectToDatabase()

    const [totalUsers, activeTherapists, pendingApprovals, totalSessions] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "therapist", therapistStatus: "approved" }),
      User.countDocuments({ role: "therapist", therapistStatus: "pending" }),
      Appointment.countDocuments({}),
    ])

    // Recent activity: combine latest users and appointments
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5).lean()
    const recentAppts = await Appointment.find({}).sort({ createdAt: -1 }).limit(5).lean()

    const userActivities = recentUsers.map((u) => ({
      id: String(u._id),
      user: u.name || u.email || "User",
      action: u.role === "therapist" ? "Registered as Therapist" : u.role === "patient" ? "Registered as Patient" : "Admin Login",
      time: timeAgo(u.createdAt),
      type: u.role === "therapist" ? "therapist" : "signup",
    }))

    const patientIds = Array.from(new Set(recentAppts.map((a) => String(a.patientId))))
    const therapistIds = Array.from(new Set(recentAppts.map((a) => String(a.therapistId))))
    const ids = Array.from(new Set([...patientIds, ...therapistIds]))
    const users = ids.length > 0 ? await User.find({ _id: { $in: ids } }).lean() : []
    const nameMap = {}
    users.forEach((u) => { nameMap[String(u._id)] = u.name || u.email || "User" })

    const apptActivities = recentAppts.map((a) => ({
      id: String(a._id),
      user: nameMap[String(a.patientId)] || "Patient",
      action: a.status === "confirmed" ? "Confirmed Appointment" : a.status === "cancelled" ? "Cancelled Appointment" : "Booked Appointment",
      time: timeAgo(a.createdAt),
      type: "appointment",
    }))

    const recentActivity = [...userActivities, ...apptActivities]
      .sort((x, y) => (x.time > y.time ? -1 : 1))
      .slice(0, 8)

    return NextResponse.json({
      stats: {
        totalUsers,
        activeTherapists,
        pendingApprovals,
        totalSessions,
      },
      recentActivity,
    })
  } catch (err) {
    console.error("Admin stats GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}