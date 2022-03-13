import { Readable } from 'stream';

export class UploadedFileWithSource implements Express.Multer.File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    stream: Readable;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
    author?: string;
    title?: string;
    url?: string;
    license?: string;
}
