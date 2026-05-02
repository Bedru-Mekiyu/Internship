import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])./).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
    }),
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  role: Joi.string().valid('student', 'instructor').default('student'),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254).required(),
  password: Joi.string().min(8).max(128).required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().trim().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).optional(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required(),
  password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])./).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
    }),
});

export const contactCreateSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().lowercase().email().max(254).required(),
  phone: Joi.string().trim().allow('').max(32).optional(),
  message: Joi.string().trim().min(2).max(5000).required(),
});

export const contactAssignSchema = Joi.object({
  assignedTo: Joi.string().trim().allow('').optional(),
});

export const contactStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'in_progress', 'resolved').required(),
  reviewNotes: Joi.string().trim().allow('').max(2000).optional(),
});

export const courseSchema = Joi.object({
  title: Joi.string().required(),
  slug: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  shortDescription: Joi.string().allow('').optional(),
  thumbnail: Joi.string().uri().allow('').optional(),
  instructor: Joi.string().optional(),
  category: Joi.string().allow('').optional(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
  status: Joi.string().valid('draft', 'published', 'archived').optional(),
  visibility: Joi.string().valid('Draft', 'Published').optional(),
  featured: Joi.boolean().optional(),
  pricing: Joi.object({
    type: Joi.string().valid('free', 'paid', 'subscription').optional(),
    amount: Joi.number().default(0),
    currency: Joi.string().max(8).optional(),
  }).optional(),
});

export const courseReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000).allow('').optional(),
});

export const moduleSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().allow('').max(2000).optional(),
  type: Joi.string().trim().max(40).optional(),
  order: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid('draft', 'published').default('draft'),
});

const lessonAttachmentSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  size: Joi.string().trim().allow('').max(32).optional(),
  url: Joi.string().trim().allow('').max(2048).optional(),
  mediaId: Joi.string().trim().allow('').optional(),
});

export const lessonSchema = Joi.object({
  title: Joi.string().trim().min(2).max(160).required(),
  content: Joi.string().allow('').optional(),
  videoUrl: Joi.string().trim().allow('').max(2048).optional(),
  type: Joi.string().valid('video', 'text', 'quiz', 'assignment').required(),
  duration: Joi.number().integer().min(0).optional(),
  notes: Joi.string().trim().allow('').max(4000).optional(),
  attachments: Joi.array().items(lessonAttachmentSchema).max(20).optional(),
  status: Joi.string().valid('draft', 'published', 'scheduled').optional(),
  order: Joi.number().integer().min(0).optional(),
});

export const moduleUpdateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120).optional(),
  description: Joi.string().trim().allow('').max(2000).optional(),
  type: Joi.string().trim().max(40).optional(),
  order: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid('draft', 'published').optional(),
}).min(1);

export const lessonUpdateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(160).optional(),
  content: Joi.string().allow('').optional(),
  videoUrl: Joi.string().trim().allow('').max(2048).optional(),
  type: Joi.string().valid('video', 'text', 'quiz', 'assignment').optional(),
  duration: Joi.number().integer().min(0).optional(),
  notes: Joi.string().trim().allow('').max(4000).optional(),
  attachments: Joi.array().items(lessonAttachmentSchema).max(20).optional(),
  status: Joi.string().valid('draft', 'published', 'scheduled').optional(),
  order: Joi.number().integer().min(0).optional(),
}).min(1);

export const reorderModulesSchema = Joi.object({
  moduleIds: Joi.array().items(Joi.string().trim().required()).min(0).required(),
});

export const reorderLessonsSchema = Joi.object({
  lessonIds: Joi.array().items(Joi.string().trim().required()).min(0).required(),
});

export const progressUpdateSchema = Joi.object({
  progress: Joi.number().min(0).max(100).required(),
});

export const assignmentCreateSchema = Joi.object({
  moduleId: Joi.string().trim().optional(),
  title: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().trim().min(2).max(5000).required(),
  dueDate: Joi.date().optional(),
});

export const submissionCreateSchema = Joi.object({
  content: Joi.string().trim().min(1).max(10000).required(),
});

export const submissionGradeSchema = Joi.object({
  grade: Joi.number().min(0).max(100).required(),
});

export const quizCreateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().trim().allow('').optional(),
  timeLimit: Joi.number().integer().min(1).optional(),
  attempts: Joi.number().integer().min(1).max(20).default(1),
  passingScore: Joi.number().min(0).max(100).default(70),
  isPublished: Joi.boolean().default(true),
  questions: Joi.array().items(
    Joi.object({
      question: Joi.string().trim().min(2).max(1000).required(),
      type: Joi.string().valid('multiple-choice', 'true-false', 'short-answer', 'essay').required(),
      options: Joi.array().items(Joi.string().trim().min(1).max(300)).optional(),
      correctAnswer: Joi.any().optional(),
      points: Joi.number().min(0).max(100).default(1),
      explanation: Joi.string().trim().allow('').optional(),
    })
  ).min(1).required(),
});

export const quizAttemptSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      questionIndex: Joi.number().integer().min(0).required(),
      answer: Joi.any().optional(),
    })
  ).required(),
});

export const liveSessionCreateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().trim().allow('').optional(),
  provider: Joi.string().valid('jitsi', 'google-meet', 'zoom', 'custom').default('custom'),
  meetingUrl: Joi.string().uri().required(),
  startsAt: Joi.date().iso().required(),
  endsAt: Joi.date().iso().min(Joi.ref('startsAt')).optional(),
  status: Joi.string().valid('scheduled', 'live', 'completed', 'cancelled').default('scheduled'),
});

export const liveSessionStatusSchema = Joi.object({
  status: Joi.string().valid('scheduled', 'live', 'completed', 'cancelled').required(),
});

export const paymentCreateSchema = Joi.object({
  courseId: Joi.string().trim().required(),
  method: Joi.string().valid('card', 'paypal', 'bank_transfer').default('card'),
});

export const paymentConfirmSchema = Joi.object({
  paymentId: Joi.string().trim().optional(),
});

export const paymentWebhookSchema = Joi.object({
  paymentId: Joi.string().trim().optional(),
  externalPaymentId: Joi.string().trim().optional(),
  status: Joi.string().valid('pending', 'completed', 'failed').required(),
  eventId: Joi.string().trim().optional(),
  transactionId: Joi.string().trim().optional(),
}).or('paymentId', 'externalPaymentId');

export const updateMeSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  phone: Joi.string().trim().allow('').max(32).optional(),
  bio: Joi.string().trim().allow('').max(1000).optional(),
  avatar: Joi.string().uri().allow('').optional(),
  preferences: Joi.object({
    language: Joi.string().trim().max(24).optional(),
    timezone: Joi.string().trim().max(64).optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      marketingEmails: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
}).min(1);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).max(128).required(),
  newPassword: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])./).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
    }),
});

export const adminCreateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('student', 'instructor', 'admin', 'content_manager').optional(),
  isActive: Joi.boolean().optional(),
});

export const adminUpdateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  email: Joi.string().trim().lowercase().email().max(254).optional(),
  role: Joi.string().valid('student', 'instructor', 'admin', 'content_manager').optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const settingsUpdateSchema = Joi.object({
  platformName: Joi.string().trim().min(2).max(120).optional(),
  supportEmail: Joi.string().trim().lowercase().email().max(254).optional(),
  contactPhone: Joi.string().trim().allow('').max(64).optional(),
  contactAddress: Joi.string().trim().allow('').max(200).optional(),
  contactHours: Joi.string().trim().allow('').max(120).optional(),
  contactMapUrl: Joi.string().uri().allow('').optional(),
  contactResponseTime: Joi.string().trim().allow('').max(120).optional(),
  logoUrl: Joi.string().uri().allow('').optional(),
  language: Joi.string().trim().max(24).optional(),
  timezone: Joi.string().trim().max(64).optional(),
  themeMode: Joi.string().valid('light', 'dark', 'system').optional(),
  provider: Joi.string().trim().max(64).optional(),
  currency: Joi.string().trim().max(8).optional(),
  taxRate: Joi.string().trim().max(16).optional(),
  stripePublicKey: Joi.string().trim().allow('').max(512).optional(),
  stripeSecretKey: Joi.string().trim().allow('').max(512).optional(),
  smtpEnabled: Joi.boolean().optional(),
  smtpHost: Joi.string().trim().allow('').max(255).optional(),
  smtpPort: Joi.string().trim().allow('').max(10).optional(),
  smtpUsername: Joi.string().trim().allow('').max(255).optional(),
  smtpPassword: Joi.string().trim().allow('').max(512).optional(),
  trustPartners: Joi.array().items(Joi.string().trim().min(1).max(120)).optional(),
  homepageFeatures: Joi.array().items(
    Joi.object({
      title: Joi.string().trim().min(1).max(120).required(),
      description: Joi.string().trim().min(1).max(1000).required(),
      color: Joi.string().trim().max(32).required(),
    }),
  ).optional(),
  pricingPlans: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().min(1).max(120).required(),
      description: Joi.string().trim().min(1).max(1000).required(),
      monthlyPrice: Joi.string().trim().min(1).max(64).required(),
      yearlyPrice: Joi.string().trim().min(1).max(64).required(),
      yearlyLabel: Joi.string().trim().min(1).max(120).required(),
      features: Joi.array().items(Joi.string().trim().min(1).max(300)).required(),
      featured: Joi.boolean().optional(),
      cta: Joi.string().trim().min(1).max(120).required(),
      accent: Joi.string().trim().max(32).required(),
    }),
  ).optional(),
  pricingComparison: Joi.array().items(
    Joi.object({
      label: Joi.string().trim().min(1).max(120).required(),
      free: Joi.alternatives(Joi.string().trim().max(120), Joi.boolean()).required(),
      pro: Joi.alternatives(Joi.string().trim().max(120), Joi.boolean()).required(),
      business: Joi.alternatives(Joi.string().trim().max(120), Joi.boolean()).required(),
    }),
  ).optional(),
}).min(1);

export const contentSchema = Joi.object({
  type: Joi.string().valid('page', 'post', 'block').optional(),
  title: Joi.string().required(),
  content: Joi.string().optional(),
  blocks: Joi.array().items(
    Joi.object({
      id: Joi.string().trim().required(),
      type: Joi.string().trim().required(),
      content: Joi.any().required(),
      styles: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
      order: Joi.number().integer().min(0).required(),
    })
  ).optional(),
  slug: Joi.string().optional(),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
}).or('content', 'blocks');

export const mediaRenameSchema = Joi.object({
  originalName: Joi.string().trim().min(1).max(255).required(),
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
