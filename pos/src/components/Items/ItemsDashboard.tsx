import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  DialogActions,
  Sheet,
  Table,
  Select,
  Option
} from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiService, ItemData } from '../../services/api';

interface ItemsDashboardProps {
  onItemsChange?: () => void;
}

export default function ItemsDashboard({ onItemsChange }: ItemsDashboardProps) {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemData | null>(null);
  const [bringBackDialogOpen, setBringBackDialogOpen] = useState(false);
  const [itemToBringBack, setItemToBringBack] = useState<ItemData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [bringingBackItem, setBringingBackItem] = useState<string | null>(null);
  const [updatingDisplayOrder, setUpdatingDisplayOrder] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getItems();
      
      if (response.success && response.data) {
        setItems(response.data);
      } else {
        setError(response.error || 'Failed to fetch items');
      }
    } catch (err) {
      setError('Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleSoldOut = async (item: ItemData) => {
    if (!item.id) return;
    
    try {
      setUpdatingItem(item.id.toString());
      const newSoldOutStatus = !item.soldOut;
      
      const response = await apiService.updateItemStatus(item.id.toString(), newSoldOutStatus);
      
      if (response.success) {
        // Update the local state
        setItems(prevItems => 
          prevItems.map(prevItem => 
            prevItem.id === item.id 
              ? { ...prevItem, soldOut: newSoldOutStatus }
              : prevItem
          )
        );
        
        // Notify parent component if callback provided
        if (onItemsChange) {
          onItemsChange();
        }
      } else {
        setError(response.error || 'Failed to update item status');
      }
    } catch (err) {
      setError('Failed to update item status');
      console.error('Error updating item status:', err);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleDeleteClick = (item: ItemData) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.id) return;
    
    try {
      setDeletingItem(itemToDelete.id.toString());
      const response = await apiService.deleteItem(itemToDelete.id.toString());
      
      if (response.success) {
        // Remove the item from local state
        setItems(prevItems => 
          prevItems.filter(item => item.id !== itemToDelete.id)
        );
        
        // Notify parent component if callback provided
        if (onItemsChange) {
          onItemsChange();
        }
        
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } else {
        setError(response.error || 'Failed to delete item');
      }
    } catch (err) {
      setError('Failed to delete item');
      console.error('Error deleting item:', err);
    } finally {
      setDeletingItem(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleArchiveClick = async (item: ItemData) => {
    if (!item.id) return;
    
    try {
      setUpdatingItem(item.id.toString());
      const response = await apiService.updateItemCategory(item.id.toString(), 'o');
      
      if (response.success) {
        // Update the local state
        setItems(prevItems => 
          prevItems.map(prevItem => 
            prevItem.id === item.id 
              ? { ...prevItem, category: 'o' }
              : prevItem
          )
        );
        
        // Notify parent component if callback provided
        if (onItemsChange) {
          onItemsChange();
        }
      } else {
        setError(response.error || 'Failed to archive item');
      }
    } catch (err) {
      setError('Failed to archive item');
      console.error('Error archiving item:', err);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleBringBackClick = (item: ItemData) => {
    setItemToBringBack(item);
    setSelectedCategory('');
    setBringBackDialogOpen(true);
  };

  const handleBringBackConfirm = async () => {
    if (!itemToBringBack?.id || !selectedCategory) return;
    
    try {
      setBringingBackItem(itemToBringBack.id.toString());
      const response = await apiService.updateItemCategory(itemToBringBack.id.toString(), selectedCategory);
      
      if (response.success) {
        // Update the local state
        setItems(prevItems => 
          prevItems.map(prevItem => 
            prevItem.id === itemToBringBack.id 
              ? { ...prevItem, category: selectedCategory }
              : prevItem
          )
        );
        
        // Notify parent component if callback provided
        if (onItemsChange) {
          onItemsChange();
        }
        
        setBringBackDialogOpen(false);
        setItemToBringBack(null);
        setSelectedCategory('');
      } else {
        setError(response.error || 'Failed to bring back item');
      }
    } catch (err) {
      setError('Failed to bring back item');
      console.error('Error bringing back item:', err);
    } finally {
      setBringingBackItem(null);
    }
  };

  const handleBringBackCancel = () => {
    setBringBackDialogOpen(false);
    setItemToBringBack(null);
    setSelectedCategory('');
  };

  const handleDisplayOrderChange = async (item: ItemData, newOrder: number) => {
    if (!item.id) return;
    
    try {
      setUpdatingDisplayOrder(item.id.toString());
      const response = await apiService.updateItemDisplayOrder(item.id.toString(), newOrder);
      
      if (response.success) {
        // Update the local state
        setItems(prevItems => 
          prevItems.map(prevItem => 
            prevItem.id === item.id 
              ? { ...prevItem, displayOrder: newOrder }
              : prevItem
          )
        );
        
        // Notify parent component if callback provided
        if (onItemsChange) {
          onItemsChange();
        }
      } else {
        setError(response.error || 'Failed to update display order');
      }
    } catch (err) {
      setError('Failed to update display order');
      console.error('Error updating display order:', err);
    } finally {
      setUpdatingDisplayOrder(null);
    }
  };



  const getAvailableCategories = () => {
    return [
      { value: 'sp', label: 'Specialty Coffee' },
      { value: 'st', label: 'Standard' },
      { value: 't', label: 'Specialty Tea' },
      { value: 'e', label: 'Espresso' },
      { value: 'cb', label: 'Cold Brew' },
      { value: 'm', label: 'Matcha' },
      { value: 'misc', label: 'Misc.' }
    ];
  };

  // Separate items into active and old categories, and sort active items by display order
  const activeItems = items
    .filter(item => item.category !== 'o')
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  const oldItems = items.filter(item => item.category === 'o');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography level="h3" sx={{ mb: 3 }}>
        Items Dashboard
      </Typography>
      
      {error && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Active Items Table */}
      <Typography level="h4" sx={{ mb: 2, mt: 4 }}>
        Active Items ({activeItems.length})
      </Typography>
      <Sheet sx={{ maxHeight: 400, overflow: 'auto', mb: 4 }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Status</th>
              <th>Display Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <Typography level="body-md" fontWeight="md">
                    {item.name}
                  </Typography>
                </td>
                <td>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={item.soldOut ? 'danger' : 'success'}
                  >
                    {item.soldOut ? 'Sold Out' : 'Available'}
                  </Chip>
                </td>
                <td>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="number"
                      value={item.displayOrder ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          // Allow empty input for better UX
                          return;
                        }
                        const newOrder = parseInt(value);
                        if (!isNaN(newOrder)) {
                          handleDisplayOrderChange(item, newOrder);
                        }
                      }}
                      onBlur={(e) => {
                        // When user leaves the field, ensure we have a valid value
                        const value = e.target.value;
                        if (value === '' || isNaN(parseInt(value))) {
                          handleDisplayOrderChange(item, 999);
                        }
                      }}
                      placeholder="999"
                      style={{
                        width: '60px',
                        padding: '4px 8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                      disabled={updatingDisplayOrder === item.id?.toString()}
                    />
                    {updatingDisplayOrder === item.id?.toString() && (
                      <CircularProgress size="sm" />
                    )}
                  </Box>
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="sm"
                      variant="soft"
                      color={item.soldOut ? 'success' : 'warning'}
                      onClick={() => handleToggleSoldOut(item)}
                      disabled={updatingItem === item.id?.toString()}
                    >
                      {updatingItem === item.id?.toString() ? (
                        <CircularProgress size="sm" />
                      ) : (
                        item.soldOut ? 'Mark Available' : 'Mark Sold Out'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="soft"
                      color="neutral"
                      onClick={() => handleArchiveClick(item)}
                      disabled={updatingItem === item.id?.toString()}
                    >
                      Archive
                    </Button>
                    <IconButton
                      size="sm"
                      color="danger"
                      variant="soft"
                      onClick={() => handleDeleteClick(item)}
                      disabled={deletingItem === item.id?.toString()}
                    >
                      {deletingItem === item.id?.toString() ? (
                        <CircularProgress size="sm" />
                      ) : (
                        <DeleteIcon />
                      )}
                    </IconButton>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>

      {/* Old Items Table */}
      <Typography level="h4" sx={{ mb: 2 }}>
        Old/Outdated Items ({oldItems.length})
      </Typography>
      <Sheet sx={{ maxHeight: 400, overflow: 'auto' }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {oldItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <Typography level="body-md" fontWeight="md">
                    {item.name}
                  </Typography>
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="sm"
                      variant="soft"
                      color="success"
                      onClick={() => handleBringBackClick(item)}
                      disabled={bringingBackItem === item.id?.toString()}
                    >
                      {bringingBackItem === item.id?.toString() ? (
                        <CircularProgress size="sm" />
                      ) : (
                        'Bring Back'
                      )}
                    </Button>
                    <IconButton
                      size="sm"
                      color="danger"
                      variant="soft"
                      onClick={() => handleDeleteClick(item)}
                      disabled={deletingItem === item.id?.toString()}
                    >
                      {deletingItem === item.id?.toString() ? (
                        <CircularProgress size="sm" />
                      ) : (
                        <DeleteIcon />
                      )}
                    </IconButton>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Delete Item</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="soft" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button 
              color="danger" 
              onClick={handleDeleteConfirm}
              disabled={deletingItem === itemToDelete?.id?.toString()}
            >
              {deletingItem === itemToDelete?.id?.toString() ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Bring Back Dialog */}
      <Modal open={bringBackDialogOpen} onClose={handleBringBackCancel}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Bring Back Item</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Select a category for "{itemToBringBack?.name}":
            </Typography>
            <Select
              value={selectedCategory}
              onChange={(_, value) => setSelectedCategory(value || '')}
              placeholder="Choose a category"
              sx={{ width: '100%' }}
            >
              {getAvailableCategories().map((category) => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button variant="soft" onClick={handleBringBackCancel}>
              Cancel
            </Button>
            <Button 
              color="success" 
              onClick={handleBringBackConfirm}
              disabled={!selectedCategory || bringingBackItem === itemToBringBack?.id?.toString()}
            >
              {bringingBackItem === itemToBringBack?.id?.toString() ? 'Bringing Back...' : 'Bring Back'}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
