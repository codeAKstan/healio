import mongoose from "mongoose"

const AppointmentSchema = new mongoose.Schema(
  {
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm
    sessionType: { type: String, enum: ["video-call", "in-person"], default: "video-call" },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

if (mongoose.models.Appointment) {
  mongoose.deleteModel("Appointment")
}
const Appointment = mongoose.model("Appointment", AppointmentSchema)
export default Appointment