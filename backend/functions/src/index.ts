/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import express from 'express';
import cors from 'cors';
import { db } from './firebase';
import sendText from './orders/sendText';
import { onRequest } from 'firebase-functions/v2/https';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { bucket, alternativeBuckets } from './firebase';
import * as admin from 'firebase-admin';
import { storage } from './firebase';

// Import the secret definition to ensure it's properly referenced
import { defineSecret } from 'firebase-functions/params';
const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = defineSecret('TWILIO_PHONE_NUMBER');
const adminPassword = defineSecret('ADMIN_PASSWORD');

// Add proper interface to diagnose storage
interface DiagnosticResults {
  bucketName: string;
  storagePermissionResults: {
    acl?: any;
    aclError?: {
      message: string;
    };
  };
  firebaseConfig: {
    projectId: string | undefined;
    storageBucket: string | undefined;
  };
  steps: Record<string, string>;
  fileMetadata?: any;
  publicUrl?: string;
  fileOperationError?: {
    message: string;
    stack?: string;
  };
  fileCount?: number;
  sampleFiles?: string[];
  listFilesError?: {
    message: string;
  };
}



const app = express();
// Configure CORS for all origins and methods
app.use(cors({
  origin: true, // Allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increase JSON payload limit for base64 images

// Middleware to capture raw body for Busboy file parsing
app.use((req, res, next) => {
  if (req.rawBody === undefined && req.method === 'POST' && 
      req.headers['content-type']?.includes('multipart/form-data')) {
    let data = Buffer.from('');
    req.on('data', chunk => {
      data = Buffer.concat([data, chunk]);
    });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

app.post('/new-order', async (req, res) => {
    const { orderNumber, customerName, customerPhone, items, totalAmount, donation, orderDate, textOptIn } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Order must contain at least one item' });
        return;
    }

    // Ensure we have at least a name or phone
    if ((!customerName || customerName.trim() === '') && (!customerPhone || customerPhone.trim() === '')) {
        res.status(400).json({ error: 'Either customer name or phone number is required' });
        return;
    }

    try {
        // Create the order document in Firestore
        const orderRef = db.collection('orders').doc();
        const orderId = orderRef.id;
        
        await orderRef.set({
            id: orderId,
            orderNumber,
            customerName: customerName || '',
            customerPhone: customerPhone || '',
            items,
            totalAmount,
            donation,
            orderDate,
            textOptIn,
            finished: false,
            createdAt: new Date().toISOString()
        });
        
        console.log(`Order created with ID: ${orderId}`);
        
        res.status(201).json({
            message: 'Order created successfully',
            orderId,
            orderNumber
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.get('/unfinished-orders', async (req, res) => {
    try {
        const orders = await db.collection('orders').where('finished', '==', false).get();
        const ordersData = orders.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(ordersData);
    } catch (error) {
        console.error('Error fetching unfinished orders:', error);
        res.status(500).json({ error: 'Failed to fetch unfinished orders' });
    }
});

app.get('/completed-orders', async (req, res) => {
    try {
        const orders = await db.collection('orders').where('finished', '==', true).get();
        const ordersData = orders.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(ordersData);
    } catch (error) {
        console.error('Error fetching completed orders:', error);
        res.status(500).json({ error: 'Failed to fetch completed orders' });
    }
});

app.post('/finish-order', async (req, res) => {
    const { orderId } = req.body;
    console.log('Finish order request received for order ID:', orderId);

    try {
        await db.collection('orders').doc(orderId).update({ finished: true });
        const order = await db.collection('orders').doc(orderId).get();
        
        if (!order.exists) {
            console.error('Order not found in database:', orderId);
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        
        // Log the entire order data for debugging
        console.log('Order data retrieved from database:', order.data());
        
        const customerPhone = order.get('customerPhone');
        const customerName = order.get('customerName');
        const orderNumber = order.get('orderNumber');
        const sendMessage = order.get('textOptIn');
        
        console.log('Text message params:', { 
            customerPhone, 
            customerName, 
            orderNumber, 
            textOptIn: sendMessage 
        });

        
        if (sendMessage && customerPhone) {
            try {
                console.log('Attempting to send text message to:', customerPhone);
                const textResult = await sendText(customerPhone, `CAFE GOUGH: \nHello ${customerName}! Your order ${orderNumber} is ready!\nHead to the counter to pick it up!`);
                
                if (textResult.success) {
                    res.status(200).json({ message: 'Order finished successfully' });
                } else {
                    console.log(`Text error: ${textResult.error || 'No error details'}`);
                    res.status(200).json({ 
                        message: 'Order finished but failed to send text message',
                        textError: true,
                        textErrorDetails: textResult.error
                    });
                }
            } catch (textError) {
                console.error('Error sending notification:', textError);
                res.status(200).json({ message: 'Order finished but failed to send notifications', textError: true });
            }
        } else {
            console.log('Skipping text message - textOptIn:', sendMessage, 'customerPhone:', customerPhone ? 'present' : 'missing');
            res.status(200).json({ message: 'Order finished successfully', textOptIn: false });
        }
    } catch (error) {
        console.error('Error finishing order:', error);
        res.status(500).json({ error: 'Failed to finish order' });
    }
});

app.post('/delete-order', async (req, res) => {
    const { orderId } = req.body;
    await db.collection('orders').doc(orderId).delete();
    res.status(200).json({ message: 'Order deleted successfully' });
});

app.get('/items', async (req, res) => {
    const items = await db.collection('items').get();
    const itemsData = items.docs.map((doc) => {
        const data = doc.data();
        // Default soldOut to false if not present
        return {
            ...data,
            soldOut: data.soldOut ?? false,
            displayOrder: data.displayOrder ?? 999 // Default display order for existing items
        };
    });
    
    // Sort items by displayOrder, then by name as a fallback
    itemsData.sort((a: any, b: any) => {
        if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
        }
        return (a.name || '').localeCompare(b.name || '');
    });
    
    res.status(200).json(itemsData);
});

app.post('/create-item', async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        
        // This endpoint now only handles JSON data (no file upload)
        const { name, price, description, options, category } = req.body;
        
        if (!name || price === undefined || price === null) {
            res.status(400).json({ 
                error: 'Name and price are required fields' 
            });
            return;
        }

        // Parse options if needed
        let parsedOptions = options;
        if (typeof options === 'string') {
            try {
                parsedOptions = JSON.parse(options);
            } catch (e) {
                console.error('Error parsing options:', e);
                parsedOptions = [];
            }
        }

        try {
            // Create item document with only defined values
            const itemRef = db.collection('items').doc();
            const itemId = itemRef.id;
            
            // Build a document with only defined non-undefined values
            const itemData: Record<string, any> = {
                id: itemId,
                name: name,
                price: parseFloat(String(price)),
                createdAt: new Date().toISOString(),
                imageUrl: '', // Always provide a string value, never undefined
                category: category,
                displayOrder: 999 // Default display order for new items
            };
            
            // Only add these fields if they exist and are not undefined
            if (description !== undefined) itemData.description = description || '';
            if (parsedOptions !== undefined) itemData.options = parsedOptions || [];
            
            console.log('Saving item data to Firestore:', itemData);
            
            // Save to Firestore
            await itemRef.set(itemData);
            
            res.status(201).json({
                message: 'Item created successfully',
                itemId: itemId,
                item: itemData
            });
        } catch (dbError) {
            console.error('Firestore error:', dbError);
            
            // Return success response with mock data for testing
            const mockItemId = `test-${Date.now()}`;
            res.status(201).json({
                message: 'Item created successfully (mock data - Firestore error occurred)',
                itemId: mockItemId,
                item: {
                    id: mockItemId,
                    name: name,
                    price: parseFloat(String(price)),
                    description: description || '',
                    imageUrl: '',
                    options: parsedOptions || [],
                    createdAt: new Date().toISOString()
                },
                error: dbError instanceof Error ? dbError.message : String(dbError)
            });
        }
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Failed to create item: ' + (error instanceof Error ? error.message : String(error)) });
    }
});

app.post('/open-shop', async (req, res) => {
    const { isOpen } = req.body;
    await db.collection('shop').doc('open').set({ isOpen });
    res.status(200).json({ message: 'Shop status updated successfully' });
});

app.get('/shop-status', async (req, res) => {
    const shopDoc = await db.collection('shop').doc('open').get();
    const isOpen = shopDoc.get('isOpen');
    res.status(200).json({ isOpen });
});

// Add a more basic file upload endpoint with simpler configuration
app.post('/simple-upload', (req, res) => {
    // Create a simple single-file upload handler for each request
    const singleUpload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    }).single('file');
    
    singleUpload(req, res, function(err) {
        console.log('=== SIMPLE UPLOAD REQUEST RECEIVED ===');
        
        if (err) {
            console.error('Error in simple-upload:', err);
            return res.status(400).json({ error: err.message });
        }
        
        if (!req.file) {
            console.error('No file received in simple-upload');
            return res.status(400).json({ error: 'No file received' });
        }
        
        console.log('File received:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        
        return res.status(200).json({
            message: 'File uploaded successfully via simple-upload',
            file: {
                name: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size
            }
        });
    });
});

// Replace the existing upload-image endpoint with a more reliable version
app.post('/upload-image/:itemId', (req, res) => {
    const { itemId } = req.params;
    console.log('Received upload request for item ID:', itemId);
    
    // Create a single-use upload handler for this specific request
    const singleUpload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    }).single('file');
    
    singleUpload(req, res, async function(err) {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        
        if (!req.file) {
            console.error('No file in the request');
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        console.log('File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            fieldname: req.file.fieldname
        });
        
        try {
            // Get the item document to make sure it exists
            const itemDoc = await db.collection('items').doc(itemId).get();
            
            if (!itemDoc.exists) {
                console.error(`Item ${itemId} not found in database`);
                return res.status(404).json({ error: 'Item not found' });
            }
            
            console.log('Item found in database');
            
            const file = req.file;
            const fileName = `${uuidv4()}_${file.originalname}`;
            const tempFilePath = path.join(os.tmpdir(), fileName);

            console.log('Creating temp file at:', tempFilePath);
            
            // Write file to temp location
            fs.writeFileSync(tempFilePath, file.buffer);
            
            console.log('Temp file created, uploading to Storage');
            
            // Upload to Firebase Storage
            const fileUpload = bucket.file(`product-images/${fileName}`);
            
            await fileUpload.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });
            
            console.log('File uploaded to Storage, making it public');
            
            // Make the file publicly accessible
            await fileUpload.makePublic();
            
            // Get the public URL
            const imageUrl = `https://storage.googleapis.com/${bucket.name}/product-images/${fileName}`;
            console.log('Image URL:', imageUrl);
            
            // Clean up the temp file
            fs.unlinkSync(tempFilePath);
            console.log('Temp file cleaned up');
            
            // Update the item with the image URL
            await db.collection('items').doc(itemId).update({
                imageUrl: imageUrl
            });
            
            console.log('Item updated with image URL');
            
            return res.status(200).json({
                message: 'Image uploaded successfully',
                imageUrl: imageUrl
            });
            
        } catch (error) {
            console.error('Error processing upload:', error);
            return res.status(500).json({ 
                error: 'Failed to process upload: ' + (error instanceof Error ? error.message : String(error)) 
            });
        }
    });
});

// Add a base64 upload endpoint to avoid multipart form-data issues
app.post('/base64-upload/:itemId', (req, res) => {
    (async () => {
        try {
            const { itemId } = req.params;
            const { base64Data, filename, mimeType } = req.body;
            
            console.log('Received base64 upload request for item ID:', itemId);
            console.log('Filename:', filename);
            console.log('MIME Type:', mimeType);
            console.log('Content-Type header:', req.headers['content-type']);
            console.log('Content-Length:', req.headers['content-length']);
            console.log('Request body keys:', Object.keys(req.body));
            
            if (!base64Data) {
                console.error('Missing base64Data parameter');
                return res.status(400).json({ 
                    error: 'Missing base64Data parameter',
                    receivedKeys: Object.keys(req.body)
                });
            }
            
            if (!filename) {
                console.error('Missing filename parameter');
                return res.status(400).json({ 
                    error: 'Missing filename parameter',
                    receivedKeys: Object.keys(req.body)
                });
            }
            
            if (!mimeType) {
                console.error('Missing mimeType parameter');
                return res.status(400).json({ 
                    error: 'Missing mimeType parameter',
                    receivedKeys: Object.keys(req.body)
                });
            }
            
            // Check if the item exists
            try {
                const itemDoc = await db.collection('items').doc(itemId).get();
                if (!itemDoc.exists) {
                    console.error(`Item ${itemId} not found in database`);
                    return res.status(404).json({ error: 'Item not found' });
                }
                
                console.log('Item found in database');
            } catch (dbError) {
                console.error('Error fetching item from database:', dbError);
                return res.status(500).json({ 
                    error: 'Database error: ' + (dbError instanceof Error ? dbError.message : String(dbError))
                });
            }
            
            // Remove data:image/jpeg;base64, prefix if present
            let base64String = base64Data;
            if (base64String.includes(',')) {
                base64String = base64String.split(',')[1];
                console.log('Removed data URI prefix from base64 string');
            } else {
                console.log('No data URI prefix found in base64 string');
            }
            
            try {
                // Convert base64 to buffer
                console.log('Converting base64 to buffer...');
                const buffer = Buffer.from(base64String, 'base64');
                console.log('Converted base64 to buffer, size:', buffer.length);
                
                if (buffer.length === 0) {
                    throw new Error('Generated empty buffer from base64 data');
                }
                
                // Generate unique filename
                const uniqueFilename = `${uuidv4()}_${filename}`;
                console.log('Generated unique filename:', uniqueFilename);
                
                // Try uploading with multiple bucket formats
                let uploadSuccess = false;
                let storageError = null;
                let imageUrl = '';
                
                // Define the buckets to try in order
                const bucketsToTry = [
                    { name: 'Default bucket', bucket: bucket },
                    { name: 'With gs:// protocol', bucket: alternativeBuckets.withGsProtocol },
                    { name: 'Appspot format', bucket: alternativeBuckets.appspotFormat }
                ];
                
                for (const { name, bucket: currentBucket } of bucketsToTry) {
                    try {
                        console.log(`Trying upload with ${name}...`);
                        
                        // Upload to Firebase Storage
                        console.log('Creating file reference in Firebase Storage...');
                        const fileUpload = currentBucket.file(`product-images/${uniqueFilename}`);
                        
                        console.log('Uploading to Firebase Storage...');
                        // Use a promise with timeout to prevent hanging
                        const uploadPromise = fileUpload.save(buffer, {
                            metadata: {
                                contentType: mimeType,
                            },
                        });
                        
                        // Create a timeout promise
                        const timeoutPromise = new Promise((_, reject) => {
                            setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000);
                        });
                        
                        // Race the upload against the timeout
                        await Promise.race([uploadPromise, timeoutPromise]);
                        
                        console.log('File saved to Firebase Storage, now making it public...');
                        await fileUpload.makePublic();
                        
                        // Get the public URL
                        imageUrl = `https://storage.googleapis.com/${currentBucket.name}/product-images/${uniqueFilename}`;
                        console.log('Generated image URL:', imageUrl);
                        
                        uploadSuccess = true;
                        console.log(`Upload successful with ${name}!`);
                        break; // Exit the loop if successful
                    } catch (error) {
                        console.error(`Error uploading with ${name}:`, error);
                        storageError = error;
                        // Continue to the next bucket format
                    }
                }
                
                if (!uploadSuccess) {
                    console.error('All bucket formats failed for upload');
                    throw storageError || new Error('Failed to upload to any bucket format');
                }
                
                // Update the item with the image URL
                console.log('Updating item in database with the image URL...');
                await db.collection('items').doc(itemId).update({
                    imageUrl: imageUrl
                });
                
                console.log('Item updated with image URL successfully');
                
                return res.status(200).json({
                    message: 'Image uploaded successfully',
                    imageUrl: imageUrl
                });
            } catch (storageError) {
                console.error('Firebase Storage error:', storageError);
                return res.status(500).json({ 
                    error: 'Firebase Storage error: ' + (storageError instanceof Error ? storageError.message : String(storageError)),
                    stage: 'saving to storage'
                });
            }
        } catch (bufferError) {
            console.error('Buffer conversion error:', bufferError);
            return res.status(400).json({ 
                error: 'Failed to process base64 data: ' + (bufferError instanceof Error ? bufferError.message : String(bufferError))
            });
        }
    })();
});

// Add a simple test endpoint
app.get('/test', (req, res) => {
    res.status(200).json({ 
        message: 'API is working correctly',
        timestamp: new Date().toISOString()
    });
});

// Add a simple POST test endpoint
app.post('/test-post', (req, res) => {
    console.log('Received test POST with body:', req.body);
    
    res.status(200).json({
        message: 'POST request received successfully',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});

// Add a simple file upload test endpoint
app.post('/test-upload', upload.single('file'), (req, res) => {
    console.log('=== TEST UPLOAD RECEIVED ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
    } : 'No file');
    
    if (!req.file) {
        console.error('No file received in test-upload');
        res.status(400).json({ 
            error: 'No file received',
            headers: req.headers,
            contentType: req.headers['content-type']
        });
        return;
    }
    
    res.status(200).json({
        message: 'File received successfully',
        file: {
            name: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size
        }
    });
});

// Add a test endpoint to check Firebase Storage access
app.get('/test-storage', (req, res) => {
    (async () => {
        try {
            console.log('Testing Firebase Storage access...');
            console.log('Bucket name:', bucket.name);
            
            // Try to list files in the bucket
            const [files] = await bucket.getFiles({ prefix: 'product-images/' });
            console.log(`Found ${files.length} files in product-images/ directory`);
            
            // Create a test file
            const testFileName = `test-${Date.now()}.txt`;
            const testFile = bucket.file(`product-images/${testFileName}`);
            
            await testFile.save('This is a test file to check storage access', {
                metadata: {
                    contentType: 'text/plain',
                },
            });
            
            console.log('Test file created successfully');
            
            // Make it public
            await testFile.makePublic();
            console.log('Test file made public');
            
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/product-images/${testFileName}`;
            
            // Delete the test file
            await testFile.delete();
            console.log('Test file deleted successfully');
            
            return res.status(200).json({
                message: 'Firebase Storage test successful',
                bucketName: bucket.name,
                filesFound: files.length,
                testFileUrl: publicUrl
            });
        } catch (error) {
            console.error('Error testing Firebase Storage:', error);
            return res.status(500).json({
                error: 'Firebase Storage test failed',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    })();
});

// Add a detailed test endpoint to diagnose Firebase Storage issues
app.get('/diagnose-storage', (req, res) => {
    (async () => {
        try {
            console.log('Running comprehensive Firebase Storage diagnostic...');
            
            // Step 1: Check bucket exists and is accessible
            console.log('Step 1: Checking bucket configuration');
            console.log('Bucket name:', bucket.name);
            console.log('Bucket metadata:', bucket.metadata);
            
            const diagnosticResults: DiagnosticResults = {
                bucketName: bucket.name,
                storagePermissionResults: {},
                firebaseConfig: {
                    projectId: admin.app().options.projectId,
                    storageBucket: admin.app().options.storageBucket
                },
                steps: {}
            };
            
            // Step 2: Try basic file operations
            console.log('Step 2: Testing basic file operations');
            
            try {
                // Create a test file with text content
                const testFileName = `diagnostic-${Date.now()}.txt`;
                const testFilePath = `product-images/${testFileName}`;
                const testFileContent = 'This is a diagnostic test file created on ' + new Date().toISOString();
                
                console.log(`Creating test file: ${testFilePath}`);
                const testFile = bucket.file(testFilePath);
                
                // Upload the test file
                await testFile.save(testFileContent, {
                    metadata: {
                        contentType: 'text/plain',
                    }
                });
                console.log('Test file created successfully');
                
                diagnosticResults.steps['createFile'] = 'success';
                
                // Try to make the file public
                console.log('Making test file public');
                await testFile.makePublic();
                console.log('File made public successfully');
                
                diagnosticResults.steps['makePublic'] = 'success';
                
                // Get the file's metadata
                console.log('Getting file metadata');
                const [metadata] = await testFile.getMetadata();
                console.log('File metadata:', metadata);
                
                diagnosticResults.steps['getMetadata'] = 'success';
                diagnosticResults.fileMetadata = metadata;
                
                // Get the file's download URL
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${testFilePath}`;
                console.log('Public URL:', publicUrl);
                
                diagnosticResults.steps['getPublicUrl'] = 'success';
                diagnosticResults.publicUrl = publicUrl;
                
                // Read the file back
                console.log('Reading file content');
                const [fileContent] = await testFile.download();
                console.log('File content:', fileContent.toString());
                
                diagnosticResults.steps['readFile'] = 'success';
                
                // Clean up
                console.log('Deleting test file');
                await testFile.delete();
                console.log('Test file deleted');
                
                diagnosticResults.steps['deleteFile'] = 'success';
                
            } catch (fileOpError) {
                console.error('Error in file operations:', fileOpError);
                diagnosticResults.fileOperationError = {
                    message: fileOpError instanceof Error ? fileOpError.message : String(fileOpError),
                    stack: fileOpError instanceof Error ? fileOpError.stack : undefined
                };
            }
            
            // Step 3: Check permissions
            console.log('Step 3: Checking bucket permissions');
            try {
                const [acl] = await bucket.acl.get();
                diagnosticResults.storagePermissionResults.acl = acl;
                console.log('Bucket ACL:', acl);
            } catch (aclError) {
                console.error('Error getting bucket ACL:', aclError);
                diagnosticResults.storagePermissionResults.aclError = {
                    message: aclError instanceof Error ? aclError.message : String(aclError)
                };
            }
            
            // Step 4: Check if we can list files
            console.log('Step 4: Listing files in product-images/');
            try {
                const [files] = await bucket.getFiles({ prefix: 'product-images/' });
                console.log(`Found ${files.length} files`);
                diagnosticResults.fileCount = files.length;
                diagnosticResults.sampleFiles = files.slice(0, 5).map(file => file.name);
            } catch (listError) {
                console.error('Error listing files:', listError);
                diagnosticResults.listFilesError = {
                    message: listError instanceof Error ? listError.message : String(listError)
                };
            }
            
            return res.status(200).json({
                message: 'Firebase Storage diagnostic completed',
                diagnosticResults
            });
        } catch (error) {
            console.error('Error in storage diagnostic:', error);
            return res.status(500).json({
                error: 'Firebase Storage diagnostic failed',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    })();
});

// Add an endpoint to check Firebase Storage configuration
app.get('/check-storage-config', (req, res) => {
    (async () => {
        try {
            console.log('Checking Firebase Storage configuration...');
            
            // Get Firebase project configuration
            const projectId = admin.app().options.projectId;
            const storageBucket = admin.app().options.storageBucket;
            
            console.log('Project ID:', projectId);
            console.log('Configured Storage Bucket:', storageBucket);
            
            // Get current bucket information
            let currentBucket = null;
            try {
                const [metadata] = await bucket.getMetadata();
                currentBucket = metadata;
                console.log('Current bucket metadata:', currentBucket);
            } catch (bucketError) {
                console.error('Error getting bucket metadata:', bucketError);
            }
            
            // Check if we can use the default bucket or need to specify one
            let usableDefaultBucket = false;
            let defaultBucketName = '';
            
            if (storageBucket) {
                defaultBucketName = storageBucket;
                try {
                    const defaultBucket = storage.bucket(storageBucket);
                    const [exists] = await defaultBucket.exists();
                    usableDefaultBucket = exists;
                    console.log(`Default bucket ${storageBucket} exists:`, exists);
                } catch (error) {
                    console.error('Default bucket not usable:', error);
                }
            }
            
            // Check if projectId-based bucket exists (common pattern)
            let projectBucketExists = false;
            const projectBucketName = `${projectId}.appspot.com`;
            
            try {
                const projectBucket = storage.bucket(projectBucketName);
                const [exists] = await projectBucket.exists();
                projectBucketExists = exists;
                console.log(`Project bucket ${projectBucketName} exists:`, exists);
            } catch (error) {
                console.error('Error checking project bucket:', error);
            }
            
            return res.status(200).json({
                projectId,
                configuredStorageBucket: storageBucket,
                currentBucketMetadata: currentBucket,
                defaultBucketUsable: usableDefaultBucket,
                defaultBucketName,
                projectBucketExists,
                projectBucketName,
                recommendation: projectBucketExists ? 
                    `Use storage.bucket('${projectBucketName}')` : 
                    (usableDefaultBucket ? 
                        `Use storage.bucket('${defaultBucketName}')` : 
                        'Create a new bucket in Firebase Console')
            });
        } catch (error) {
            console.error('Error checking storage configuration:', error);
            return res.status(500).json({
                error: 'Failed to check storage configuration',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    })();
});

// Add an endpoint to test all available bucket configurations
app.get('/test-all-buckets', (req, res) => {
    (async () => {
        try {
            console.log('Testing all available bucket configurations...');
            
            interface BucketTestResult {
                bucket: string;
                name: string;
                content?: string;
                error?: string;
            }
            
            const results: {
                buckets: string[];
                successful: BucketTestResult[];
                errors: BucketTestResult[];
            } = {
                buckets: [],
                successful: [],
                errors: []
            };
            
            // Define the buckets to try
            const bucketsToTry = [
                { 
                    name: 'Default bucket', 
                    bucket: bucket,
                    bucketName: bucket.name
                },
                { 
                    name: 'With gs:// protocol', 
                    bucket: alternativeBuckets.withGsProtocol,
                    bucketName: alternativeBuckets.withGsProtocol.name
                },
                { 
                    name: 'Appspot format', 
                    bucket: alternativeBuckets.appspotFormat,
                    bucketName: alternativeBuckets.appspotFormat.name
                },
                {
                    name: 'Direct gs:// path',
                    bucket: storage.bucket('gs://cafe-pos-gough.firebasestorage.app'),
                    bucketName: 'gs://cafe-pos-gough.firebasestorage.app'
                },
                {
                    name: 'Without gs:// prefix',
                    bucket: storage.bucket('cafe-pos-gough.firebasestorage.app'),
                    bucketName: 'cafe-pos-gough.firebasestorage.app'
                },
                {
                    name: 'With appspot.com domain',
                    bucket: storage.bucket('cafe-pos-gough.appspot.com'),
                    bucketName: 'cafe-pos-gough.appspot.com'
                }
            ];
            
            results.buckets = bucketsToTry.map(b => b.bucketName);
            
            // Test each bucket
            for (const { name, bucket: testBucket, bucketName } of bucketsToTry) {
                console.log(`Testing ${name}: ${bucketName}`);
                
                try {
                    // Try to create and read a test file
                    const testFileName = `test-bucket-${Date.now()}.txt`;
                    const testContent = `Testing bucket ${name} at ${new Date().toISOString()}`;
                    
                    console.log(`Creating test file in ${name}...`);
                    const testFile = testBucket.file(`tests/${testFileName}`);
                    
                    await testFile.save(testContent, {
                        metadata: {
                            contentType: 'text/plain',
                        },
                    });
                    
                    console.log(`Test file created in ${name}`);
                    
                    // Try to read the file back
                    const [fileContent] = await testFile.download();
                    const contentString = fileContent.toString();
                    console.log(`Read content from ${name}:`, contentString);
                    
                    // Try to delete the file
                    await testFile.delete();
                    console.log(`Deleted test file from ${name}`);
                    
                    results.successful.push({
                        bucket: bucketName,
                        name,
                        content: contentString
                    });
                } catch (error) {
                    console.error(`Error testing ${name}:`, error);
                    results.errors.push({
                        bucket: bucketName,
                        name,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
            
            return res.status(200).json({
                message: 'Bucket tests completed',
                results
            });
        } catch (error) {
            console.error('Error testing buckets:', error);
            return res.status(500).json({
                error: 'Failed to test buckets',
                message: error instanceof Error ? error.message : String(error)
            });
        }
    })();
});

// Update item status (sold out/available)
app.put('/items/:itemId/status', async (req: any, res: any) => {
    try {
        const { itemId } = req.params;
        const { soldOut } = req.body;
        
        if (typeof soldOut !== 'boolean') {
            return res.status(400).json({ error: 'soldOut must be a boolean value' });
        }
        
        const itemRef = db.collection('items').doc(itemId);
        const itemDoc = await itemRef.get();
        
        if (!itemDoc.exists) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        await itemRef.update({ soldOut });
        
        res.status(200).json({ 
            message: `Item ${soldOut ? 'marked as sold out' : 'marked as available'}`,
            itemId,
            soldOut
        });
    } catch (error) {
        console.error('Error updating item status:', error);
        res.status(500).json({ error: 'Failed to update item status' });
    }
});

// Delete an item
app.delete('/items/:itemId', async (req: any, res: any) => {
    try {
        const { itemId } = req.params;
        
        const itemRef = db.collection('items').doc(itemId);
        const itemDoc = await itemRef.get();
        
        if (!itemDoc.exists) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        await itemRef.delete();
        
        res.status(200).json({ 
            message: 'Item deleted successfully',
            itemId
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Update item category
app.put('/items/:itemId/category', async (req: any, res: any) => {
    try {
        const { itemId } = req.params;
        const { category } = req.body;
        
        if (!category || typeof category !== 'string') {
            return res.status(400).json({ error: 'Category must be a valid string' });
        }
        
        const itemRef = db.collection('items').doc(itemId);
        const itemDoc = await itemRef.get();
        
        if (!itemDoc.exists) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        await itemRef.update({ category });
        
        res.status(200).json({ 
            message: 'Item category updated successfully',
            itemId,
            category
        });
    } catch (error) {
        console.error('Error updating item category:', error);
        res.status(500).json({ error: 'Failed to update item category' });
    }
});

// Update item display order
app.put('/items/:itemId/display-order', async (req: any, res: any) => {
    try {
        const { itemId } = req.params;
        const { displayOrder } = req.body;
        
        if (typeof displayOrder !== 'number' || displayOrder < 0) {
            return res.status(400).json({ error: 'Display order must be a non-negative number' });
        }
        
        const itemRef = db.collection('items').doc(itemId);
        const itemDoc = await itemRef.get();
        
        if (!itemDoc.exists) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        await itemRef.update({ displayOrder });
        
        res.status(200).json({ 
            message: 'Item display order updated successfully',
            itemId,
            displayOrder
        });
    } catch (error) {
        console.error('Error updating item display order:', error);
        res.status(500).json({ error: 'Failed to update item display order' });
    }
});

// Admin authentication endpoint
app.post('/admin-auth', async (req: any, res: any) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }
        
        // Get the admin password from Firebase secrets
        const correctPassword = adminPassword.value();
        
        if (password === correctPassword) {
            res.status(200).json({ 
                success: true,
                message: 'Authentication successful'
            });
        } else {
            res.status(401).json({ 
                success: false,
                message: 'Invalid password'
            });
        }
    } catch (error) {
        console.error('Error in admin authentication:', error);
        res.status(500).json({ 
            success: false,
            error: 'Authentication failed' 
        });
    }
});

export const api = onRequest({
  secrets: [twilioAccountSid, twilioAuthToken, twilioPhoneNumber, adminPassword],  // Explicitly include the secret dependency here
  maxInstances: 10,
}, app);
