import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { slugify } from 'transliteration';

@Injectable()
export class AwsS3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicDomain: string;

  constructor(private readonly config: ConfigService) {
    this.region = this.config.get<string>('AWS_REGION');
    this.bucket = this.config.get<string>('AWS_S3_BUCKET');
    this.publicDomain = this.config.get<string>('AWS_S3_PUBLIC_DOMAIN');

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Upload a file to S3
   * @param userId The user ID, used as part of the path
   * @param file
   */
  async uploadFile(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const fileName = slugify(file.originalname);

    const key = `avatars/${userId}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
    });

    await this.s3.send(command);

    const url = `${this.publicDomain}/${key}`;

    return { key, url };
  }

  /**
   * Generate a presigned URL for private objects
   * @param key The S3 object key
   * @param expires Expiration time in seconds (default 600)
   */
  async getSignedUrl(key: string, expires = 600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: expires });
  }

  /**
   * Delete an object from S3
   * @param key The S3 object key to delete
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3.send(command);
  }
}
