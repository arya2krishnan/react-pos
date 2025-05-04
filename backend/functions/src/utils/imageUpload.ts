import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as BusboyImport from 'busboy';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../firebase';
import { Request, Response, NextFunction } from 'express';

// Type workaround for Busboy
const Busboy = BusboyImport.default || BusboyImport;

interface FileMetadata {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
}

// Extending the Request interface to include rawBody
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

// Middleware to handle file uploads
export const uploadImage = (req: Request, res: Response, next: NextFunction) => {
  // Check if content type is multipart/form-data
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    req.body.imageUrl = null;
    return next();
  }

  const busboy = Busboy({
    headers: req.headers as any,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  const fields: Record<string, string> = {};
  let fileBuffer: Buffer | null = null;
  let fileName: string | null = null;
  let mimeType: string | null = null;

  busboy.on('field', (fieldname: string, val: string) => {
    fields[fieldname] = val;
  });

  busboy.on('file', (fieldname: string, file: any, filename: string, encoding: string, mimetype: string) => {
    if (!mimetype.startsWith('image/')) {
      res.status(400).json({ error: 'Only image files are allowed' });
      return;
    }

    mimeType = mimetype;
    
    const chunks: Buffer[] = [];
    
    file.on('data', (data: Buffer) => {
      chunks.push(data);
    });
    
    file.on('end', () => {
      fileBuffer = Buffer.concat(chunks);
      fileName = `${uuidv4()}_${filename}`;
    });
  });

  busboy.on('finish', async () => {
    // Merge fields into req.body
    req.body = { ...fields };

    // If no file was uploaded
    if (!fileBuffer || !fileName) {
      req.body.imageUrl = null;
      return next();
    }

    try {
      // Create a temporary file path
      const tempFilePath = path.join(os.tmpdir(), fileName);
      fs.writeFileSync(tempFilePath, fileBuffer);
      
      // Upload file to Firebase Storage
      const fileUpload = bucket.file(`product-images/${fileName}`);
      
      await fileUpload.save(fileBuffer, {
        metadata: {
          contentType: mimeType || 'image/jpeg',
        },
      });
      
      // Make the file publicly accessible
      await fileUpload.makePublic();
      
      // Get the public URL
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/product-images/${fileName}`;
      
      // Clean up the temp file
      fs.unlinkSync(tempFilePath);
      
      // Add the imageUrl to the request body
      req.body.imageUrl = imageUrl;
      
      next();
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  if (req.rawBody) {
    busboy.end(req.rawBody);
  } else {
    req.pipe(busboy);
  }
};

// Function to handle and upload an image directly
export const handleImageUpload = async (fileData: FileMetadata): Promise<string> => {
  const fileName = `${uuidv4()}_${fileData.originalname}`;
  const tempFilePath = path.join(os.tmpdir(), fileName);

  try {
    // Write file to temp location
    fs.writeFileSync(tempFilePath, fileData.buffer);
    
    // Upload to Firebase Storage
    const fileUpload = bucket.file(`product-images/${fileName}`);
    await fileUpload.save(fileData.buffer, {
      metadata: {
        contentType: fileData.mimetype,
      },
    });
    
    // Make the file publicly accessible
    await fileUpload.makePublic();
    
    // Get the public URL
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/product-images/${fileName}`;
    
    // Clean up the temp file
    fs.unlinkSync(tempFilePath);
    
    return imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}; 