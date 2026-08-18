import { logInfo, logWarn, logError } from '../../src/utils/logger';

describe('Logger Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();

    // Mock the date so timestamps are predictable in tests, or we can use expect.stringMatching
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('Log Levels and Output format (Non-Production)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should log info messages to console.log', () => {
      logInfo('This is an info message');
      expect(console.log).toHaveBeenCalledWith('[2023-01-01T00:00:00.000Z] INFO This is an info message');
    });

    it('should log warn messages to console.warn', () => {
      logWarn('This is a warning message');
      expect(console.warn).toHaveBeenCalledWith('[2023-01-01T00:00:00.000Z] WARN This is a warning message');
    });

    it('should log error messages to console.error', () => {
      logError('This is an error message');
      expect(console.error).toHaveBeenCalledWith('[2023-01-01T00:00:00.000Z] ERROR This is an error message');
    });

    it('should append stringified meta to the log line', () => {
      logInfo('User login', { userId: 123, status: 'success' });
      expect(console.log).toHaveBeenCalledWith(
        '[2023-01-01T00:00:00.000Z] INFO User login {"userId":123,"status":"success"}'
      );
    });
  });

  describe('Production Output Format', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should log as JSON to console.log for all levels', () => {
      logInfo('Info message');
      expect(console.log).toHaveBeenCalledWith(
        JSON.stringify({ level: 'info', message: 'Info message', ts: '2023-01-01T00:00:00.000Z' })
      );

      logWarn('Warn message');
      expect(console.log).toHaveBeenCalledWith(
        JSON.stringify({ level: 'warn', message: 'Warn message', ts: '2023-01-01T00:00:00.000Z' })
      );

      logError('Error message');
      expect(console.log).toHaveBeenCalledWith(
        JSON.stringify({ level: 'error', message: 'Error message', ts: '2023-01-01T00:00:00.000Z' })
      );

      // console.warn and console.error should not be called
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should include meta properties in the JSON payload', () => {
      logInfo('Action completed', { actionId: 'abc-123', count: 5 });
      expect(console.log).toHaveBeenCalledWith(
        JSON.stringify({
          level: 'info',
          message: 'Action completed',
          ts: '2023-01-01T00:00:00.000Z',
          actionId: 'abc-123',
          count: 5
        })
      );
    });
  });

  describe('Redaction', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should redact sensitive keys', () => {
      logInfo('User created', {
        username: 'johndoe',
        password: 'supersecretpassword',
        token: 'some-token',
        secret: 'my-secret',
        authorization: 'Bearer token',
        cookie: 'session=123',
        'set-cookie': 'session=123',
        apikey: 'key123',
        api_key: 'key123',
        email: 'john@example.com'
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"username":"johndoe"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"password":"[redacted]"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"token":"[redacted]"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"secret":"[redacted]"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"authorization":"[redacted]"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"cookie":"[redacted]"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"set-cookie":"[redacted]"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"apikey":"[redacted]"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"api_key":"[redacted]"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"email":"[redacted]"')
      );
    });

    it('should redact values that look like JWTs even if key is not sensitive', () => {
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      logInfo('Data loaded', {
        normalKey: 'normal value',
        weirdData: jwt,
        spacedData: `  ${jwt}  ` // Testing the .trim() logic
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"normalKey":"normal value"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"weirdData":"[redacted]"')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"spacedData":"[redacted]"')
      );
    });

    it('should deeply redact arrays and objects', () => {
      logInfo('Complex payload', {
        users: [
          { name: 'Alice', password: 'pwd1' },
          { name: 'Bob', email: 'bob@example.com' }
        ],
        config: {
          publicSettings: { theme: 'dark' },
          privateSettings: { apiKey: 'secret-key' }
        }
      });

      const logOutput = (console.log as jest.Mock).mock.calls[0][0];

      // Parse the JSON part of the log string
      const match = logOutput.match(/(\{.*\})$/);
      const parsedMeta = JSON.parse(match[1]);

      expect(parsedMeta.users[0].name).toBe('Alice');
      expect(parsedMeta.users[0].password).toBe('[redacted]');
      expect(parsedMeta.users[1].name).toBe('Bob');
      expect(parsedMeta.users[1].email).toBe('[redacted]');

      expect(parsedMeta.config.publicSettings.theme).toBe('dark');
      expect(parsedMeta.config.privateSettings.apiKey).toBe('[redacted]');
    });

    it('should handle null and undefined values safely', () => {
      logInfo('Nullable data', {
        valid: true,
        nullValue: null,
        undefinedValue: undefined,
        arrayWithNulls: [1, null, 3]
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"valid":true')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"nullValue":null')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"arrayWithNulls":[1,null,3]')
      );
      // undefined values are dropped by JSON.stringify
    });
  });
});
