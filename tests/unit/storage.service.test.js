import { StorageService } from '../../src/services/storage.service.js';

describe('StorageService (ImageKit) Unit Tests', () => {
  it('should return valid authentication parameters for ImageKit', () => {
    const authParams = StorageService.getAuthParameters();
    expect(authParams).toHaveProperty('token');
    expect(authParams).toHaveProperty('expire');
    expect(authParams).toHaveProperty('signature');
    expect(typeof authParams.token).toBe('string');
    expect(typeof authParams.expire).toBe('number');
    expect(typeof authParams.signature).toBe('string');
  });

  it('should upload image buffer and return URL object', async () => {
    const mockBuffer = Buffer.from('fake_image_bytes_content_for_testing');
    const result = await StorageService.uploadImage(mockBuffer, 'sample_cover.jpg');

    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('fileId');
    expect(typeof result.url).toBe('string');
    expect(result.url).toMatch(/^https?:\/\//);
  });
});
