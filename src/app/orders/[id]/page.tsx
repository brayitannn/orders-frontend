'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { getOrderById } from '../../services';
import { Order } from '../../types';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await getOrderById(Number(id));
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box>
        <Typography variant="h6" color="error">Pedido no encontrado</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/orders')} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/orders')}>
            Volver
          </Button>
          <Typography variant="h5" fontWeight={700}>
            Pedido #{order.orderNumber ?? order.id}
          </Typography>
          <Chip label="Activo" color="success" size="small" />
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => router.push(`/orders/${order.id}/edit`)}
        >
          Editar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Info del pedido */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Información del pedido</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Número</Typography>
                <Typography fontWeight={500}>{order.orderNumber ?? order.id}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Fecha</Typography>
                <Typography fontWeight={500}>
                  {new Date(order.orderDate).toLocaleDateString('es-CO')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total</Typography>
                <Typography fontWeight={700} color="primary">
                  ${order.totalAmount?.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Info del cliente */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Cliente</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Nombre</Typography>
                <Typography fontWeight={500}>
                  {order.customer
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : `Cliente #${order.customerId}`}
                </Typography>
              </Box>
              {order.customer && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Ciudad</Typography>
                    <Typography fontWeight={500}>{order.customer.city}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">País</Typography>
                    <Typography fontWeight={500}>{order.customer.country}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Teléfono</Typography>
                    <Typography fontWeight={500}>{order.customer.phone}</Typography>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Items del pedido */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Productos del pedido</Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Producto</strong></TableCell>
                    <TableCell><strong>Precio unitario</strong></TableCell>
                    <TableCell><strong>Cantidad</strong></TableCell>
                    <TableCell><strong>Subtotal</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.product?.productName ?? `Producto #${item.productId}`}
                      </TableCell>
                      <TableCell>${item.unitPrice?.toLocaleString()}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        ${(item.unitPrice * item.quantity)?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Sin items</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}