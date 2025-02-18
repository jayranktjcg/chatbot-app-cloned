import Joi from "joi";

// Joi schema for creating a plan
export const createPlanSchema = Joi.object({
	name: Joi.string().required().messages({
		"string.empty": "Name is required",
		"any.required": "Name is required",
	}),
	duration: Joi.string().required().messages({
		"string.empty": "Duration is required",
		"any.required": "Duration is required",
	}),
	price: Joi.number().positive().required().messages({
		"number.base": "Price must be a number",
		"number.positive": "Price must be a positive number",
		"any.required": "Price is required",
	}),
});
