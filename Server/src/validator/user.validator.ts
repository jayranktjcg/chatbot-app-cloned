import Joi from 'joi';

// Google Sign-In User Creation Validator
export const googleUserSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': `Email must be a valid email address.`,
        'any.required': `Email is required.`
    }),

    family_name: Joi.string().min(1).messages({
        'string.base': `Family Name must be a string.`,
        'string.empty': `Family Name cannot be empty.`,
        'any.required': `Family Name is required.`
    }),

    given_name: Joi.string().min(1).messages({
        'string.base': `Given Name must be a string.`,
        'string.empty': `Given Name cannot be empty.`,
        'any.required': `Given Name is required.`
    }),

    id: Joi.string().pattern(/^\d+$/).messages({
        'string.pattern.base': `ID must be a valid numeric string.`,
        'any.required': `ID is required.`
    }),

    name: Joi.string().min(1).required().messages({
        'string.base': `Name must be a string.`,
        'string.empty': `Name cannot be empty.`,
        'any.required': `Name is required.`
    }),

    profile_picture: Joi.string().uri().messages({
        'string.uri': `Profile Picture must be a valid URL.`,
        'any.required': `Profile Picture is required.`
    }),
});
