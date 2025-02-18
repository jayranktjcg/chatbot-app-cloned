import Joi from "joi";

// Create Directory/File Validation
export const createDirectorySchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).required().messages({
        "string.base": "Name must be a string.",
        "string.empty": "Name is required.",
        "string.min": "Name must be at least 1 character long.",
        "string.max": "Name cannot exceed 255 characters.",
        "any.required": "Name is required.",
    }),
    type: Joi.string().valid("directory", "file").required().messages({
        "any.only": "Type must be either 'directory' or 'file'.",
        "any.required": "Type is required.",
    }),
    parentId: Joi.number().integer().min(0).optional().messages({
        "number.base": "Parent ID must be a number.",
        "number.integer": "Parent ID must be an integer.",
        "number.min": "Parent ID cannot be negative.",
    }),
    messageId: Joi.number().integer().optional().messages({
        "number.base": "Message ID must be a number.",
        "number.integer": "Message ID must be an integer.",
    }),
});

// Update Directory/File Validation
export const updateDirectorySchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).required().messages({
        "string.base": "Name must be a string.",
        "string.empty": "Name is required.",
        "string.min": "Name must be at least 1 character long.",
        "string.max": "Name cannot exceed 255 characters.",
        "any.required": "Name is required.",
    }),
});

// Move File Validation
export const moveFileSchema = Joi.object({
    newParentId: Joi.number().integer().min(0).required().messages({
        "number.base": "New Parent ID must be a number.",
        "number.integer": "New Parent ID must be an integer.",
        "number.min": "New Parent ID cannot be negative.",
        "any.required": "New Parent ID is required.",
    }),
});
