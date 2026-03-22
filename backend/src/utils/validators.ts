import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: Joi.string().min(8).max(128).required(),
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  role: Joi.string().valid('student', 'instructor', 'admin', 'content_manager').default('student'),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: Joi.string().min(8).max(128).required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().trim().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required(),
  password: Joi.string().min(8).max(128).required(),
});

export const courseSchema = Joi.object({
  title: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().required(),
  instructor: Joi.string().optional(), // ObjectId, but validate as string
  category: Joi.string().required(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
  pricing: Joi.object({
    type: Joi.string().valid('free', 'paid', 'subscription').optional(),
    amount: Joi.number().default(0),
  }).optional(),
});

export const courseReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000).allow('').optional(),
});

export const contentSchema = Joi.object({
  type: Joi.string().valid('page', 'post', 'block').optional(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  slug: Joi.string().optional(),
  status: Joi.string().valid('draft', 'published').default('draft'),
});

export const validationMiddleware = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((detail) => detail.message),
      });
    }

    req.body = value;
    next();
  };
};