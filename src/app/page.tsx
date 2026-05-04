'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import { getOrders, getProducts, getCustomers } from './services';
import { Order } from './types';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="text.secondary" variant="body2">{title}</Typography>
            <Typography variant="h4" fontWeight={700} mt={1}>{value}</Typography>
          </Box>
          <Box sx={{
            backgroundColor: color,
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersData, productsData, customersData] = await Promise.all([
          getOrders(1, 100),
          getProducts(1, 1),
          getCustomers(1, 1),
        ]);
        setOrders(ordersData.data ?? ordersData);
        setTotalProducts(productsData.total ?? 0);
        setTotalCustomers(customersData.total ?? 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
  const lastOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Dashboard</Typography>

      {/* KPIs */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total pedidos" value={orders.length} icon={<ShoppingCartIcon />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total vendido" value={`$${totalAmount.toLocaleString()}`} icon={<AttachMoneyIcon />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Productos activos" value={totalProducts} icon={<InventoryIcon />} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Clientes" value={totalCustomers} icon={<PeopleIcon />} color="#9c27b0" />
        </Grid>
      </Grid>

      {/* Últimos pedidos */}
      <Typography variant="h6" fontWeight={600} mb={2}>Últimos pedidos</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong># Pedido</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lastOrders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>{order.orderNumber ?? order.id}</TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleDateString('es-CO')}</TableCell>
                <TableCell>
                  {order.customer
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : `Cliente #${order.customerId}`}
                </TableCell>
                <TableCell>${order.totalAmount?.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label="Activo" color="success" size="small" />
                </TableCell>
              </TableRow>
            ))}
            {lastOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No hay pedidos disponibles</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}