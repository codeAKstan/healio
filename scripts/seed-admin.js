// Usage: node scripts/seed-admin.js --email admin@example.com --password "StrongPass123!"
import "dotenv/config"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "../lib/mongodb.js"
import User from "../models/User.js"

function getArg(name) {
  const idx = process.argv.findIndex((a) => a === `--${name}`)
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1]
  return null
}

async function main() {
  const email = getArg("email")
  const password = getArg("password")

  if (!email || !password) {
    console.error("Missing --email or --password arguments")
    process.exit(1)
  }

  await connectToDatabase()

  const existingAdmin = await User.findOne({ role: "admin" })
  if (existingAdmin) {
    console.error("An admin already exists. No further admin accounts can be created.")
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const admin = new User({ email, passwordHash, role: "admin" })
  await admin.save()

  console.log(`Admin created: ${email}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})