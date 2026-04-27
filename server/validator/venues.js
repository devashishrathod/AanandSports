const Joi = require("joi");
const objectId = require("./validJoiObjectId");

exports.validateCreateVenue = (data) => {
  const createSchema = Joi.object({
    locationId: objectId().required().messages({
      "any.required": "locationId is required",
      "any.invalid": "Invalid locationId format",
    }),
    academyId: objectId()
      .optional()
      .message({ "any.invalid": "Invalid locationId format" }),
    name: Joi.string().min(3).max(120).required().messages({
      "string.min": "Name has minimum {#limit} characters",
      "string.max": "Name cannot exceed {#limit} characters",
    }),
    description: Joi.string().allow("").max(300).messages({
      "string.max": "Description cannot exceed {#limit} characters",
    }),
    isActive: Joi.boolean().optional(),
  });
  return createSchema.validate(data, { abortEarly: false });
};

exports.validateUpdateVenue = (payload) => {
  const updateSchema = Joi.object({
    locationId: objectId().messages({
      "any.invalid": "Invalid locationId format",
    }),
    name: Joi.string().min(3).max(120).messages({
      "string.min": "Name has minimum {#limit} characters",
      "string.max": "Name cannot exceed {#limit} characters",
    }),
    description: Joi.string().allow("").max(300).messages({
      "string.max": "Description cannot exceed {#limit} characters",
    }),
    isActive: Joi.boolean().optional(),
  });
  return updateSchema.validate(payload, { abortEarly: false });
};

exports.validateGetAllVenuesQuery = (payload) => {
  const getAllQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional(),
    name: Joi.string().optional(),
    locationId: objectId().optional().messages({
      "any.invalid": "Invalid locationId format",
    }),
    isActive: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").optional(),
  });
  return getAllQuerySchema.validate(payload, { abortEarly: false });
};
