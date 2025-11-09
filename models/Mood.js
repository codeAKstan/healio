import mongoose from "mongoose"

const MoodSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mood: { type: String, enum: ["happy", "sad", "anxious", "angry", "neutral"], required: true },
    intensity: { type: Number, min: 1, max: 10, required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

if (mongoose.models.Mood) {
  mongoose.deleteModel("Mood")
}
const Mood = mongoose.model("Mood", MoodSchema)
export default Mood