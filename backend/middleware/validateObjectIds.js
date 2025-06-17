import mongoose from "mongoose";

/**
 * Middleware to validate MongoDB ObjectIds in request body
 * @param {string[]} idFields - Array of field names to validate
 * @returns {Function} Express middleware function
 */
const validateObjectIds = (idFields) => {
  return (req, res, next) => {
    try {
      // Check each specified ID field
      for (const field of idFields) {
        const value = req.body[field];

        // Skip if field is not required and not provided
        if (value === undefined || value === null) {
          continue;
        }

        // Handle array of IDs
        if (Array.isArray(value)) {
          for (const id of value) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
              return res.status(400).json({
                success: false,
                message: `Invalid ID format in ${field} array`,
                field,
                value: id,
              });
            }
          }
        }
        // Handle single ID
        else {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return res.status(400).json({
              success: false,
              message: `Invalid ${field} format`,
              field,
              value,
            });
          }
        }
      }

      // All IDs are valid, proceed to next middleware
      next();
    } catch (err) {
      console.error("ID validation error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error during ID validation",
      });
    }
  };
};

export default validateObjectIds;
