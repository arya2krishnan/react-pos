// Example Express backend for handling item creation and image upload separately
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');

const app = express();
const port = process.env.PORT || 8080;

// Firestore setup
const firestore = new Firestore({
  projectId: 'your-project-id',
  // Other configuration as needed
});

// Google Cloud Storage setup
const storage = new Storage({
  projectId: 'your-project-id',
  // Other configuration as needed
});
const bucket = storage.bucket('your-bucket-name');

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

// Create an item (JSON data only)
app.post('/create-item', async (req, res) => {
  try {
    const itemData = req.body;
    
    // Validate required fields
    if (!itemData.name || !itemData.price) {
      return res.status(400).json({
        success: false,
        error: 'Name and price are required fields'
      });
    }
    
    // Add timestamp
    itemData.createdAt = new Date().toISOString();
    
    // Add to Firestore
    const itemRef = firestore.collection('items').doc();
    await itemRef.set(itemData);
    
    // Return the created item with ID
    return res.status(201).json({
      success: true,
      data: {
        id: itemRef.id,
        ...itemData
      }
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create item'
    });
  }
});

// Upload an image for an item
app.post('/upload-image/:itemId', upload.single('file'), async (req, res) => {
  try {
    const { itemId } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Check if item exists
    const itemRef = firestore.collection('items').doc(itemId);
    const item = await itemRef.get();
    
    if (!item.exists) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    // Create a unique filename
    const fileName = `items/${itemId}/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);
    
    // Create a write stream and upload the file
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
    
    // Handle stream errors
    blobStream.on('error', (error) => {
      console.error('Upload error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error uploading file'
      });
    });
    
    // Handle successful upload
    blobStream.on('finish', async () => {
      // Make the file publicly accessible
      await fileUpload.makePublic();
      
      // Get the public URL
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      // Update the item with the image URL
      await itemRef.update({ imageUrl });
      
      return res.status(200).json({
        success: true,
        imageUrl
      });
    });
    
    // Send the file to the stream
    blobStream.end(file.buffer);
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 