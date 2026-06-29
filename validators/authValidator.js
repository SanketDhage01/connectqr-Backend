import { body, validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation errors occurred', errors.array());
  }
  next();
};

export const registerRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid E.164 phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('vehicleNumber')
    .trim()
    .notEmpty()
    .withMessage('Vehicle license plate/number is required'),

  body('vehicleType')
    .isIn(['car', 'bike', 'truck', 'other'])
    .withMessage('Vehicle type must be car, bike, truck, or other'),

  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Vehicle brand is required'),

  body('model')
    .trim()
    .notEmpty()
    .withMessage('Vehicle model is required'),

  body('color')
    .trim()
    .notEmpty()
    .withMessage('Vehicle color is required')
];

export const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];
