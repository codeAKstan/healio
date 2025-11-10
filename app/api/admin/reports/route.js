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

function formatDay(date) {
  const d = new Date(date)
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export async function GET(request) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = await verify(token)
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const days = Number(searchParams.get("days")) || 30
  const now = new Date()
  const start = new Date(now)
  start.setUTCDate(now.getUTCDate() - days + 1)
  const startDayStr = formatDay(start)

  await connectToDatabase()

  // Users by day and role
  const users = await User.find({ createdAt: { $gte: start } }, {
    createdAt: 1,
    role: 1,
  }).lean()
  const userSeries = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    userSeries[formatDay(d)] = { date: formatDay(d), patients: 0, therapists: 0 }
  }
  for (const u of users) {
    const day = formatDay(u.createdAt)
    if (userSeries[day]) {
      if (u.role === "patient") userSeries[day].patients += 1
      if (u.role === "therapist") userSeries[day].therapists += 1
    }
  }
  const usersByDay = Object.values(userSeries)

  // Sessions scheduled per day (based on appointment.date string)
  const appts = await Appointment.find({ date: { $gte: startDayStr } }, {
    date: 1,
    status: 1,
    therapistId: 1,
  }).lean()
  const sessionSeries = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    const key = formatDay(d)
    sessionSeries[key] = { date: key, total: 0 }
  }
  for (const a of appts) {
    const day = a.date
    if (sessionSeries[day]) {
      sessionSeries[day].total += 1
    }
  }
  const sessionsByDay = Object.values(sessionSeries)

  // Status distribution overall
  const pendingCount = await Appointment.countDocuments({ status: "pending" })
  const confirmedCount = await Appointment.countDocuments({ status: "confirmed" })
  const cancelledCount = await Appointment.countDocuments({ status: "cancelled" })
  const totalCount = pendingCount + confirmedCount + cancelledCount
  const cancellationsRate = totalCount ? cancelledCount / totalCount : 0

  // Top therapists by confirmed sessions
  const topAgg = await Appointment.aggregate([
    { $match: { status: "confirmed" } },
    { $group: { _id: "$therapistId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ])
  const therapistIds = topAgg.map((t) => t._id)
  const therapists = await User.find({ _id: { $in: therapistIds } }, { name: 1 }).lean()
  const therapistNameMap = Object.fromEntries(therapists.map((t) => [String(t._id), t.name || "Unknown"]))
  const topTherapists = topAgg.map((t) => ({
    therapistId: String(t._id),
    name: therapistNameMap[String(t._id)],
    count: t.count,
  }))

  return NextResponse.json({
    usersByDay,
    sessionsByDay,
    statusDistribution: {
      pending: pendingCount,
      confirmed: confirmedCount,
      cancelled: cancelledCount,
    },
    cancellationsRate,
    topTherapists,
  })
}