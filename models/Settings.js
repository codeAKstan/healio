import mongoose from "mongoose"

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    brandName: { type: String, default: "Healio" },
    logoUrl: { type: String },
    emailFromName: { type: String, default: "Healio Admin" },
    emailFromAddress: { type: String, default: "no-reply@healio.local" },
    allowSelfRegistration: { type: Boolean, default: true },
    autoApproveTherapists: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

SettingsSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Avoid OverwriteModelError in dev
if (mongoose.models.Settings) {
  mongoose.deleteModel("Settings")
}
const Settings = mongoose.model("Settings", SettingsSchema)
export default Settings