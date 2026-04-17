import { AppError } from './http-error';

/** True when the course charges a positive price and checkout should precede free enroll. */
export const courseRequiresCompletedPayment = (course: {
  pricing?: { amount?: number; type?: string | null } | null;
}): boolean => {
  const pricing = course.pricing;
  if (pricing == null || typeof pricing !== 'object') {
    return false;
  }
  const amount = Number(pricing.amount ?? 0);
  return amount > 0;
};

export const assertPublishedForPublicEnrollment = (course: { status?: string }): void => {
  if (course.status !== 'published') {
    throw new AppError('Course is not available for enrollment', 404);
  }
};
