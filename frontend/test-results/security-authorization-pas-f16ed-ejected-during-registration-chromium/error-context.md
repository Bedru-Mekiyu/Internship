# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-authorization.spec.ts >> password security >> weak password rejected during registration
- Location: e2e/security-authorization.spec.ts:254:3

# Error details

```
Error: Channel closed
```

```
Error: locator.fill: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('textbox', { name: 'Email' })

```

```
Error: browserContext.close: Target page, context or browser has been closed
```