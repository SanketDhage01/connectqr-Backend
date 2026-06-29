import { body } from 'express-validator';

export const contactRules = [
  body('visitorName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Visitor name must not exceed 50 characters'),

  body('reason')
    .isIn(['Vehicle Blocking', 'Lights ON', 'Alarm Ringing', 'Window Open', 'Found Item', 'Emergency', 'Other'])
    .withMessage('Please select a valid reason for contact'),

  body('messageText')
    .trim()
    .notEmpty()
    .withMessage('Message text is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Message must be between 5 and 1000 characters')
];

export const replyRules = [
  body('messageText')
    .trim()
    .notEmpty()
    .withMessage('Message reply text cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Reply must not exceed 1000 characters')
];
