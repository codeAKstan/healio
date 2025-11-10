import mongoose from "mongoose"

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true }, // e.g., "appointment"
    title: { type: String, required: true },
    body: { type: String },
    data: { type: Object },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

if (mongoose.models.Notification) {
  mongoose.deleteModel("Notification")
}
const Notification = mongoose.model("Notification", NotificationSchema)
export default Notification