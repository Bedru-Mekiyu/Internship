import { describe, expect, it } from '@jest/globals';
import { AppError } from '../src/utils/http-error';
import {
  assertPublishedForPublicEnrollment,
  courseRequiresCompletedPayment,
} from '../src/utils/course-enrollment';

describe('course-enrollment helpers', () => {
  it('requires payment when amount > 0', () => {
    expect(courseRequiresCompletedPayment({ pricing: { amount: 49 } })).toBe(true);
    expect(courseRequiresCompletedPayment({ pricing: { amount: 0 } })).toBe(false);
    expect(courseRequiresCompletedPayment({})).toBe(false);
  });

  it('rejects non-published enrollment targets', () => {
    expect(() => assertPublishedForPublicEnrollment({ status: 'draft' })).toThrow(AppError);
    expect(() => assertPublishedForPublicEnrollment({ status: 'published' })).not.toThrow();
  });
});
