const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Validation Middleware
 * Handles validation errors from express-validator
 */

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    logger.warn(`Validation failed: ${JSON.stringify(errorMessages)}`);

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
  }

  next();
};

module.exports = validate;
