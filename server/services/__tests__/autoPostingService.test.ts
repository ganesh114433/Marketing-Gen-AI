
import { AutoPostingService } from '../autoPostingService';
import { describe, it, expect, jest } from '@jest/globals';

describe('AutoPostingService', () => {
  let service: AutoPostingService;

  beforeEach(() => {
    service = AutoPostingService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = AutoPostingService.getInstance();
    const instance2 = AutoPostingService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should handle social media posts', async () => {
    const mockPost = {
      id: '123',
      content: 'Test post',
      platform: 'twitter',
      scheduledTime: new Date()
    };

    const result = await service.handleSocialMediaPost(mockPost);
    expect(result).toBeDefined();
  });
});
