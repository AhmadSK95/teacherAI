import multer from 'multer';
import path from 'path';
import fs from 'fs';

const TMP_DIR = path.resolve('data/uploads/_tmp');

// Ensure tmp directory exists
fs.mkdirSync(TMP_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TMP_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}. Allowed: PDF, DOCX, TXT, PNG, JPG`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

export { TMP_DIR, ALLOWED_MIME_TYPES, MAX_FILE_SIZE, MAX_FILES };
