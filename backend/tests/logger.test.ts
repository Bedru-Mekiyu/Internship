import { logInfo, logWarn, logError } from '../src/utils/logger';

describe('Logger Utility', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Set NODE_ENV to something other than 'production' to test the full formatting
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Redaction', () => {
    it('should redact JWT tokens from string values', () => {
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      logInfo('Test message', { token: jwtToken });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('[redacted]');
      expect(logOutput).not.toContain(jwtToken);
    });

    it('should redact sensitive keys in objects', () => {
      const sensitiveData = {
        password: 'mysecretpassword',
        token: 'sometoken',
        secret: 'topsecret',
        authorization: 'Bearer token',
        cookie: 'session_id=123',
        'set-cookie': 'session_id=123',
        'api-key': 'key123',
        email: 'test@example.com'
      };

      logInfo('Test sensitive keys', sensitiveData);

      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('"password":"[redacted]"');
      expect(logOutput).toContain('"token":"[redacted]"');
      expect(logOutput).toContain('"secret":"[redacted]"');
      expect(logOutput).toContain('"authorization":"[redacted]"');
      expect(logOutput).toContain('"cookie":"[redacted]"');
      expect(logOutput).toContain('"set-cookie":"[redacted]"');
      expect(logOutput).toContain('"api-key":"[redacted]"');
      expect(logOutput).toContain('"email":"[redacted]"');

      expect(logOutput).not.toContain('mysecretpassword');
      expect(logOutput).not.toContain('test@example.com');
    });

    it('should redact sensitive keys in nested objects', () => {
      const nestedData = {
        user: {
          id: 1,
          password: 'mysecretpassword'
        }
      };

      logInfo('Test nested', nestedData);
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('"password":"[redacted]"');
      expect(logOutput).toContain('"id":1');
      expect(logOutput).not.toContain('mysecretpassword');
    });

    it('should redact sensitive elements in arrays', () => {
      const arrayData = {
        items: [
          { password: 'pass1' },
          { password: 'pass2' },
          'regular string',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        ]
      };

      logInfo('Test array', arrayData);
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('"password":"[redacted]"');
      expect(logOutput).toContain('"regular string"');
      expect(logOutput).toContain('"[redacted]"');
      expect(logOutput).not.toContain('pass1');
      expect(logOutput).not.toContain('pass2');
    });

    it('should not redact non-sensitive keys', () => {
      const normalData = {
        id: 123,
        username: 'johndoe',
        isActive: true
      };

      logInfo('Test normal', normalData);
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('"id":123');
      expect(logOutput).toContain('"username":"johndoe"');
      expect(logOutput).toContain('"isActive":true');
      expect(logOutput).not.toContain('[redacted]');
    });
  });

  describe('Log Levels', () => {
    it('logInfo should call console.log with INFO prefix', () => {
      logInfo('Info message');
      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('INFO Info message');
    });

    it('logWarn should call console.warn with WARN prefix', () => {
      logWarn('Warn message');
      expect(consoleWarnSpy).toHaveBeenCalled();
      const logOutput = consoleWarnSpy.mock.calls[0][0];
      expect(logOutput).toContain('WARN Warn message');
    });

    it('logError should call console.error with ERROR prefix', () => {
      logError('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('ERROR Error message');
    });
  });

  describe('Production Environment Formatting', () => {
    it('should format logs as JSON when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      logInfo('Prod message', { id: 123, password: 'secretpassword' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls[0][0];

      // Should be valid JSON
      const parsedOutput = JSON.parse(logOutput);
      expect(parsedOutput.level).toBe('info');
      expect(parsedOutput.message).toBe('Prod message');
      expect(parsedOutput.id).toBe(123);
      expect(parsedOutput.password).toBe('[redacted]');
      expect(parsedOutput.ts).toBeDefined();
    });
  });
});
