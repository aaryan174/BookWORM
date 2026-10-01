import { AuthService } from '../../src/services/auth.service.js';

describe('AuthService Unit Tests', () => {
  it('should generate valid access and refresh token objects', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      roles: ['buyer']
    };

    const tokens = AuthService.generateTokens(mockUser);
    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
    expect(typeof tokens.accessToken).toBe('string');
    expect(typeof tokens.refreshToken).toBe('string');
  });
});
