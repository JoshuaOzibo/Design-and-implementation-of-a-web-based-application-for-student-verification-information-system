import mongoose from "mongoose";

const qrIdentitySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student association is required"],
      unique: true,
      index: true,
    },
    verificationId: {
      type: String,
      required: [true, "Verification ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    qrCodeUrl: {
      type: String,
      required: [true, "QR code image URL is required"],
    },
    verificationUrl: {
      type: String,
      required: [true, "Verification URL is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const QRIdentity = mongoose.model("QRIdentity", qrIdentitySchema);

export default QRIdentity;
export { QRIdentity };
