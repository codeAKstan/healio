import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

// Gmail-style envs (fallback)
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "")

const SMTP_FROM = process.env.SMTP_FROM || EMAIL_USER || "no-reply@healio.local"

function getTransport() {
  // Prefer explicit SMTP_* configuration
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }

  // Fallback to Gmail if EMAIL_* provided
  if (EMAIL_USER && EMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    })
  }

  throw new Error(
    "SMTP configuration missing. Set SMTP_HOST/SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS in .env",
  )
}

export async function sendTherapistApprovalEmail({ to, name }, baseUrl) {
  const transport = getTransport()
  const loginUrl = `${baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`
  const subject = "Your therapist account has been approved"
  const greeting = name ? `Hi ${name},` : "Hello,"
  const text = `${greeting}

Your therapist account has been approved by the administrator. You can now log in and start using Healio.

Login: ${loginUrl}

If you did not request this, please contact support.

- Healio Team`
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <p>${greeting}</p>
      <p>Your therapist account has been <strong>approved</strong> by the administrator. You can now log in and start using Healio.</p>
      <p>
        <a href="${loginUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">Log in to Healio</a>
      </p>
      <p style="color:#555">If you did not request this, please contact support.</p>
      <p style="color:#555">— Healio Team</p>
    </div>
  `

  await transport.sendMail({ from: SMTP_FROM, to, subject, text, html })
}

export async function sendAppointmentBookingEmail({ to, therapistName, patientName, date, time, sessionType }, baseUrl) {
  const transport = getTransport()
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const subject = `New appointment booked by ${patientName || "a patient"}`
  const text = `Hello ${therapistName || "Therapist"},

A patient${patientName ? ` (${patientName})` : ""} booked an appointment.

Date: ${date}
Time: ${time}
Type: ${sessionType === "in-person" ? "In-Person" : "Video Call"}

Manage your sessions: ${appUrl}/dashboard/sessions

- Healio Team`
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <p>Hello ${therapistName || "Therapist"},</p>
      <p>A patient${patientName ? ` (<strong>${patientName}</strong>)` : ""} booked an appointment.</p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Type:</strong> ${sessionType === "in-person" ? "In-Person" : "Video Call"}</li>
      </ul>
      <p>
        <a href="${appUrl}/dashboard/sessions" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">Manage Sessions</a>
      </p>
      <p style="color:#555">— Healio Team</p>
    </div>
  `

  await transport.sendMail({ from: SMTP_FROM, to, subject, text, html })
}

export async function sendAppointmentUpdateEmail(
  { to, patientName, therapistName, action, date, time, sessionType, newDate, newTime },
  baseUrl,
) {
  const transport = getTransport()
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const prettyType = sessionType === "in-person" ? "In-Person" : "Video Call"
  let subject = `Your appointment has been ${action}`
  let lines = [`Therapist: ${therapistName || "Your therapist"}`, `Type: ${prettyType}`]
  if (action === "confirmed") {
    lines.unshift("Status: Confirmed")
  }
  if (action === "rescheduled") {
    lines.push(`Previous: ${date} at ${time}`)
    lines.push(`New: ${newDate} at ${newTime}`)
  } else {
    lines.push(`Date: ${date}`)
    lines.push(`Time: ${time}`)
  }

  const text = `Hello ${patientName || "there"},

Your appointment has been ${action}.

${lines.join("\n")}

Manage your appointments: ${appUrl}/dashboard/appointments

- Healio Team`

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <p>Hello ${patientName || "there"},</p>
      <p>Your appointment has been <strong>${action}</strong>.</p>
      <ul>
        ${lines.map((l) => `<li>${l}</li>`).join("")}
      </ul>
      <p>
        <a href="${appUrl}/dashboard/appointments" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">View Appointments</a>
      </p>
      <p style="color:#555">— Healio Team</p>
    </div>
  `

  await transport.sendMail({ from: SMTP_FROM, to, subject, text, html })
}