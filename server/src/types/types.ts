export interface EmailData {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// Extend the Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        image?: {
          id?: string;
          url?: string;
          public_id?: string | null;
        } | null;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
      };

      // Single file upload
      file?: Multer.File;

      // Multiple files upload
      files?: { [fieldname: string]: Multer.File[] };
    }

    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}
