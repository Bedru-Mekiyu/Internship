import { sanitizeInput } from '../src/utils/sanitize';

describe('sanitizeInput', () => {
  it('should return primitive values unaltered', () => {
    expect(sanitizeInput(42)).toBe(42);
    expect(sanitizeInput(true)).toBe(true);
    expect(sanitizeInput(false)).toBe(false);
    expect(sanitizeInput(null)).toBe(null);
    expect(sanitizeInput(undefined)).toBe(undefined);
  });

  it('should sanitize HTML strings by escaping chars', () => {
    expect(sanitizeInput('hello')).toBe('hello');
    expect(sanitizeInput('<script>alert("xss")</script>hello')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;hello');
    expect(sanitizeInput('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('should recursively sanitize arrays', () => {
    const input = [
      42,
      '<script>alert(1)</script>',
      [ '<img src="x" onerror="alert(1)">' ]
    ];
    const expected = [
      42,
      '&lt;script&gt;alert(1)&lt;/script&gt;',
      [ '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;' ]
    ];
    expect(sanitizeInput(input)).toEqual(expected);
  });

  it('should recursively sanitize objects', () => {
    const input = {
      name: '<script>alert("xss")</script>John',
      age: 30,
      profile: {
        bio: '<a href="javascript:alert(1)">Link</a>'
      }
    };
    const expected = {
      name: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;John',
      age: 30,
      profile: {
        bio: '&lt;a href=&quot;alert(1)&quot;&gt;Link&lt;/a&gt;'
      }
    };
    expect(sanitizeInput(input)).toEqual(expected);
  });

  it('should not sanitize raw value keys', () => {
    const rawKeys = ['password', 'currentPassword', 'newPassword', 'refreshToken', 'token'];

    rawKeys.forEach(key => {
      const input = {
        [key]: '<script>alert("xss")</script>',
        normalKey: '<script>alert("xss")</script>hello'
      };
      const expected = {
        [key]: '<script>alert("xss")</script>',
        normalKey: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;hello'
      };
      expect(sanitizeInput(input)).toEqual(expected);
    });
  });

  it('should handle complex nested structures', () => {
    const input = {
      user: {
        name: 'John <script>alert(1)</script>',
        roles: ['admin', '<script>alert(2)</script>'],
        credentials: {
          password: '<script>alert(3)</script>',
          token: 'javascript:alert(4)'
        }
      }
    };
    const expected = {
      user: {
        name: 'John &lt;script&gt;alert(1)&lt;/script&gt;',
        roles: ['admin', '&lt;script&gt;alert(2)&lt;/script&gt;'],
        credentials: {
          password: '<script>alert(3)</script>',
          token: 'javascript:alert(4)'
        }
      }
    };
    expect(sanitizeInput(input)).toEqual(expected);
  });
});
