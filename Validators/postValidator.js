import Joi from "joi";

const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(500).required().messages({
    'string.base': 'Post content must be text',
    'string.min': 'Post cannot be empty',
    'string.max': 'Post cannot exceed 500 characters',
    'any.required': 'Post content is required'
  })
});

export default createPostSchema
