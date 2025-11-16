import { env } from '../config/env';

export type UploadParams = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  folder?: string;
};

export class StorageService {
  constructor(private readonly bucket = env.gcsBucket) {}

  async uploadFile({ buffer, filename, mimetype, folder }: UploadParams): Promise<string> {
    if (!this.bucket) {
      console.warn('No se configuró GCS_BUCKET. Se devolverá una URL temporal local.');
      const basePath = `./tmp/${folder ?? env.gcsBaseFolder}`;
      await import('fs/promises').then(async (fs) => {
        await fs.mkdir(basePath, { recursive: true });
        await fs.writeFile(`${basePath}/${filename}`, buffer);
      });
      return `${basePath}/${filename}`;
    }

    const storagePath = `${folder ?? env.gcsBaseFolder}/${Date.now()}-${filename}`;
    console.log(`Simulación de subida a GCS en bucket ${this.bucket} con mimetype ${mimetype}`);
    return `gs://${this.bucket}/${storagePath}`;
  }
}

export const storageService = new StorageService();
