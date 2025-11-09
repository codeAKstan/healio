import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password, role, certificateUrl, name, age, gender } = body

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["patient", "therapist"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await connectToDatabase()
    console.log("[register] incoming:", { email, role, name, age, gender })
    const exists = await User.findOne({ email })
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const doc = {
      email,
      passwordHash,
      role,
      name,
      age,
      gender,
    }

    if (role === "therapist") {
      if (!certificateUrl) {
        return NextResponse.json({ error: "Certificate is required for therapists" }, { status: 400 })
      }
      doc.certificateUrl = certificateUrl
      doc.therapistStatus = "pending"
    }

    const user = await User.create(doc)
    console.log("[register] created:", { id: String(user._id), role: user.role, name: user.name, age: user.age, gender: user.gender })

    return NextResponse.json({
      message: "Registered successfully",
      id: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
      age: user.age,
      gender: user.gender,
      therapistStatus: user.therapistStatus,
    })
  } catch (err) {
    console.error("Register error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}