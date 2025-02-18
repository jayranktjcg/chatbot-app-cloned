import Joi from "joi";

export const textToSpeechSchema = Joi.object({
    context: Joi.string()
        .trim()
        .required()
        .max(5000)
        .messages({
            "string.base": "Input must be a string.",
            "string.empty": "Input text is required.",
            "string.max": "Input text cannot exceed 5000 characters.",
        }),
});

// Update Directory/File Validation
export const answerValidationSchema = Joi.object({
    question_id: Joi.number().integer().min(0).required().messages({
        "number.base": "Question ID must be a number.",
        "number.integer": "Question ID must be an integer.",
        "number.min": "Question ID cannot be negative.",
        "any.required": "Question ID is required.",
    }),
    selected_answer: Joi.string().trim().required().messages({
        "string.base": "Answer must be a string.",
        "string.empty": "Answer is required.",
        "any.required": "Answer is required.",
    }),
});


//  Schema that accepts **only an array of answers** (at least 1)
export const multipleAnswersValidationSchema = Joi.array()
    .items(answerValidationSchema)
    .min(1)
    .required()
    .messages({
        "array.base": "Answers must be provided as an array.",
        "array.min": "At least one answer is required.",
        "any.required": "Answers array is required.",
    });

// Update Directory/File Validation
export const quizResultValidationSchema = Joi.object({
    message_id: Joi.number().integer().min(0).required().messages({
        "number.base": "Question ID must be a number.",
        "number.integer": "Question ID must be an integer.",
        "number.min": "Question ID cannot be negative.",
        "any.required": "Question ID is required.",
    }),
});