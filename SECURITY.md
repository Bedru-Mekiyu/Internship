# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ |

## Reporting a Vulnerability

If you discover a security vulnerability in LearnSpace, please report it privately.

**Do not** open a public issue for security vulnerabilities.

Please email the project maintainers or open a private security advisory on GitHub.

Include in your report:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You should receive a response within 48 hours. If the issue is confirmed, a fix will be prioritized and released as soon as possible.

## Security Measures

LearnSpace implements the following security measures:

### Authentication & Authorization
- JWT-based authentication with httpOnly cookies (not localStorage)
- Token versioning for server-side session revocation
- bcrypt password hashing (10 salt rounds)
- Role-Based Access Control (4 roles)
- Email verification flow
- Password reset with expiring JWT tokens
- Strong password policy (8+ chars, upper, lower, digit, special)

### Request Security
- CSRF protection via double-submit cookie pattern
- Rate limiting on sensitive endpoints
- Input validation via Joi schemas on all mutations
- Input sanitization (XSS stripping)
- Helmet security headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS whitelist validation
- Body size limits (1MB JSON, configurable upload limit up to 250MB)

### Data Security
- Parameterized MongoDB queries (no raw `$where`)
- ReDoS protection on regex operations
- Automatic JWT/secret redaction in logs
- Production secret strength validation (32+ chars, no placeholders)

### File Upload Security
- MIME type whitelist
- Magic byte validation
- Extension whitelist
- Path traversal prevention
- Configurable size limits per upload type

### WebSocket Security
- JWT authentication on connect
- Token version verification
- Room-based access control
- Per-socket rate limiting (30 messages / 10s)

### Production Deployment
- Cookie secure flags required in production
- Trust proxy configuration for reverse proxy
- HTTPS termination at reverse proxy level
- Non-root containers (node/nginx users)
- Read-only filesystem for frontend container

## Environment Variables

All JWT secrets must be:
- Minimum 32 characters long
- Cryptographically random
- Never committed to version control
- Rotated periodically

Production secrets are validated at startup. If a placeholder or weak secret is detected, the server will refuse to start.

## Third-Party Dependencies

Dependencies are pinned to specific versions in `package.json` files. Regular updates are applied through pull requests. Critical security updates are prioritized.

## Security Checklist for Production

- [ ] `NODE_ENV=production`
- [ ] `COOKIE_SECURE=true`
- [ ] `CSRF_COOKIE_SECURE=true`
- [ ] `TRUST_PROXY=1`
- [ ] All JWT secrets: 32+ random characters
- [ ] HTTPS enabled at reverse proxy
- [ ] MongoDB access restricted (firewall/IP whitelist)
- [ ] Redis password-protected (if used)
- [ ] S3 bucket permissions locked down (if used)
- [ ] Email SMTP credentials using app-specific passwords
