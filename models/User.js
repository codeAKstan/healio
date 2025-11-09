import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "patient", "therapist"], default: "patient" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

export default mongoose.models.User || mongoose.model("User", UserSchema)