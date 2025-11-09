import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { jwtVerify } from "jose"
import DashboardClientLayout from "@/components/dashboard/layout-client"

const JWT_SECRET = process.env.JWT_SECRET

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch (e) {
    return null
  }
}

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) {
    redirect("/login")
  }
  const payload = await verifyToken(token)
  if (!payload) {
    redirect("/login")
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>
}
