const Joi = require("joi");

exports.validateVerifyRazorpayPayment = (data) => {
  const schema = Joi.object({
    razorpay_order_id: Joi.string().trim().required().messages({
      "any.required": "razorpay_order_id is required",
    }),
    razorpay_payment_id: Joi.string().trim().required().messages({
      "any.required": "razorpay_payment_id is required",
    }),
    razorpay_signature: Joi.string().trim().required().messages({
      "any.required": "razorpay_signature is required",
    }),
  });

  return schema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });
};
