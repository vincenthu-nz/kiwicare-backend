import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const UploadInterceptor = FileInterceptor('file', {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only images allowed'), false);
    }
    cb(null, true);
  },
  storage: diskStorage({
    destination: './uploads',
    filename(_, file, cb) {
      cb(null, `${Date.now()}${extname(file.originalname)}`);
    },
  }),
});
