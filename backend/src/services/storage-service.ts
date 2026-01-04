import path from 'path';
import { promises as fs } from 'fs';
import { env } from '../config/env';

export type UploadParams = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  folder?: string;
};

export type StoredFile = {
  storagePath: string;
};

export class StorageService {
  constructor(private readonly bucket = env.gcsBucket, private readonly localBasePath = env.localUploadsPath) {}

  async uploadFile({ buffer, filename, mimetype, folder }: UploadParams): Promise<StoredFile> {
    if (!this.bucket) {
      const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const relativePath = path.join(folder ?? env.gcsBaseFolder, safeName);
      const targetPath = path.resolve(this.localBasePath, relativePath);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, buffer);
      return { storagePath: relativePath };
    }

    const storagePath = `${folder ?? env.gcsBaseFolder}/${Date.now()}-${filename}`;
    console.log(`Simulación de subida a GCS en bucket ${this.bucket} con mimetype ${mimetype}`);
    return { storagePath: `gs://${this.bucket}/${storagePath}` };
  }

  resolveLocalPath(storagePath: string) {
    return path.resolve(this.localBasePath, storagePath);
  }

  async fileExists(storagePath: string) {
    try {
      await fs.stat(this.resolveLocalPath(storagePath));
      return true;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
