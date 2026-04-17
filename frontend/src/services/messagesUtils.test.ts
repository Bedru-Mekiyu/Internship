import { describe, expect, it } from 'vitest';
import {
  canLoadOlderMessages,
  canSendMessage,
  flattenPaginatedItems,
  getStatusSeverity,
  getTrimmedMessage,
  isMessageTooLong,
  maxMessageLength,
} from './messagesUtils';

describe('messages utils', () => {
  it('trims whitespace from draft messages', () => {
    expect(getTrimmedMessage('  hello world  ')).toBe('hello world');
  });

  it('detects oversized messages after trimming', () => {
    const oversized = `${'a'.repeat(maxMessageLength)}x`;
    expect(isMessageTooLong(oversized)).toBe(true);

    const exactLimit = 'a'.repeat(maxMessageLength);
    expect(isMessageTooLong(exactLimit)).toBe(false);
  });

  it('allows send only when conversation is active and draft is valid', () => {
    expect(canSendMessage(true, false, 'hello')).toBe(true);
    expect(canSendMessage(false, false, 'hello')).toBe(false);
    expect(canSendMessage(true, true, 'hello')).toBe(false);
    expect(canSendMessage(true, false, '   ')).toBe(false);
    expect(canSendMessage(true, false, `${'a'.repeat(maxMessageLength)}x`)).toBe(false);
  });

  it('maps status message to alert severity', () => {
    expect(getStatusSeverity('Message sent successfully.')).toBe('success');
    expect(getStatusSeverity('Failed to send message.')).toBe('info');
    expect(getStatusSeverity(null)).toBe('info');
  });

  it('flattens paginated items from oldest to newest page order', () => {
    const result = flattenPaginatedItems<string>([
      { items: ['new-1', 'new-2'] },
      { items: ['old-1', 'old-2'] },
    ]);

    expect(result).toEqual(['old-1', 'old-2', 'new-1', 'new-2']);
  });

  it('determines whether to show load-older action', () => {
    expect(canLoadOlderMessages(true, true)).toBe(true);
    expect(canLoadOlderMessages(false, true)).toBe(false);
    expect(canLoadOlderMessages(true, false)).toBe(false);
  });
});
