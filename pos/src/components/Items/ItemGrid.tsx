import { Box, Typography, Divider, Tabs, TabList, Tab, tabClasses } from '@mui/joy';
import { useState, useMemo, useRef, useEffect } from 'react';
import { ItemData } from '../../services/api';
import ItemCard from './ItemCard';
import ItemOptionsModal from './ItemOptionsModal';
import { useCartStore } from '../../store/cartStore';
import { SyntheticEvent } from 'react';

interface ItemOption {
  name: string;
  values: string[];
  isMultiple: boolean;
}

interface ItemGridProps {
  items: ItemData[];
}

// Category display names
const categoryNames = {
  'e': 'Espresso',
  'cb': 'Cold Brew',
  'm': 'Matcha',
  'sp': 'Specialty',
  'st': 'Standard',
  'misc': 'Misc.'
};

// Category display order (excludes 'o' for old/outdated items)
const categoryOrder = ['sp', 'st', 'e', 'cb', 'm', 'misc'];

export default function ItemGrid({ items }: ItemGridProps) {
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [isManualTabClick, setIsManualTabClick] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const addItem = useCartStore((state) => state.addItem);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      // Determine the category (default to 'misc' if not specified)
      const category = item.category || 'misc';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ItemData[]>);
    
    // Ensure all categories exist, even if empty
    categoryOrder.forEach(category => {
      if (!grouped[category]) {
        grouped[category] = [];
      }
    });
    
    return grouped;
  }, [items]);

  const handleItemClick = (item: ItemData) => {
    // Don't allow adding sold out items to cart
    if (item.soldOut) {
      return;
    }
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

  const handleTabChange = (_event: SyntheticEvent<Element, Event> | null, value: string | number | null) => {
    if (value !== null) {
      const newValue = typeof value === 'string' ? parseInt(value, 10) : value;
      setActiveCategory(newValue);
      setIsManualTabClick(true);
      
      // Get the category key at this index (filtering out empty categories)
      const visibleCategories = categoryOrder.filter(cat => 
        (itemsByCategory[cat]?.length || 0) > 0
      );
      
      if (visibleCategories[newValue]) {
        const categoryKey = visibleCategories[newValue];
        const element = categoryRefs.current[categoryKey];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      
      // Reset the manual click flag after a delay to allow scroll detection to resume
      setTimeout(() => {
        setIsManualTabClick(false);
      }, 1000); // 1 second delay
    }
  };

  // Filter out empty categories for tabs while maintaining categoryOrder
  const visibleCategories = categoryOrder.filter(category => 
    (itemsByCategory[category]?.length || 0) > 0
  );

  // Scroll detection to update active tab
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualTabClick) return;
        
        // Find the section with the highest intersection ratio
        let maxRatio = 0;
        let mostVisibleCategory = '';
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleCategory = entry.target.getAttribute('data-category') || '';
          }
        });
        
        // Update if we have a significantly visible section
        if (mostVisibleCategory && maxRatio > 0.4) {
          const categoryIndex = visibleCategories.indexOf(mostVisibleCategory);
          if (categoryIndex !== -1) {
            setActiveCategory(categoryIndex);
          }
        }
      },
      {
        threshold: 0.4, // Higher threshold to prevent flickering
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    // Observe all category sections
    visibleCategories.forEach(category => {
      const element = categoryRefs.current[category];
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [visibleCategories]);

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      {/* Vertical category tabs */}
      <Box sx={{ 
        width: '140px', 
        flexShrink: 0, 
        position: 'sticky', 
        top: '80px', // Adjusted to account for the navigation bar
        alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 100px)', // Limit height to prevent overflow
        overflowY: 'auto', // Allow scrolling if tabs are too tall
        display: { xs: 'none', md: 'block' }, // Hide on mobile
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: '6px',
          backgroundColor: 'rgba(0,0,0,0.1)',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        }
      }}>
        <Tabs
          orientation="vertical"
          value={activeCategory}
          onChange={handleTabChange}
          aria-label="Product Categories"
          sx={{ 
            minWidth: '140px',
            borderRadius: 'lg',
            boxShadow: 'md',
            p: 0.5,
            bgcolor: 'background.surface',
            position: 'relative', // Important for sticky scrolling
            height: 'auto' // Allow the tabs to take their natural height
          }}
        >
          <TabList
            sx={{
              width: '100%',
              [`&& .${tabClasses.root}`]: {
                flex: 'initial',
                bgcolor: 'transparent',
                transition: 'all 0.3s',
                borderRadius: 'md',
                py: 2,
                my: 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                '&:hover': {
                  bgcolor: 'background.level1',
                  color: 'primary.plainColor',
                },
                [`&.${tabClasses.selected}`]: {
                  color: 'primary.plainColor',
                  bgcolor: 'primary.softBg',
                  fontWeight: 'lg',
                  boxShadow: 'sm',
                },
              },
            }}
          >
            {visibleCategories.map((category) => {
              const categoryName = categoryNames[category as keyof typeof categoryNames];
              
              return (
                <Tab 
                  key={category}
                  sx={{ 
                    px: 2,
                    '--Tab-minHeight': '70px',
                    gap: 1,
                  }}
                >
                  <Typography level="title-md" fontWeight="lg">
                    {categoryName}
                  </Typography>
                </Tab>
              );
            })}
          </TabList>
        </Tabs>
      </Box>

      {/* Main content area */}
      <Box sx={{ 
        flexGrow: 1, 
        pl: { xs: 0, md: 1.5 },
        maxWidth: { xs: '100%', md: 'calc(100% - 140px)' }
      }}>
        {categoryOrder.map((category) => {
          const categoryItems = itemsByCategory[category] || [];
          
          // Skip empty categories
          if (categoryItems.length === 0) return null;
          
          return (
            <Box 
              key={category} 
              sx={{ 
                mb: 5,
                maxWidth: '100%'
              }}
              ref={(el: HTMLDivElement | null) => categoryRefs.current[category] = el}
              data-category={category}
            >
              <Typography level="h2" sx={{ mb: 2, textAlign: 'center' }}>
                {categoryNames[category as keyof typeof categoryNames]}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                    xl: 'repeat(6, 1fr)',
                    '2xl': 'repeat(7, 1fr)'
                  },
                  gap: 2.5
                }}
              >
                {categoryItems.map((item) => (
                  <Box key={item.id}>
                    <ItemCard
                      url={item.imageUrl || ''}
                      title={item.title || item.name}
                      description={item.description || ''}
                      soldOut={item.soldOut}
                      onClick={() => handleItemClick(item)}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
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
          imageUrl={selectedItem.imageUrl}
        />
      )}
    </Box>
  );
} 