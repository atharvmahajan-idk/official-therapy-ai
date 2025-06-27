import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required:true,
    },
  } 
);

const journalSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required:true,
      lowercase: true,
      trim: true,
    },
    entries: {
        type: [journalEntrySchema],
        default: [], 
      },
  },
  { timestamps: true } 
);

const Journal = mongoose.model("Journal", journalSchema);

export { Journal };