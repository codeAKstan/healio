import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "patient", "therapist"], default: "patient" },
    name: { type: String },
    age: { type: Number },
    gender: { type: String },
    certificateUrl: { type: String },
    therapistStatus: { type: String, enum: ["pending", "approved"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

// Ensure schema updates take effect during Next.js dev hot reload
// by removing the cached model before re-defining it.
if (mongoose.models.User) {
  mongoose.deleteModel("User")
}
const User = mongoose.model("User", UserSchema)
export default User