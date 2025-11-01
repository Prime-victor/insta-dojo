import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

export const userSchemas = {
  create: Joi.object({
    walletAddress: Joi.string().required(),
    username: Joi.string().min(3).max(30).required(),
    avatar: Joi.string().allow(''),
    bio: Joi.string().max(500).allow(''),
    signature: Joi.any().required(),
    message: Joi.string().required()
  }),
  update: Joi.object({
    username: Joi.string().min(3).max(30),
    avatar: Joi.string().allow(''),
    bio: Joi.string().max(500).allow(''),
    walletAddress: Joi.string().required(),
    signature: Joi.any().required(),
    message: Joi.string().required()
  })
};

export const postSchemas = {
  create: Joi.object({
    content: Joi.string().max(2000).allow(''),
    contentHash: Joi.string().required(),
    media: Joi.array().items(Joi.object({
      type: Joi.string().valid('image', 'video').required(),
      ipfsHash: Joi.string().required(),
      url: Joi.string().required(),
      thumbnailHash: Joi.string(),
      thumbnailUrl: Joi.string()
    })),
    postType: Joi.string().valid('text', 'image', 'video', 'repost').default('text'),
    repostOf: Joi.string().allow(null),
    walletAddress: Joi.string().required(),
    signature: Joi.any().required(),
    message: Joi.string().required()
  })
};

export const commentSchemas = {
  create: Joi.object({
    postId: Joi.string().required(),
    content: Joi.string().max(1000).required(),
    contentHash: Joi.string().required(),
    parentId: Joi.string().allow(null),
    walletAddress: Joi.string().required(),
    signature: Joi.any().required(),
    message: Joi.string().required()
  })
};

export const followSchemas = {
  follow: Joi.object({
    targetAddress: Joi.string().required(),
    walletAddress: Joi.string().required(),
    signature: Joi.any().required(),
    message: Joi.string().required()
  })
};
