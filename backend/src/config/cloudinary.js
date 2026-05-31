import { v2 as cloudinary } from "cloudinary";
import { config } from "./env_config.js";
import logger from "../utils/logger.js";

const { cloudName, apiKey, apiSecret } = config.cloudinary;

const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  logger.info("☁️ Cloudinary successfully configured.");
} else {
  logger.warn("⚠️ Cloudinary credentials missing. File uploads will fallback to local filesystem storage.");
}

export { cloudinary, isCloudinaryConfigured };
export default cloudinary;
