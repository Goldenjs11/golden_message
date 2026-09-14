import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadRoot = process.env.UPLOAD_ROOT || path.resolve(__dirname, '../../../uploads');
export const publicUploadBase = process.env.PUBLIC_UPLOAD_BASE || '/uploads';
