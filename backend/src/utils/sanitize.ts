const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'link', 'style'];
const DANGEROUS_ATTRS = [
  'onerror',
  'onload',
  'onclick',
  'onmouseover',
  'onfocus',
  'onblur',
  'onchange',
  'onsubmit',
  'onkeydown',
  'onkeypress',
  'onkeyup',
];
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:'];

export const sanitizeHtml = (html: string | undefined): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let sanitized = html;

  DANGEROUS_TAGS.forEach((tag) => {
    const tagRegex = new RegExp(`<(${tag})[\\s\\S]*?</\\1>`, 'gi');
    sanitized = sanitized.replace(tagRegex, '');
    const selfClosingRegex = new RegExp(`<(${tag})[^>]*>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });

  DANGEROUS_ATTRS.forEach((attr) => {
    const attrRegex = new RegExp(`\\s${attr}=["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(attrRegex, '');
    const onRegex = new RegExp(`\\s+on\\w+=["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(onRegex, '');
  });

  DANGEROUS_PROTOCOLS.forEach((protocol) => {
    const protocolRegex = new RegExp(protocol, 'gi');
    sanitized = sanitized.replace(protocolRegex, '');
  });

  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

  return sanitized;
};

export const sanitizeInput = (input: unknown): unknown => {
  if (typeof input === 'string') {
    return sanitizeHtml(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (input && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};