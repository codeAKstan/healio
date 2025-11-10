import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connectToDatabase } from "@/lib/mongodb"
import Settings from "@/models/Settings"
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
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = await verify(token)
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectToDatabase()
  let settings = await Settings.findOne({ key: "global" }).lean()
  if (!settings) {
    settings = await Settings.create({ key: "global" })
    settings = settings.toObject()
  }
  return NextResponse.json({ settings })
}

export async function PATCH(request) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = await verify(token)
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const allowed = [
    "brandName",
    "logoUrl",
    "emailFromName",
    "emailFromAddress",
    "allowSelfRegistration",
    "autoApproveTherapists",
  ]
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  await connectToDatabase()
  const doc = await Settings.findOneAndUpdate(
    { key: "global" },
    { $set: updates, $currentDate: { updatedAt: true } },
    { new: true, upsert: true }
  ).lean()

  return NextResponse.json({ settings: doc })
}