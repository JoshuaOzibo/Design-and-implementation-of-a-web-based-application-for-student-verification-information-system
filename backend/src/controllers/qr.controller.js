import * as qrService from "../services/qr.service.js";

/**
 * Generate QR code identity for a student handler
 */
export const generateQR = async (req, res, next) => {
  try {
    const qrIdentity = await qrService.generateQR(req.params.studentId);
    res.status(201).json({
      success: true,
      message: "Student QR identity generated successfully",
      data: qrIdentity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate QR code identity for a student handler
 */
export const regenerateQR = async (req, res, next) => {
  try {
    const qrIdentity = await qrService.regenerateQR(req.params.studentId);
    res.status(200).json({
      success: true,
      message: "Student QR identity regenerated successfully",
      data: qrIdentity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify student QR identity handler
 */
export const verifyQR = async (req, res, next) => {
  try {
    const { verificationId } = req.params;
    const { location } = req.query; // optional checkpoint location
    
    // req.user is attached by protect middleware (holds the authenticated staff member)
    const result = await qrService.verifyQR(verificationId, req.user._id, location);

    res.status(200).json({
      success: true,
      message: result.verified ? "Student identity verified successfully" : "Student identity verification failed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
