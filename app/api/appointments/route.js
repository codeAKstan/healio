import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import Appointment from "@/models/Appointment"
import Notification from "@/models/Notification"
import Availability from "@/models/Availability"
import { sendAppointmentBookingEmail } from "@/lib/mailer"

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
    const user = await User.findById(payload.sub).lean()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // For now, patients see their appointments
    const query = user.role === "patient" ? { patientId: payload.sub } : { therapistId: payload.sub }
    const docs = await Appointment.find(query).sort({ createdAt: -1 }).lean()
    let patientNames = {}
    if (user.role === "therapist" && docs.length > 0) {
      const pIds = Array.from(new Set(docs.map((d) => String(d.patientId))))
      const patients = await User.find({ _id: { $in: pIds } }).lean()
      patients.forEach((p) => {
        patientNames[String(p._id)] = p.name || p.email || "Patient"
      })
    }
    const list = docs.map((a) => ({
      id: String(a._id),
      therapistId: String(a.therapistId),
      patientId: String(a.patientId),
      patientName: patientNames[String(a.patientId)],
      date: a.date,
      time: a.time,
      sessionType: a.sessionType,
      status: a.status,
      createdAt: a.createdAt,
    }))
    return NextResponse.json({ appointments: list })
  } catch (err) {
    console.error("Appointments GET error:", err)
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
    const { therapist, date, time, sessionType } = body
    if (!therapist || !date || !time) {
      return NextResponse.json({ error: "Therapist, date, and time are required" }, { status: 400 })
    }

    await connectToDatabase()
    const patient = await User.findById(payload.sub).lean()
    if (!patient || patient.role !== "patient") {
      return NextResponse.json({ error: "Only patients can book appointments" }, { status: 403 })
    }
    const therapistUser = await User.findById(therapist).lean()
    if (!therapistUser || therapistUser.role !== "therapist" || therapistUser.therapistStatus !== "approved") {
      return NextResponse.json({ error: "Invalid therapist" }, { status: 400 })
    }

    // Enforce therapist availability: the requested date/time must fall within an available slot for that day
    const weekdayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]
    const requestedDate = new Date(`${date}T00:00:00`)
    if (Number.isNaN(requestedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }
    const dayName = weekdayNames[requestedDate.getDay()]
    await connectToDatabase()
    const slots = await Availability.find({ therapistId: therapist, day: dayName }).lean()
    const withinSlot = slots.some((s) => {
      // Compare strings "HH:MM" lexicographically which works for 24h format
      return time >= s.from && time < s.to
    })
    if (!withinSlot) {
      return NextResponse.json({ error: "Requested time not within therapist availability" }, { status: 409 })
    }

    // Prevent double booking: therapist cannot have another appointment at same date/time
    const conflict = await Appointment.findOne({ therapistId: therapist, date, time }).lean()
    if (conflict) {
      return NextResponse.json({ error: "Time slot already booked" }, { status: 409 })
    }

    const appt = await Appointment.create({
      therapistId: therapist,
      patientId: payload.sub,
      date,
      time,
      sessionType: sessionType === "in-person" ? "in-person" : "video-call",
      status: "pending",
    })

    // In-app notification for therapist
    await Notification.create({
      userId: therapist,
      type: "appointment",
      title: "New appointment booked",
      body: `${patient.name || patient.email || "A patient"} booked ${date} at ${time}`,
      data: { appointmentId: String(appt._id), patientId: String(patient._id) },
    })

    // Email notification to therapist
    try {
      await sendAppointmentBookingEmail(
        {
          to: therapistUser.email,
          therapistName: therapistUser.name || therapistUser.email,
          patientName: patient.name || patient.email,
          date,
          time,
          sessionType,
        },
        process.env.NEXT_PUBLIC_APP_URL,
      )
    } catch (e) {
      console.warn("Failed to send booking email:", e)
    }

    return NextResponse.json({
      id: String(appt._id),
      therapistId: String(appt.therapistId),
      patientId: String(appt.patientId),
      date: appt.date,
      time: appt.time,
      sessionType: appt.sessionType,
      status: appt.status,
    })
  } catch (err) {
    console.error("Appointments POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}