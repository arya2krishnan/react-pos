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
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/joy';
import { apiService, OrderData, ItemData, StoreSession } from '../services/api';
import NavigationBar from '../components/common/NavigationBar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ItemStats {
  name: string;
  quantity: number;
  category: string;
}

interface StorePerformance {
  storeNumber: number;
  startTime: string;
  endTime?: string;
  orderCount: number;
  totalRevenue: number;
  itemStats: ItemStats[];
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [currentItems, setCurrentItems] = useState<ItemData[]>([]);
  const [storeSessions, setStoreSessions] = useState<StoreSession[]>([]);
  const [storePerformance, setStorePerformance] = useState<StorePerformance[]>([]);
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
      // Fetch all data in parallel
      const [ordersResponse, itemsResponse, sessionsResponse] = await Promise.all([
        apiService.getCompletedOrders(),
        apiService.getItems(),
        apiService.getStoreSessions()
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

      if (sessionsResponse.success && sessionsResponse.data) {
        setStoreSessions(sessionsResponse.data);
        
        // Fetch performance data for each store session
        const performanceData: StorePerformance[] = [];
        
        // Add store 0 (legacy data) if there are orders without store numbers
        const legacyOrders = ordersResponse.data.filter(order => !order.storeNumber || order.storeNumber === 0);
        if (legacyOrders.length > 0) {
          const legacyStats = aggregateItemStats(legacyOrders, itemsResponse.data);
          performanceData.push({
            storeNumber: 0,
            startTime: 'Legacy Data',
            orderCount: legacyOrders.length,
            totalRevenue: legacyOrders.reduce((sum, order) => sum + order.totalAmount, 0),
            itemStats: legacyStats
          });
        }
        
        // Fetch data for each store session
        for (const session of sessionsResponse.data) {
          const storeOrdersResponse = await apiService.getOrdersByStore(session.storeNumber);
          if (storeOrdersResponse.success && storeOrdersResponse.data) {
            const storeStats = aggregateItemStats(storeOrdersResponse.data, itemsResponse.data);
            performanceData.push({
              storeNumber: session.storeNumber,
              startTime: session.startTime,
              endTime: session.endTime,
              orderCount: session.orderCount,
              totalRevenue: session.totalRevenue,
              itemStats: storeStats
            });
          }
        }
        
        // Sort performance data by store number (ascending order)
        performanceData.sort((a, b) => a.storeNumber - b.storeNumber);
        
        setStorePerformance(performanceData);
      } else {
        setError(sessionsResponse.error || 'Failed to fetch store sessions');
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

  const formatDateTime = (dateString: string) => {
    if (dateString === 'Legacy Data') return dateString;
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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
          >
            Back to Admin
          </Button>
          <Typography level="h1" sx={{ fontWeight: '700' }}>
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
                <Tab>All Time Performance</Tab>
                {storePerformance.map((store, index) => (
                  <Tab key={store.storeNumber}>
                    Store {store.storeNumber} ({store.orderCount} orders)
                  </Tab>
                ))}
              </TabList>
            </Tabs>

            {/* All Time Performance Tab */}
            {activeTab === 0 && (
              <Box>
                <Typography level="h2" sx={{ mb: 4, fontWeight: '600' }}>
                  All Time Performance
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography level="h4" color="primary">
                          Total Orders
                        </Typography>
                        <Typography level="h2" sx={{ fontWeight: 'bold' }}>
                          {orders.length}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography level="h4" color="primary">
                          Total Revenue
                        </Typography>
                        <Typography level="h2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Tabs value={0} sx={{ mb: 3 }}>
                  <TabList>
                    <Tab>Live Items ({liveItemsStats.length})</Tab>
                    <Tab>Archived Items ({archivedItemsStats.length})</Tab>
                  </TabList>
                </Tabs>

                {/* Live Items */}
                <Box sx={{ mb: 4 }}>
                  <Typography level="h3" sx={{ mb: 2, fontWeight: '600' }}>
                    Live Items Performance
                  </Typography>
                  
                  {liveItemsStats.length === 0 ? (
                    <Alert color="neutral">No live items have been sold yet.</Alert>
                  ) : (
                    <Sheet variant="outlined" sx={{ borderRadius: 'sm' }}>
                      <Table>
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Quantity Sold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveItemsStats.map((item) => (
                            <tr key={item.name}>
                              <td>{item.name}</td>
                              <td>{item.category}</td>
                              <td>{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Sheet>
                  )}
                </Box>

                {/* Archived Items */}
                <Box>
                  <Typography level="h3" sx={{ mb: 2, fontWeight: '600' }}>
                    Archived Items Performance
                  </Typography>
                  
                  {archivedItemsStats.length === 0 ? (
                    <Alert color="neutral">No archived items have been sold yet.</Alert>
                  ) : (
                    <Sheet variant="outlined" sx={{ borderRadius: 'sm' }}>
                      <Table>
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Quantity Sold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {archivedItemsStats.map((item) => (
                            <tr key={item.name}>
                              <td>{item.name}</td>
                              <td>{item.category}</td>
                              <td>{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Sheet>
                  )}
                </Box>
              </Box>
            )}

            {/* Store Session Performance Tabs */}
            {activeTab > 0 && storePerformance[activeTab - 1] && (
              <Box>
                <Typography level="h2" sx={{ mb: 4, fontWeight: '600' }}>
                  Store {storePerformance[activeTab - 1].storeNumber} Performance
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography level="h4" color="primary">
                          Session Orders
                        </Typography>
                        <Typography level="h2" sx={{ fontWeight: 'bold' }}>
                          {storePerformance[activeTab - 1].orderCount}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography level="h4" color="primary">
                          Session Revenue
                        </Typography>
                        <Typography level="h2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(storePerformance[activeTab - 1].totalRevenue)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography level="h4" color="primary">
                          Session Duration
                        </Typography>
                        <Typography level="h2" sx={{ fontWeight: 'bold' }}>
                          {storePerformance[activeTab - 1].startTime === 'Legacy Data' ? 
                            'Legacy Data' : 
                            formatDateTime(storePerformance[activeTab - 1].startTime)
                          }
                        </Typography>
                        {storePerformance[activeTab - 1].endTime && (
                          <Typography level="body-sm" color="neutral">
                            to {formatDateTime(storePerformance[activeTab - 1].endTime!)}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Typography level="h3" sx={{ mb: 2, fontWeight: '600' }}>
                  Items Performance
                </Typography>
                
                {storePerformance[activeTab - 1].itemStats.length === 0 ? (
                  <Alert color="neutral">No items were sold in this store session.</Alert>
                ) : (
                  <Sheet variant="outlined" sx={{ borderRadius: 'sm' }}>
                    <Table>
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Category</th>
                          <th>Quantity Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storePerformance[activeTab - 1].itemStats.map((item) => (
                          <tr key={item.name}>
                            <td>{item.name}</td>
                            <td>{item.category}</td>
                            <td>{item.quantity}</td>
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
