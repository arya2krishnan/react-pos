/// <reference types="node" />
/// <reference types="node" />
import { Request, Response, NextFunction } from 'express';
interface FileMetadata {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
}
declare global {
    namespace Express {
        interface Request {
            rawBody?: Buffer;
        }
    }
}
export declare const uploadImage: (req: Request, res: Response, next: NextFunction) => void;
export declare const handleImageUpload: (fileData: FileMetadata) => Promise<string>;
export {};
