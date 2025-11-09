import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import { sendTherapistApprovalEmail } from "@/lib/mailer"
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

export async function PATCH(req, context) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = await verify(token)
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await context.params
    const body = await req.json()
    const { action } = body // 'approve' | 'reject' | 'pending'
    if (!action || !["approve", "reject", "pending"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await connectToDatabase()
    const statusMap = { approve: "approved", reject: "rejected", pending: "pending" }
    const updated = await User.findOneAndUpdate(
      { _id: id, role: "therapist" },
      { therapistStatus: statusMap[action] },
      { new: true },
    ).lean()
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (action === "approve") {
      try {
        await sendTherapistApprovalEmail({ to: updated.email, name: updated.name }, process.env.NEXT_PUBLIC_APP_URL)
      } catch (mailErr) {
        console.error("Failed to send approval email:", mailErr)
        // Do not fail the approval if email sending fails
      }
    }

    return NextResponse.json({
      id: String(updated._id),
      name: updated.name || "Unnamed",
      email: updated.email,
      therapistStatus: updated.therapistStatus || "pending",
      certificateUrl: updated.certificateUrl || "",
      createdAt: updated.createdAt,
    })
  } catch (err) {
    console.error("Admin therapist PATCH error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}