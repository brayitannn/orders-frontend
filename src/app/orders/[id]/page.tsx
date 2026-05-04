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
  // FIX 1: useParams() returns string | string[], extract safely
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX 2: Guard against missing or invalid id before fetching
    if (!rawId) {
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const data = await getOrderById(Number(rawId));
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [rawId]);

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

  // FIX 3: Derive status chip props from actual order status
  const getStatusChip = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'activo':
        return { label: 'Activo', color: 'success' as const };
      case 'pending':
      case 'pendiente':
        return { label: 'Pendiente', color: 'warning' as const };
      case 'cancelled':
      case 'cancelado':
        return { label: 'Cancelado', color: 'error' as const };
      default:
        return { label: status ?? 'Sin estado', color: 'default' as const };
    }
  };

  const statusChip = getStatusChip(order.status);

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
          {/* FIX 3: Show real status instead of hardcoded "Activo" */}
          <Chip label={statusChip.label} color={statusChip.color} size="small" />
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
                {/* FIX 4: Fallback to 0 if totalAmount is null/undefined */}
                <Typography fontWeight={700} color="primary">
                  ${(order.totalAmount ?? 0).toLocaleString()}
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
                  {order.items?.map((item) => {
                    // FIX 5: Safe arithmetic with null/undefined guards
                    const unitPrice = item.unitPrice ?? 0;
                    const quantity = item.quantity ?? 0;
                    const subtotal = unitPrice * quantity;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.product?.productName ?? `Producto #${item.productId}`}
                        </TableCell>
                        <TableCell>${unitPrice.toLocaleString()}</TableCell>
                        <TableCell>{quantity}</TableCell>
                        <TableCell>${subtotal.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
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