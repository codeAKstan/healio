import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
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

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const payload = await verify(token)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const user = await User.findById(payload.sub).lean()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { _id, email, role, name, age, gender, therapistStatus, certificateUrl, createdAt } = user
    return NextResponse.json({
      id: String(_id),
      email,
      role,
      name,
      age,
      gender,
      therapistStatus,
      certificateUrl,
      createdAt,
    })
  } catch (err) {
    console.error("Me endpoint error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}