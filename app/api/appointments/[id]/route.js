import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import Appointment from "@/models/Appointment"
import User from "@/models/User"
import Notification from "@/models/Notification"
import Availability from "@/models/Availability"
import { sendAppointmentUpdateEmail } from "@/lib/mailer"

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
    const appt = await Appointment.findOne(filter).lean()
    if (!appt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    await Appointment.deleteOne({ _id: appt._id })

    // If therapist canceled, notify patient via in-app and email
    if (user.role === "therapist") {
      try {
        await Notification.create({
          userId: appt.patientId,
          type: "appointment",
          title: "Appointment canceled",
          body: `Your appointment on ${appt.date} at ${appt.time} was canceled by your therapist`,
          data: { appointmentId: String(appt._id) },
        })
        const patient = await User.findById(appt.patientId).lean()
        const therapist = await User.findById(appt.therapistId).lean()
        await sendAppointmentUpdateEmail(
          {
            to: patient.email,
            patientName: patient.name || patient.email,
            therapistName: therapist?.name || therapist?.email,
            action: "canceled",
            date: appt.date,
            time: appt.time,
            sessionType: appt.sessionType,
          },
          process.env.NEXT_PUBLIC_APP_URL,
        )
      } catch (e) {
        console.warn("Failed to notify patient about cancellation:", e)
      }
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Appointment DELETE error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req, context) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verify(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    const body = await req.json()
    const { status, date, time } = body

    await connectToDatabase()
    const user = await User.findById(payload.sub).lean()
    if (!user || user.role !== "therapist") {
      return NextResponse.json({ error: "Only therapists can update sessions" }, { status: 403 })
    }

    const appt = await Appointment.findOne({ _id: id, therapistId: payload.sub })
    if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const original = { date: appt.date, time: appt.time }
    let action = null

    if (typeof status === "string") {
      const normalized = status === "confirmed" ? "confirmed" : status === "pending" ? "pending" : appt.status
      appt.status = normalized
      action = normalized === "confirmed" ? "confirmed" : null
    }

    if (date || time) {
      // Reschedule; enforce availability and conflicts
      const newDate = date || appt.date
      const newTime = time || appt.time
      const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const d = new Date(`${newDate}T00:00:00`)
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
      }
      const dayName = weekdayNames[d.getDay()]
      const slots = await Availability.find({ therapistId: payload.sub, day: dayName }).lean()
      const withinSlot = slots.some((s) => newTime >= s.from && newTime < s.to)
      if (!withinSlot) {
        return NextResponse.json({ error: "Requested time not within therapist availability" }, { status: 409 })
      }
      const conflict = await Appointment.findOne({ therapistId: payload.sub, date: newDate, time: newTime, _id: { $ne: id } }).lean()
      if (conflict) {
        return NextResponse.json({ error: "Time slot already booked" }, { status: 409 })
      }
      appt.date = newDate
      appt.time = newTime
      action = "rescheduled"
    }

    await appt.save()

    // Notify patient
    try {
      await Notification.create({
        userId: appt.patientId,
        type: "appointment",
        title: action === "rescheduled" ? "Appointment rescheduled" : action === "confirmed" ? "Appointment confirmed" : "Appointment updated",
        body:
          action === "rescheduled"
            ? `Your appointment has been rescheduled to ${appt.date} at ${appt.time}`
            : action === "confirmed"
            ? `Your appointment on ${appt.date} at ${appt.time} has been confirmed`
            : `Your appointment was updated`,
        data: { appointmentId: String(appt._id) },
      })
      const patient = await User.findById(appt.patientId).lean()
      const therapist = await User.findById(appt.therapistId).lean()
      await sendAppointmentUpdateEmail(
        {
          to: patient.email,
          patientName: patient.name || patient.email,
          therapistName: therapist?.name || therapist?.email,
          action: action || "updated",
          date: original.date,
          time: original.time,
          sessionType: appt.sessionType,
          newDate: appt.date,
          newTime: appt.time,
        },
        process.env.NEXT_PUBLIC_APP_URL,
      )
    } catch (e) {
      console.warn("Failed to notify patient about update:", e)
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
    console.error("Appointment PATCH error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}