import { ValidationError } from '../models/errors.js';

export const validateId = (id: string | number, fieldName: string = 'ID') => {
  const numId = typeof id === 'string' ? parseInt(id) : id;
  if (isNaN(numId)) {
    throw new ValidationError(`${fieldName} invalide`);
  }
  return numId;
};