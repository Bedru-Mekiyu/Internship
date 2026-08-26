import { AppError } from '../src/utils/http-error';

describe('AppError', () => {
  it('should initialize with default status code 500 when not provided', () => {
    const error = new AppError('Something went wrong');

    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(500);
    expect(error.details).toBeUndefined();
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should initialize with custom status code when provided', () => {
    const error = new AppError('Not Found', 404);

    expect(error.message).toBe('Not Found');
    expect(error.statusCode).toBe(404);
    expect(error.details).toBeUndefined();
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should initialize with custom details when provided', () => {
    const details = { field: 'email', issue: 'invalid' };
    const error = new AppError('Validation Error', 400, details);

    expect(error.message).toBe('Validation Error');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual(details);
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should capture stack trace', () => {
    const error = new AppError('Test error');
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });
});
