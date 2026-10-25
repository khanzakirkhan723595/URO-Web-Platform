// backend/controllers/contactController.js
const validator = require('validator');
const ContactMessage = require('../models/ContactMessage');
const AppError = require('../utils/AppError');

// Public: anyone can send a message from the Contact page (rate limited in the route).
exports.createMessage = async (req, res, next) => {
  try {
    const { name, email, organization = '', message } = req.body;

    if ([name, email, message].some((v) => typeof v !== 'string' || !v.trim())) {
      return next(new AppError('Name, email and message are required.', 400));
    }
    if (!validator.isEmail(email.trim())) return next(new AppError('Please provide a valid email address.', 400));
    if (message.trim().length < 10) return next(new AppError('Message must be at least 10 characters.', 400));
    if (typeof organization !== 'string') return next(new AppError('Invalid organization.', 400));

    await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim(),
      message: message.trim(),
      user: req.user ? req.user.id : null,
    });

    res.status(201).json({ status: 'success', message: 'Thank you! Your message has been received.' });
  } catch (error) {
    next(error);
  }
};
