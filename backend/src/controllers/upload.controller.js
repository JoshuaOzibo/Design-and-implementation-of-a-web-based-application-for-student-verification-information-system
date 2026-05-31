import * as uploadService from "../services/upload.service.js";
import ApiError from "../utils/ApiError.js";

/**
 * Handle student photo upload request
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Please upload an image file (JPEG, PNG, or WEBP)");
    }

    const data = await uploadService.uploadPhoto(req.file);

    res.status(201).json({
      success: true,
      message: "Student photo uploaded successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle student photo deletion request
 */
export const deleteFile = async (req, res, next) => {
  try {
    const publicId = req.body.publicId || req.query.publicId;
    
    if (!publicId) {
      throw new ApiError(400, "publicId is required to delete an image");
    }

    await uploadService.deletePhoto(publicId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
