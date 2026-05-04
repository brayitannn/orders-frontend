'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { getOrders, deleteOrder } from '../services';
import { Order } from '../types';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const data = await getOrders(page + 1, rowsPerPage);
      setOrders(data.data ?? data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este pedido?')) return;
    try {
      await deleteOrder(id);
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  }

  const filtered = orders.filter((o) =>
    o.orderNumber?.toString().includes(search) ||
    o.customerId?.toString().includes(search)
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Pedidos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/orders/new')}
        >
          Nuevo pedido
        </Button>
      </Box>

      <TextField
        label="Buscar por número o cliente"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong># Pedido</strong></TableCell>
                  <TableCell><strong>Fecha</strong></TableCell>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((order) => (
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
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(order.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No hay pedidos</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={-1}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
            labelRowsPerPage="Filas por página"
          />
        </Paper>
      )}
    </Box>
  );
}