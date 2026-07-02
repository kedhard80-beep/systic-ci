import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get<string>('AWS_S3_BUCKET', 'systic-ci-media');
    this.region = config.get<string>('AWS_REGION', 'eu-west-3');
    this.cdnUrl = config.get<string>('CDN_URL', '');

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  /**
   * Upload a file buffer to S3
   */
  async upload(
    buffer: Buffer,
    options: {
      originalName: string;
      mimeType: string;
      folder?: string;
      tenantId?: string;
      isPublic?: boolean;
    },
  ): Promise<{ key: string; url: string; size: number }> {
    const ext = path.extname(options.originalName).toLowerCase();
    const uuid = uuidv4();
    const folder = [
      options.tenantId,
      options.folder ?? 'uploads',
    ]
      .filter(Boolean)
      .join('/');
    const key = `${folder}/${uuid}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: options.mimeType,
        ACL: options.isPublic ? 'public-read' : 'private',
        Metadata: { originalName: options.originalName },
      }),
    );

    const url = this.cdnUrl
      ? `${this.cdnUrl}/${key}`
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { key, url, size: buffer.length };
  }

  /**
   * Generate a presigned URL for secure private access
   */
  async getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Delete a file from S3
   */
  async delete(key: string): Promise<void> {
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error) {
      this.logger.error(`Failed to delete S3 key: ${key}`, error);
    }
  }

  /**
   * Get public URL for a key (Cloudflare CDN or direct S3)
   */
  getPublicUrl(key: string): string {
    if (this.cdnUrl) return `${this.cdnUrl}/${key}`;
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Allowed MIME types per category
   */
  static readonly ALLOWED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    video: ['video/mp4', 'video/webm'],
    any: [] as string[],
  };

  isAllowedType(mimeType: string, category: keyof typeof StorageService.ALLOWED_TYPES): boolean {
    const allowed = StorageService.ALLOWED_TYPES[category];
    if (!allowed.length) return true;
    return allowed.includes(mimeType);
  }
}
