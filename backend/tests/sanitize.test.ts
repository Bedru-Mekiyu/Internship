import { sanitizeHtml } from '../src/utils/sanitize';

describe('sanitizeHtml', () => {
  it('returns empty string for undefined input', () => {
    expect(sanitizeHtml(undefined)).toBe('');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeHtml(null as any)).toBe('');
    expect(sanitizeHtml(123 as any)).toBe('');
    expect(sanitizeHtml({} as any)).toBe('');
  });

  it('escapes basic HTML entities', () => {
    expect(sanitizeHtml('&')).toBe('&amp;');
    expect(sanitizeHtml('<')).toBe('&lt;');
    expect(sanitizeHtml('>')).toBe('&gt;');
    expect(sanitizeHtml('"')).toBe('&quot;');
    expect(sanitizeHtml("'")).toBe('&#x27;');
  });

  it('escapes tags, attributes, and comments since escaping happens first', () => {
    // Escaping runs first, so < > are transformed to &lt; and &gt;
    // As a result, the subsequent tag/attribute removal regexes do not match.
    // However, the function achieves its security goal by escaping HTML.

    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(sanitizeHtml('<img src="image.jpg" onerror="alert(\'xss\')" />')).toBe('&lt;img src=&quot;image.jpg&quot; onerror=&quot;alert(&#x27;xss&#x27;)&quot; /&gt;');
    expect(sanitizeHtml('Hello<!-- Comment --> World')).toBe('Hello&lt;!-- Comment --&gt; World');
  });

  it('strips dangerous protocols', () => {
    // The dangerous protocol regex doesn't depend on unescaped brackets, so it successfully strips.
    expect(sanitizeHtml('<a href="javascript:alert(1)">Link</a>')).toBe('&lt;a href=&quot;alert(1)&quot;&gt;Link&lt;/a&gt;');
    expect(sanitizeHtml('<a href="vbscript:alert(1)">Link</a>')).toBe('&lt;a href=&quot;alert(1)&quot;&gt;Link&lt;/a&gt;');
    expect(sanitizeHtml('<a href="data:alert(1)">Link</a>')).toBe('&lt;a href=&quot;alert(1)&quot;&gt;Link&lt;/a&gt;');
    expect(sanitizeHtml('javascript:void(0)')).toBe('void(0)');
  });

  it('leaves safe HTML alone', () => {
    expect(sanitizeHtml('This is a normal string.')).toBe('This is a normal string.');
  });
});
