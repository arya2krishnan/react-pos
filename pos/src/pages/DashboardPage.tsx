import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Table, 
  Sheet,
  Button,
  Tabs,
  TabList,
  Tab,
  CircularProgress,
  Alert
} from '@mui/joy';
import { apiService, OrderData, ItemData } from '../services/api';
import NavigationBar from '../components/common/NavigationBar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ItemStats {
  name: string;
  quantity: number;
  category: string;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [currentItems, setCurrentItems] = useState<ItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch both completed orders and current items
      const [ordersResponse, itemsResponse] = await Promise.all([
        apiService.getCompletedOrders(),
        apiService.getItems()
      ]);
      
      if (ordersResponse.success && ordersResponse.data) {
        setOrders(ordersResponse.data);
      } else {
        setError(ordersResponse.error || 'Failed to fetch completed orders');
        return;
      }

      if (itemsResponse.success && itemsResponse.data) {
        setCurrentItems(itemsResponse.data);
      } else {
        setError(itemsResponse.error || 'Failed to fetch current items');
        return;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('An unexpected error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  const aggregateItemStats = (orders: OrderData[], currentItems: ItemData[], categoryFilter?: string): ItemStats[] => {
    const itemMap = new Map<string, ItemStats>();

    // Create a map of current items by name for quick lookup
    const currentItemsMap = new Map<string, ItemData>();
    currentItems.forEach(item => {
      currentItemsMap.set(item.name, item);
    });

    orders.forEach(order => {
      order.items.forEach(cartItem => {
        const orderItem = cartItem.item;
        const currentItem = currentItemsMap.get(orderItem.name);
        
        // Use current item category if available, otherwise fall back to order item category
        const itemCategory = currentItem?.category || orderItem.category || 'Unknown';
        
        // For live items, include everything except 'o' category
        if (categoryFilter === 'live' && itemCategory === 'o') {
          return;
        }
        // For archived items, only include 'o' category
        if (categoryFilter === 'o' && itemCategory !== 'o') {
          return;
        }

        const key = orderItem.name;
        const existing = itemMap.get(key);
        
        if (existing) {
          existing.quantity += cartItem.quantity;
        } else {
          itemMap.set(key, {
            name: orderItem.name,
            quantity: cartItem.quantity,
            category: itemCategory
          });
        }
      });
    });

    // Convert to array and sort by quantity (most popular first)
    return Array.from(itemMap.values()).sort((a, b) => b.quantity - a.quantity);
  };

  const liveItemsStats = aggregateItemStats(orders, currentItems, 'live');
  const archivedItemsStats = aggregateItemStats(orders, currentItems, 'o');

  if (isLoading) {
    return (
      <>
        <NavigationBar />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          paddingTop: '70px'
        }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavigationBar />
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', paddingTop: '70px' }}>
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={() => navigate('/admin')} startDecorator={<ArrowBackIcon />}>
            Back to Admin
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', paddingTop: '80px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button 
            onClick={() => navigate('/admin')} 
            startDecorator={<ArrowBackIcon />}
            sx={{ mr: 3 }}
            variant="outlined"
            size="sm"
          >
            Back to Admin
          </Button>
          <Typography level="h1" sx={{ fontWeight: 'bold' }}>
            Sales Dashboard
          </Typography>
        </Box>

        {orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography level="h4" color="neutral">
              No orders to show: waiting for first order
            </Typography>
          </Box>
        ) : (
          <>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue as number)}
              sx={{ mb: 4 }}
            >
              <TabList>
                <Tab>Live Items ({liveItemsStats.length})</Tab>
                <Tab>Archived Items ({archivedItemsStats.length})</Tab>
              </TabList>
            </Tabs>

            {/* Live Items Tab */}
            {activeTab === 0 && (
              <Box>
                <Typography level="h2" sx={{ mb: 4, fontWeight: '600' }}>
                  Live Items Performance
                </Typography>
                
                {liveItemsStats.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography level="body-lg" color="neutral">
                      No live items have been sold yet.
                    </Typography>
                  </Box>
                ) : (
                  <Sheet variant="soft" color="primary" sx={{ borderRadius: 'lg', overflow: 'hidden' }}>
                    <Table aria-label="live items table" color="primary" sx={{ '& th, & td': { padding: '16px 24px' } }}>
                      <thead>
                        <tr>
                          <th style={{ fontWeight: '600', fontSize: '1rem' }}>Item Name</th>
                          <th style={{ textAlign: 'right', fontWeight: '600', fontSize: '1rem' }}>Quantity Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveItemsStats.map((item: ItemStats) => (
                          <tr key={item.name}>
                            <td style={{ fontWeight: '500' }}>{item.name}</td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Sheet>
                )}
              </Box>
            )}

            {/* Archived Items Tab */}
            {activeTab === 1 && (
              <Box>
                <Typography level="h2" sx={{ mb: 4, fontWeight: '600' }}>
                  Archived Items Performance
                </Typography>
                
                {archivedItemsStats.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography level="body-lg" color="neutral">
                      No archived items have been sold yet.
                    </Typography>
                  </Box>
                ) : (
                  <Sheet variant="soft" color="primary" sx={{ borderRadius: 'lg', overflow: 'hidden' }}>
                    <Table aria-label="archived items table" color="primary" sx={{ '& th, & td': { padding: '16px 24px' } }}>
                      <thead>
                        <tr>
                          <th style={{ fontWeight: '600', fontSize: '1rem' }}>Item Name</th>
                          <th style={{ textAlign: 'right', fontWeight: '600', fontSize: '1rem' }}>Quantity Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedItemsStats.map((item: ItemStats) => (
                          <tr key={item.name}>
                            <td style={{ fontWeight: '500' }}>{item.name}</td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Sheet>
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  );
}
