import { Injectable } from '@nestjs/common';
import * as COS from 'cos-nodejs-sdk-v5';

@Injectable()
export class CosService {
  private cos: COS;

  constructor() {
    this.cos = new COS({
      SecretId: process.env.COS_SECRET_ID,
      SecretKey: process.env.COS_SECRET_KEY,
    });
  }

  async uploadFile(
    Bucket: string,
    Region: string,
    Key: string,
    Body: COS.UploadBody,
    isPublic?: boolean,
  ): Promise<any> {
    const params: COS.PutObjectParams = {
      Bucket,
      Region,
      Key,
      Body,
    };

    if (isPublic) {
      params.ACL = 'public-read';
    }

    return new Promise((resolve, reject) => {
      this.cos.putObject(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  async getSignedUrl(
    Bucket: string,
    Region: string,
    Key: string,
    Expires = 600,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cos.getObjectUrl(
        {
          Bucket,
          Region,
          Key,
          Sign: true,
          Expires,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data.Url);
        },
      );
    });
  }
}
