import { describe, expect, it } from 'vitest';
import appSource from './App.tsx?raw';

describe('app routes', () => {
  it('includes legacy fallback quiz route', () => {
    expect(appSource).toContain('path="/courses/bootcamp-2025/quiz"');
  });

  it('includes dynamic lesson quiz route', () => {
    expect(appSource).toContain('path="/courses/:courseId/lessons/:lessonId/quiz"');
  });

  it('includes dynamic course learn route', () => {
    expect(appSource).toContain('path="/courses/:courseId/learn"');
  });
});
