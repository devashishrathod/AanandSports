const Joi = require("joi");
const objectId = require("./validJoiObjectId");

exports.validateCreateCourtBooking = (payload) => {
  const schema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          courtId: objectId().required().messages({
            "any.required": "courtId is required",
            "any.invalid": "Invalid courtId format",
          }),
          startTime: Joi.date().iso().required().messages({
            "any.required": "startTime is required",
          }),
        }),
      )
      .min(1)
      .required(),
    paymentStatus: Joi.string().valid("pending", "paid", "failed").optional(),
    paymentId: Joi.string().allow("").optional(),
  });

  return schema.validate(payload, { abortEarly: false });
};

exports.validateUpdateCourtBooking = (payload) => {
  const schema = Joi.object({
    status: Joi.string().valid("pending", "confirmed", "cancelled").optional(),
    paymentStatus: Joi.string().valid("pending", "paid", "failed").optional(),
    paymentId: Joi.string().allow("").optional(),
  });

  return schema.validate(payload, { abortEarly: false });
};

exports.validateGetAllCourtBookingsQuery = (payload) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    userId: objectId().optional().messages({
      "any.invalid": "Invalid userId format",
    }),
    academyId: objectId().optional().messages({
      "any.invalid": "Invalid academyId format",
    }),
    groundId: objectId().optional().messages({
      "any.invalid": "Invalid groundId format",
    }),
    courtId: objectId().optional().messages({
      "any.invalid": "Invalid courtId format",
    }),
    sportId: objectId().optional().messages({
      "any.invalid": "Invalid sportId format",
    }),
    status: Joi.string().valid("pending", "confirmed", "cancelled").optional(),
    paymentStatus: Joi.string().valid("pending", "paid", "failed").optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").optional(),
  });

  return schema.validate(payload, { abortEarly: false });
};
