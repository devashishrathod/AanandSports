const Joi = require("joi");
const objectId = require("./validJoiObjectId");

const featureSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Feature title is required",
  }),
  description: Joi.string().required().messages({
    "any.required": "Feature description is required",
  }),
});

exports.validateCreateSportGround = (data) => {
  const createSchema = Joi.object({
    academyId: objectId().required().messages({
      "any.required": "academyId is required",
      "any.invalid": "Invalid academyId format",
    }),
    sportId: objectId().required().messages({
      "any.required": "sportId is required",
      "any.invalid": "Invalid sportId format",
    }),
    categoryId: objectId().required().messages({
      "any.required": "categoryId is required",
      "any.invalid": "Invalid categoryId format",
    }),
    name: Joi.string().min(3).max(120).required().messages({
      "string.min": "Name has minimum {#limit} characters",
      "string.max": "Name cannot exceed {#limit} characters",
    }),
    description: Joi.string().allow("").max(300).messages({
      "string.max": "Description cannot exceed {#limit} characters",
    }),
    price: Joi.number().min(0).required(),
    coach: Joi.string().allow("").max(120).optional(),
    openingTime: Joi.string().allow("").max(30).optional(),
    closingTime: Joi.string().allow("").max(30).optional(),
    level: Joi.string().optional(),
    maxPlayers: Joi.number().required().messages({
      "any.required": "maxPlayers is required",
    }),
    minPlayers: Joi.number().optional(),
    maxTeams: Joi.number().optional(),
    minTeams: Joi.number().optional(),
    features: Joi.array().items(featureSchema).optional(),
    isPrivate: Joi.boolean().optional(),
    isAvailable: Joi.boolean().optional(),
    isFull: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
  });

  return createSchema.validate(data, { abortEarly: false });
};

exports.validateUpdateSportGround = (payload) => {
  const updateSchema = Joi.object({
    sportId: objectId().messages({
      "any.invalid": "Invalid sportId format",
    }),
    categoryId: objectId().messages({
      "any.invalid": "Invalid categoryId format",
    }),
    name: Joi.string().min(3).max(120).messages({
      "string.min": "Name has minimum {#limit} characters",
      "string.max": "Name cannot exceed {#limit} characters",
    }),
    description: Joi.string().allow("").max(300).messages({
      "string.max": "Description cannot exceed {#limit} characters",
    }),
    price: Joi.number().min(0).optional(),
    coach: Joi.string().allow("").max(120).optional(),
    openingTime: Joi.string().allow("").max(30).optional(),
    closingTime: Joi.string().allow("").max(30).optional(),
    level: Joi.string().optional(),
    maxPlayers: Joi.number().optional(),
    minPlayers: Joi.number().optional(),
    maxTeams: Joi.number().optional(),
    minTeams: Joi.number().optional(),
    features: Joi.array().items(featureSchema).optional(),
    isPrivate: Joi.boolean().optional(),
    isAvailable: Joi.boolean().optional(),
    isFull: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
  });

  return updateSchema.validate(payload, { abortEarly: false });
};

exports.validateGetAllSportGroundsQuery = (payload) => {
  const getAllQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional(),
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    coach: Joi.string().optional(),
    level: Joi.string().optional(),
    openingTime: Joi.string().optional(),
    closingTime: Joi.string().optional(),
    academyId: objectId().optional().messages({
      "any.invalid": "Invalid academyId format",
    }),
    sportId: objectId().optional().messages({
      "any.invalid": "Invalid sportId format",
    }),
    categoryId: objectId().optional().messages({
      "any.invalid": "Invalid categoryId format",
    }),
    isActive: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
    isAvailable: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
    isPrivate: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
    isFull: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
    maxPlayers: Joi.number().integer().min(1).optional(),
    minPlayers: Joi.number().integer().min(1).optional(),
    maxTeams: Joi.number().integer().min(1).optional(),
    minTeams: Joi.number().integer().min(1).optional(),
    fromSlotDate: Joi.string().optional(),
    toSlotDate: Joi.string().optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").optional(),
  });

  return getAllQuerySchema.validate(payload, { abortEarly: false });
};
