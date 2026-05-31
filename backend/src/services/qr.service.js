import QRIdentity from "../models/QRIdentity.js";
import Student from "../models/Student.js";
import VerificationLog from "../models/VerificationLog.js";
import ApiError from "../utils/ApiError.js";
import { config } from "../config/env_config.js";
import QRCode from "qrcode";
import crypto from "crypto";

/**
 * Generate a unique QR identity for a student
 * @param {string} studentId - Student ObjectID
 * @returns {Promise<object>} Generated QRIdentity record
 */
export const generateQR = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  // If QR Identity already exists, return it
  let qrIdentity = await QRIdentity.findOne({ student: studentId });
  if (qrIdentity) {
    return qrIdentity;
  }

  // Generate random verification ID token
  const verificationId = crypto.randomBytes(16).toString("hex");
  
  // Verification URL encoded inside the QR
  const verificationUrl = `${config.appUrl}/api/v1/qr/verify/${verificationId}`;

  // Generate base64 data URI representation of the QR image
  const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 300,
  });

  qrIdentity = await QRIdentity.create({
    student: studentId,
    verificationId,
    qrCodeUrl,
    verificationUrl,
  });

  return qrIdentity;
};

/**
 * Regenerate and replace a student's QR identity
 * @param {string} studentId - Student ObjectID
 * @returns {Promise<object>} Newly generated QRIdentity record
 */
export const regenerateQR = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  // Delete existing QRIdentity if any
  await QRIdentity.deleteOne({ student: studentId });

  // Generate new verification ID token
  const verificationId = crypto.randomBytes(16).toString("hex");
  
  // Verification URL
  const verificationUrl = `${config.appUrl}/api/v1/qr/verify/${verificationId}`;

  // Generate new base64 data URI QR image
  const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 300,
  });

  const qrIdentity = await QRIdentity.create({
    student: studentId,
    verificationId,
    qrCodeUrl,
    verificationUrl,
  });

  return qrIdentity;
};

/**
 * Verify student QR identity scanned by a staff officer
 * @param {string} verificationId - QR verification ID
 * @param {string} staffId - Staff user ObjectID (scanned by)
 * @param {string} location - Checkpoint location
 * @returns {Promise<object>} Verification result (status & student profile)
 */
export const verifyQR = async (verificationId, staffId, location = "Gate Checkpoint") => {
  const qrIdentity = await QRIdentity.findOne({ verificationId }).populate({
    path: "student",
    populate: { path: "faculty department" },
  });

  // Handle invalid/non-existent QR code ID
  if (!qrIdentity) {
    await VerificationLog.create({
      staff: staffId,
      matricNumber: "INVALID_QR_SCAN",
      type: "QR Scan",
      location,
      status: "failed",
      reason: `Scan failed: Verification ID '${verificationId}' not found`,
    });
    
    throw new ApiError(404, "QR Identity code not recognized or invalid");
  }

  const student = qrIdentity.student;

  // Handle inactive QR identity
  if (!qrIdentity.isActive) {
    await VerificationLog.create({
      staff: staffId,
      student: student ? student._id : undefined,
      matricNumber: student ? student.matricNumber : "INACTIVE_QR",
      type: "QR Scan",
      location,
      status: "failed",
      reason: "Scan failed: QR Identity has been deactivated",
    });

    throw new ApiError(400, "This QR Identity code has been deactivated");
  }

  if (!student) {
    throw new ApiError(404, "Associated student profile no longer exists");
  }

  // Handle suspended or inactive student status
  if (student.status !== "active") {
    await VerificationLog.create({
      staff: staffId,
      student: student._id,
      matricNumber: student.matricNumber,
      type: "QR Scan",
      location,
      status: "failed",
      reason: `Scan failed: Student status is '${student.status}'`,
    });

    return {
      verified: false,
      status: "failed",
      reason: `Student status is currently '${student.status}'`,
      student,
    };
  }

  // Success: Log verified event
  await VerificationLog.create({
    staff: staffId,
    student: student._id,
    matricNumber: student.matricNumber,
    type: "QR Scan",
    location,
    status: "verified",
  });

  return {
    verified: true,
    status: "verified",
    student,
  };
};
