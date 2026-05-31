import * as verificationService from "../services/verification.service.js";

/**
 * Handle student verification requests
 */
export const verifyStudent = async (req, res, next) => {
  try {
    const { method, identifier, location } = req.body;
    
    // req.user is attached by protect middleware (holds the authenticated staff member)
    const result = await verificationService.verifyStudent(method, identifier, req.user._id, location);

    res.status(200).json({
      success: true,
      message: result.verified ? "Student identity verified successfully" : "Student identity verification failed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
