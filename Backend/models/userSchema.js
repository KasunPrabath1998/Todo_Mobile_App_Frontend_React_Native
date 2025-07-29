const Joi = require('joi');

// Define your schema for user validation
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  profileImage: Joi.string().uri().optional(), // Optional if you are uploading a profile image
  // Add other fields as necessary
});

module.exports = { userSchema };
