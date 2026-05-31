import fs from "fs/promises";
import path from "path";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { config } from "../config/env_config.js";
import logger from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";

/**
 * Upload student photo.
 * If Cloudinary is configured, uploads to Cloudinary and deletes local temporary file.
 * Otherwise, retains local file and returns dynamic local URL.
 * 
 * @param {object} file - Express multer file object
 * @returns {Promise<object>} Image URL and public ID mapping
 */
export const uploadPhoto = async (file) => {
  if (!file) {
    throw new ApiError(400, "No file provided for upload");
  }

  try {
    if (isCloudinaryConfigured) {
      logger.info(`Uploading image ${file.filename} to Cloudinary...`);
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "svis/students",
        resource_type: "image",
      });

      // Cleanup local temporary file asynchronously
      await fs.unlink(file.path);
      logger.info(`Successfully uploaded to Cloudinary: ${result.secure_url}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } else {
      // Local fallback mode
      // Serves file under `${appUrl}/uploads/${filename}`
      const fileUrl = `${config.appUrl}/uploads/${file.filename}`;
      const publicId = `uploads/${file.filename}`;

      logger.info(`Successfully stored locally: ${fileUrl}`);
      return {
        url: fileUrl,
        publicId,
      };
    }
  } catch (error) {
    // Make sure we clean up the local file if Cloudinary upload failed
    if (isCloudinaryConfigured && file.path) {
      try {
        await fs.unlink(file.path);
      } catch (err) {
        logger.error(`Failed to delete temporary local file: ${err.message}`);
      }
    }
    logger.error(`Error uploading photo: ${error.message}`);
    throw new ApiError(500, `Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete student photo from storage.
 * If public ID indicates local storage, deletes from disk.
 * Otherwise, calls Cloudinary API.
 * 
 * @param {string} publicId - Storage asset unique public ID
 * @returns {Promise<void>}
 */
export const deletePhoto = async (publicId) => {
  if (!publicId) return;

  try {
    if (publicId.startsWith("uploads/")) {
      // Local file deletion
      const absolutePath = path.resolve(publicId);
      try {
        await fs.access(absolutePath);
        await fs.unlink(absolutePath);
        logger.info(`Successfully deleted local image file: ${publicId}`);
      } catch (err) {
        if (err.code === "ENOENT") {
          logger.warn(`Local file to delete did not exist: ${publicId}`);
        } else {
          throw err;
        }
      }
    } else if (isCloudinaryConfigured) {
      // Cloudinary deletion
      logger.info(`Deleting image ${publicId} from Cloudinary...`);
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === "ok") {
        logger.info(`Successfully deleted from Cloudinary: ${publicId}`);
      } else {
        logger.warn(`Cloudinary returned non-ok result for delete: ${JSON.stringify(result)}`);
      }
    } else {
      logger.warn(`Asset deletion requested for '${publicId}', but Cloudinary is not configured.`);
    }
  } catch (error) {
    logger.error(`Error deleting photo: ${error.message}`);
    // Non-blocking error for asset delete
  }
};
