import Student from "../models/Student.js";
import VerificationLog from "../models/VerificationLog.js";
import * as qrService from "./qr.service.js";
import ApiError from "../utils/ApiError.js";

// Helper regex to validate MongoDB ObjectID
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Verify a student's status via one of three methods: matric, id, qr.
 * Creates an entry in VerificationLog.
 * 
 * @param {string} method - 'matric' | 'id' | 'qr'
 * @param {string} identifier - Matric number, Student ID (ObjectID), or QR verification ID
 * @param {string} staffId - Staff user ObjectID
 * @param {string} location - Checkpoint location
 * @returns {Promise<object>} Verification result mapping
 */
export const verifyStudent = async (method, identifier, staffId, location = "Gate Checkpoint") => {
  let result = null;

  switch (method) {
    case "matric": {
      const student = await Student.findOne({ matricNumber: identifier }).populate("faculty department");
      
      if (!student) {
        await VerificationLog.create({
          staff: staffId,
          matricNumber: identifier,
          type: "Matric",
          location,
          status: "failed",
          reason: `Verification failed: No student found with matric number '${identifier}'`,
        });
        throw new ApiError(404, `Student not found with Matric Number '${identifier}'`);
      }

      if (student.status !== "active") {
        await VerificationLog.create({
          staff: staffId,
          student: student._id,
          matricNumber: student.matricNumber,
          type: "Matric",
          location,
          status: "failed",
          reason: `Verification failed: Student status is '${student.status}'`,
        });

        result = {
          verified: false,
          status: "failed",
          reason: `Student status is currently '${student.status}'`,
          student,
          method: "Matric",
        };
      } else {
        await VerificationLog.create({
          staff: staffId,
          student: student._id,
          matricNumber: student.matricNumber,
          type: "Matric",
          location,
          status: "verified",
        });

        result = {
          verified: true,
          status: "verified",
          student,
          method: "Matric",
        };
      }
      break;
    }

    case "id": {
      if (!objectIdRegex.test(identifier)) {
        throw new ApiError(400, "Invalid Student ID format. Must be a 24-character hexadecimal string.");
      }

      const student = await Student.findById(identifier).populate("faculty department");
      
      if (!student) {
        await VerificationLog.create({
          staff: staffId,
          matricNumber: "UNKNOWN_ID",
          type: "Student ID",
          location,
          status: "failed",
          reason: `Verification failed: No student found with ID '${identifier}'`,
        });
        throw new ApiError(404, `Student not found with ID '${identifier}'`);
      }

      if (student.status !== "active") {
        await VerificationLog.create({
          staff: staffId,
          student: student._id,
          matricNumber: student.matricNumber,
          type: "Student ID",
          location,
          status: "failed",
          reason: `Verification failed: Student status is '${student.status}'`,
        });

        result = {
          verified: false,
          status: "failed",
          reason: `Student status is currently '${student.status}'`,
          student,
          method: "Student ID",
        };
      } else {
        await VerificationLog.create({
          staff: staffId,
          student: student._id,
          matricNumber: student.matricNumber,
          type: "Student ID",
          location,
          status: "verified",
        });

        result = {
          verified: true,
          status: "verified",
          student,
          method: "Student ID",
        };
      }
      break;
    }

    case "qr": {
      // Reuse the verification logic inside qr.service
      const qrResult = await qrService.verifyQR(identifier, staffId, location);
      
      result = {
        verified: qrResult.verified,
        status: qrResult.status,
        reason: qrResult.reason || undefined,
        student: qrResult.student,
        method: "QR Scan",
      };
      break;
    }

    default:
      throw new ApiError(400, "Unsupported verification method");
  }

  // Inject common response fields
  return {
    ...result,
    timestamp: new Date().toISOString(),
  };
};
