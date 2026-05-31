import mongoose from "mongoose";

const verificationLogSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Staff association is required"],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: false,
    },
    matricNumber: {
      type: String,
      required: [true, "Queried Matric number is required"],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, "Verification method type is required"],
      enum: {
        values: ["Matric", "Student ID", "QR Scan"],
        message: "{VALUE} is not a valid verification type",
      },
    },
    location: {
      type: String,
      required: [true, "Verification location is required"],
      trim: true,
    },
    status: {
      type: String,
      required: [true, "Verification status is required"],
      enum: {
        values: ["verified", "failed"],
        message: "{VALUE} is not a valid verification status",
      },
      index: true,
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries/analytics
verificationLogSchema.index({ createdAt: -1 });

const VerificationLog = mongoose.model("VerificationLog", verificationLogSchema);

export default VerificationLog;
export { VerificationLog };
