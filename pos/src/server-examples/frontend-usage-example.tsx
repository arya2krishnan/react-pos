import React, { useState } from 'react';
import { apiService, ItemData } from '../services/api';

// Extend ItemData to include the id that's returned from the server
interface CreatedItemData extends ItemData {
  id: string;
}

const CreateItemForm: React.FC = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Create the item first
      const itemData: Partial<ItemData> = {
        name,
        price: typeof price === 'string' ? parseFloat(price) : price,
        options: {}
      };

      const createResponse = await apiService.createItem(JSON.stringify(itemData));

      if (!createResponse.success || !createResponse.data) {
        throw new Error(createResponse.error || 'Failed to create item');
      }

      const createdItem = createResponse.data as CreatedItemData;
      const itemId = createdItem.id;

      if (!itemId) {
        throw new Error('No item ID returned from server');
      }

      let imageUrl = '';

      // Step 2: Upload the image if one was selected
      if (image) {
        const uploadResponse = await apiService.uploadItemImageBase64(itemId, image);

        if (!uploadResponse.success || !uploadResponse.data) {
          // Don't fail the whole operation, just note the image upload failed
          console.error('Image upload failed:', uploadResponse.error);
          setError(`Item created, but image upload failed: ${uploadResponse.error}`);
        } else {
          imageUrl = uploadResponse.data.imageUrl;
          setSuccess(`Item created successfully with image!`);
        }
      } else {
        setSuccess('Item created successfully (no image)');
      }

      // Clear the form
      setName('');
      setPrice('');
      setImage(null);
      
      // You might want to refresh your items list or navigate somewhere
      console.log('Created item:', { ...createdItem, imageUrl });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error creating item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-item-form">
      <h2>Create New Item</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Item Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price *</label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : '')}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Item Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Item'}
        </button>
      </form>
    </div>
  );
};

export default CreateItemForm; 