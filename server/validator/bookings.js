const Joi = require("joi");
const objectId = require("./validJoiObjectId");

exports.validateCreateBooking = (data) => {
  const createSchema = Joi.object({
    userId: objectId().optional().messages({
      "any.invalid": "Invalid userId format",
    }),
    sportGroundId: objectId().required().messages({
      "any.required": "sportGroundId is required",
      "any.invalid": "Invalid sportGroundId format",
    }),
    price: Joi.number().min(0).optional(),
    status: Joi.string().valid("pending", "confirmed", "cancelled").optional(),
    paymentStatus: Joi.string().valid("pending", "paid", "failed").optional(),
    paymentId: Joi.string().allow("").optional(),
  });
  return createSchema.validate(data, { abortEarly: false });
};

exports.validateUpdateBooking = (data) => {
  const updateSchema = Joi.object({
    userId: objectId().optional().messages({
      "any.invalid": "Invalid userId format",
    }),
    sportGroundId: objectId().optional().messages({
      "any.invalid": "Invalid sportGroundId format",
    }),
    price: Joi.number().min(0).optional(),
    status: Joi.string().valid("pending", "confirmed", "cancelled").optional(),
    paymentStatus: Joi.string().valid("pending", "paid", "failed").optional(),
    paymentId: Joi.string().allow("").optional(),
  });
  return updateSchema.validate(data, { abortEarly: false });
};

exports.validateGetAllBookingsQuery = (payload) => {
  const getAllQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    userId: objectId().optional().messages({
      "any.invalid": "Invalid userId format",
    }),
    academyId: objectId().optional().messages({
      "any.invalid": "Invalid academyId format",
    }),
    sportGroundId: objectId().optional().messages({
      "any.invalid": "Invalid sportGroundId format",
    }),
    status: Joi.string().valid("pending", "confirmed", "cancelled").optional(),
    paymentStatus: Joi.string().valid("pending", "paid", "failed").optional(),
    paymentId: Joi.string().optional(),
    fromStartTime: Joi.date().iso().optional(),
    toStartTime: Joi.date().iso().optional(),
    fromEndTime: Joi.date().iso().optional(),
    toEndTime: Joi.date().iso().optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").optional(),
  });
  return getAllQuerySchema.validate(payload, { abortEarly: false });
};
