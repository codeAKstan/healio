import mongoose from "mongoose"

const AvailabilitySchema = new mongoose.Schema(
  {
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    day: { type: String, required: true }, // e.g., "Monday"
    from: { type: String, required: true }, // e.g., "09:00"
    to: { type: String, required: true },   // e.g., "12:00"
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

if (mongoose.models.Availability) {
  mongoose.deleteModel("Availability")
}
const Availability = mongoose.model("Availability", AvailabilitySchema)
export default Availability