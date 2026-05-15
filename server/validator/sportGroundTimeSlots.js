const Joi = require("joi");
const objectId = require("./validJoiObjectId");

const timeWindowSchema = Joi.object({
  startTime: Joi.string().required().messages({
    "any.required": "startTime is required",
  }),
  endTime: Joi.string().required().messages({
    "any.required": "endTime is required",
  }),
});

exports.validateCreateSportGroundTimeSlotRange = (payload) => {
  const schema = Joi.object({
    sportGroundId: objectId().required().messages({
      "any.required": "sportGroundId is required",
      "any.invalid": "Invalid sportGroundId format",
    }),
    startDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        "any.required": "startDate is required",
        "string.pattern.base": "startDate must be in YYYY-MM-DD format",
      }),
    endDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        "any.required": "endDate is required",
        "string.pattern.base": "endDate must be in YYYY-MM-DD format",
      }),
    timeSlots: Joi.array().items(timeWindowSchema).min(1).required().messages({
      "any.required": "timeSlots is required",
      "array.min": "At least one time slot is required",
    }),
  });

  return schema.validate(payload, { abortEarly: false });
};

exports.validateGetAllSportGroundTimeSlotsQuery = (payload) => {
  const schema = Joi.object({
    sportGroundId: objectId().optional().messages({
      "any.invalid": "Invalid sportGroundId format",
    }),
    sportDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .messages({
        "string.pattern.base": "sportDate must be in YYYY-MM-DD format",
      }),
    fromDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .messages({
        "string.pattern.base": "fromDate must be in YYYY-MM-DD format",
      }),
    toDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .messages({
        "string.pattern.base": "toDate must be in YYYY-MM-DD format",
      }),
    isActive: Joi.boolean().optional(),
    isAvailable: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
  });

  return schema.validate(payload, { abortEarly: false });
};

exports.validateUpdateSportGroundTimeSlot = (payload) => {
  const schema = Joi.object({
    startDateTime: Joi.date().iso().optional().messages({
      "date.format": "startDateTime must be ISO date",
    }),
    endDateTime: Joi.date().iso().optional().messages({
      "date.format": "endDateTime must be ISO date",
    }),
    isAvailable: Joi.boolean().optional(),
    isFull: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
  });

  return schema.validate(payload, { abortEarly: false });
};
