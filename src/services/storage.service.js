import ImageKit from 'imagekit';
import { config } from '../config/env.config.js';
import { AppError } from '../utils/AppError.js';

export class StorageService {
  static #imagekitInstance = null;

  static getImageKit() {
    if (!this.#imagekitInstance) {
      if (config.imagekit.publicKey && config.imagekit.privateKey && config.imagekit.urlEndpoint) {
        this.#imagekitInstance = new ImageKit({
          publicKey: config.imagekit.publicKey,
          privateKey: config.imagekit.privateKey,
          urlEndpoint: config.imagekit.urlEndpoint
        });
      }
    }
    return this.#imagekitInstance;
  }

  /**
   * Upload an image file to ImageKit
   * @param {Buffer} buffer - File buffer from multer
   * @param {string} originalName - Original file name
   * @param {string} [folder='/bookworm/books'] - ImageKit destination folder
   * @returns {Promise<{ url: string, fileId: string, name: string }>}
   */
  static async uploadImage(buffer, originalName, folder = '/bookworm/books') {
    if (!buffer) {
      throw new AppError('No file buffer provided for upload', 400);
    }

    const ik = this.getImageKit();

    // If ImageKit is fully configured with real keys
    if (ik && !config.imagekit.privateKey.includes('placeholder')) {
      try {
        const base64File = buffer.toString('base64');
        const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const response = await ik.upload({
          file: base64File,
          fileName: `${Date.now()}_${cleanName}`,
          folder,
          useUniqueFileName: true
        });

        return {
          url: response.url,
          fileId: response.fileId,
          name: response.name,
          thumbnailUrl: response.thumbnailUrl || response.url
        };
      } catch (error) {
        console.error('[ImageKit Error] Upload failed:', error);
        throw new AppError(`ImageKit upload failed: ${error.message}`, 502);
      }
    }

    // High-fidelity fallback when testing without live API keys
    const fallbackId = `ik_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fallbackUrl = `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop&sig=${fallbackId}`;

    return {
      url: fallbackUrl,
      fileId: fallbackId,
      name: originalName,
      thumbnailUrl: fallbackUrl
    };
  }

  /**
   * Generates authentication parameters for client-side ImageKit upload
   * @returns {{ token: string, expire: number, signature: string }}
   */
  static getAuthParameters() {
    const ik = this.getImageKit();
    if (!ik || config.imagekit.privateKey.includes('placeholder')) {
      const expire = Math.floor(Date.now() / 1000) + 1800;
      return {
        token: 'dev_mock_token_32chars_imagekit_123456',
        expire,
        signature: 'dev_mock_signature_hmac_sha1_1234567890'
      };
    }
    return ik.getAuthenticationParameters();
  }
}
