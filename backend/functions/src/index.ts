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
import { bucket } from './firebase';

const app = express();
app.use(cors());
app.use(express.json());

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
  },
});

app.post('/new-order', async (req, res) => {
    const { orderNumber, customerName, customerPhone, items, totalAmount, donation, orderDate, textOptIn } = req.body;

    try {
        const orderRef = db.collection('orders').doc();
        await orderRef.set({
            orderNumber,
            customerName,
            customerPhone,
            items,
            totalAmount,
            donation,
            orderDate,
            textOptIn,
            finished: false,
        });

        res.status(201).json({ message: 'Order submitted successfully', orderId: orderRef.id });
    } catch (error) {
        console.error('Error submitting order:', error);
        res.status(500).json({ error: 'Failed to submit order' });
    }
});

app.get('/unfinished-orders', async (req, res) => {
    try {
        const orders = await db.collection('orders').where('finished', '==', false).get();
        const ordersData = orders.docs.map((doc) => doc.data());
        res.status(200).json(ordersData);
    } catch (error) {
        console.error('Error fetching unfinished orders:', error);
        res.status(500).json({ error: 'Failed to fetch unfinished orders' });
    }
});

app.post('/finish-order', async (req, res) => {
    const { orderId } = req.body;

    try {
        await db.collection('orders').doc(orderId).update({ finished: true });
        const order = await db.collection('orders').doc(orderId).get();
        const phoneNumber = order.get('phoneNumber');
        const orderNumber = order.get('orderNumber');
        const sendMessage = order.get('textOptIn');
        if (sendMessage) {
            await sendText(phoneNumber, `Your order ${orderNumber} is ready!`);
        } else {
            res.status(404).json({ error: 'Text opt-in not found, yell out the order name instead!' });
        }
        res.status(200).json({ message: 'Order finished successfully' });
    } catch (error) {
        console.error('Error finishing order:', error);
        res.status(500).json({ error: 'Failed to finish order' });
    }
});

app.get('/items', async (req, res) => {
    const items = await db.collection('items').get();
    const itemsData = items.docs.map((doc) => doc.data());
    res.status(200).json(itemsData);
});

app.post('/create-item', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, options } = req.body;
        let imageUrl = '';

        // Handle image upload if a file was provided
        if (req.file) {
            const file = req.file;
            const fileName = `${uuidv4()}_${file.originalname}`;
            const tempFilePath = path.join(os.tmpdir(), fileName);

            // Write file to temp location
            fs.writeFileSync(tempFilePath, file.buffer);
            
            // Upload to Firebase Storage
            const fileUpload = bucket.file(`product-images/${fileName}`);
            
            await fileUpload.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });
            
            // Make the file publicly accessible
            await fileUpload.makePublic();
            
            // Get the public URL
            imageUrl = `https://storage.googleapis.com/${bucket.name}/product-images/${fileName}`;
            
            // Clean up the temp file
            fs.unlinkSync(tempFilePath);
        }

        // Parse options if provided as a string (from form data)
        let parsedOptions = options;
        if (typeof options === 'string') {
            try {
                parsedOptions = JSON.parse(options);
            } catch (e) {
                console.error('Error parsing options:', e);
                parsedOptions = [];
            }
        }

        // Create the item in Firestore
        const itemRef = db.collection('items').doc();
        await itemRef.set({
            name,
            price: parseFloat(price),
            description,
            imageUrl,
            options: parsedOptions || [],
            createdAt: new Date().toISOString()
        });

        res.status(201).json({
            message: 'Item created successfully',
            itemId: itemRef.id,
            item: {
                name,
                price: parseFloat(price),
                description,
                imageUrl,
                options: parsedOptions || []
            }
        });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

export const api = onRequest(app);
