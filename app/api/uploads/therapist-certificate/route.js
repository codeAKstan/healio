import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export const runtime = "edge"

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get("file")
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    const allowed = ["application/pdf", "image/jpeg", "image/png"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 })
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return NextResponse.json({ error: "Blob token missing" }, { status: 500 })
    }

    const fileName = `therapist-certificates/${Date.now()}-${file.name}`
    const { url } = await put(fileName, file, {
      access: "public",
      token,
      addRandomSuffix: true,
      contentType: file.type,
    })

    return NextResponse.json({ url })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}