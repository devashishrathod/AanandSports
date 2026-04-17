const Joi = require("joi");
const objectId = require("./validJoiObjectId");

exports.validateCreateCourt = (payload) => {
  const createSchema = Joi.object({
    name: Joi.string().min(2).max(120).required(),
    description: Joi.string().allow("").max(500).optional(),
    groundId: objectId().required().messages({
      "any.required": "groundId is required",
      "any.invalid": "Invalid groundId format",
    }),
    sportId: objectId().required().messages({
      "any.required": "sportId is required",
      "any.invalid": "Invalid sportId format",
    }),
    pricePerHour: Joi.number().min(0).optional(),
    status: Joi.string().valid("available", "booked", "maintenance").optional(),
    isActive: Joi.boolean().optional(),
  });

  return createSchema.validate(payload, { abortEarly: false });
};

exports.validateUpdateCourt = (payload) => {
  const updateSchema = Joi.object({
    name: Joi.string().min(2).max(120).optional(),
    description: Joi.string().allow("").max(500).optional(),
    groundId: objectId().optional().messages({
      "any.invalid": "Invalid groundId format",
    }),
    sportId: objectId().optional().messages({
      "any.invalid": "Invalid sportId format",
    }),
    pricePerHour: Joi.number().min(0).optional(),
    status: Joi.string().valid("available", "booked", "maintenance").optional(),
    isActive: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
  });

  return updateSchema.validate(payload, { abortEarly: false });
};

exports.validateGetAllCourtsQuery = (payload) => {
  const getAllQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional(),
    name: Joi.string().optional(),
    groundId: objectId().optional().messages({
      "any.invalid": "Invalid groundId format",
    }),
    sportId: objectId().optional().messages({
      "any.invalid": "Invalid sportId format",
    }),
    status: Joi.string().valid("available", "booked", "maintenance").optional(),
    isActive: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").optional(),
  });

  return getAllQuerySchema.validate(payload, { abortEarly: false });
};
