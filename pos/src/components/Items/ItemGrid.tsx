import { Box } from '@mui/joy';
import { useState } from 'react';
import { ItemData } from '../../services/api';
import ItemCard from './ItemCard';
import ItemOptionsModal from './ItemOptionsModal';
import { useCartStore } from '../../store/cartStore';

interface ItemOption {
  name: string;
  values: string[];
  isMultiple: boolean;
}

interface ItemGridProps {
  items: ItemData[];
}

export default function ItemGrid({ items }: ItemGridProps) {
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleItemClick = (item: ItemData) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleAddToCart = (item: ItemData, selectedOptions: Record<string, string[]>, quantity: number) => {
    addItem(item, selectedOptions, quantity);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(5, 1fr)'
          },
          gap: 3
        }}
      >
        {items.map((item) => (
          <Box key={item.id}>
            <ItemCard
              url={item.imageUrl || ''}
              title={item.title || item.name}
              description={item.description || ''}
              onClick={() => handleItemClick(item)}
            />
          </Box>
        ))}
      </Box>

      {selectedItem && (
        <ItemOptionsModal
          item={selectedItem.title || selectedItem.name}
          options={Array.isArray(selectedItem.options) 
            ? selectedItem.options.map((option: ItemOption) => ({
                option: option.name,
                options: option.values,
                isMultiple: option.isMultiple,
                onChange: () => {},
              }))
            : []
          }
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={(selectedValues: Record<string, string[]>, quantity: number) => {
            handleAddToCart(selectedItem, selectedValues, quantity);
          }}
        />
      )}
    </Box>
  );
} 