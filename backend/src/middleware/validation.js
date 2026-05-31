import { z } from "zod";

/**
 * Middleware wrapper to validate incoming request data using Zod schema.
 * Supports validation for req.body, req.query, and req.params.
 * 
 * @param {object} schemas - Object containing Zod schemas for body, query, and/or params
 * @returns {Function} Express middleware function
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    const validSchemaObject = {};
    const dataToValidate = {};

    if (schemas.body) {
      validSchemaObject.body = schemas.body;
      dataToValidate.body = req.body;
    }
    if (schemas.query) {
      validSchemaObject.query = schemas.query;
      dataToValidate.query = req.query;
    }
    if (schemas.params) {
      validSchemaObject.params = schemas.params;
      dataToValidate.params = req.params;
    }

    const schema = z.object(validSchemaObject);
    const parsed = schema.parse(dataToValidate);

    // Update req properties with parsed & typed values (stripping unknown keys)
    if (schemas.body) req.body = parsed.body;
    if (schemas.query) {
      // Clear original query parameters to ensure unknown keys are stripped
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, parsed.query);
    }
    if (schemas.params) {
      Object.keys(req.params).forEach((key) => delete req.params[key]);
      Object.assign(req.params, parsed.params);
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default validate;
