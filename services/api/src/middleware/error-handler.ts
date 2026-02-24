import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'File too large. Maximum size is 10 MB.',
      LIMIT_FILE_COUNT: 'Too many files. Maximum is 5 files.',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field.',
    };
    res.status(400).json({
      error: messages[err.code] || `Upload error: ${err.message}`,
    });
    return;
  }

  // File filter rejection comes as a plain Error with our custom message
  if (err.message && err.message.startsWith('File type not allowed')) {
    res.status(400).json({ error: err.message });
    return;
  }

  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
