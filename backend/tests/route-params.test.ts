import { routeParam } from '../src/utils/route-params';

describe('routeParam', () => {
  it('returns a plain string unchanged', () => {
    expect(routeParam('abc123')).toBe('abc123');
  });

  it('uses the first element when given an array', () => {
    expect(routeParam(['first', 'second'])).toBe('first');
  });

  it('returns empty string for undefined', () => {
    expect(routeParam(undefined)).toBe('');
  });

  it('stringifies empty first array slot', () => {
    expect(routeParam([])).toBe('');
  });
});
