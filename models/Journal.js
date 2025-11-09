import mongoose from "mongoose"

const JournalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    mood: {
      type: String,
      enum: ["happy", "sad", "anxious", "angry", "neutral"],
      default: "neutral",
    },
  },
  { timestamps: true },
)

// Avoid OverwriteModelError in dev by deleting cached model first
const modelName = "Journal"
if (mongoose.connection.models[modelName]) {
  delete mongoose.connection.models[modelName]
}

export default mongoose.models[modelName] || mongoose.model(modelName, JournalSchema)