'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getCustomers, getProducts, createOrder } from '../../services';
import { Customer, Product } from '../../types';

interface ItemForm {
  productId: number;
  quantity: number;
  product?: Product;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<ItemForm[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [customersData, productsData] = await Promise.all([
          getCustomers(1, 100),
          getProducts(1, 100),
        ]);
        setCustomers(customersData.data ?? customersData);
        setProducts(productsData.data ?? productsData);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  function handleAddItem() {
    if (!selectedProductId) return;
    const product = products.find((p) => p.id === Number(selectedProductId));
    const exists = items.find((i) => i.productId === Number(selectedProductId));
    if (exists) {
      setError('Este producto ya fue agregado');
      return;
    }
    setItems([...items, { productId: Number(selectedProductId), quantity, product }]);
    setSelectedProductId('');
    setQuantity(1);
    setError('');
  }

  function handleRemoveItem(productId: number) {
    setItems(items.filter((i) => i.productId !== productId));
  }

  function calcTotal() {
    return items.reduce((sum, i) => sum + (i.product?.unitPrice ?? 0) * i.quantity, 0);
  }

  async function handleSubmit() {
    if (!customerId) { setError('Selecciona un cliente'); return; }
    if (items.length === 0) { setError('Agrega al menos un producto'); return; }
    setLoading(true);
    setError('');
    try {
      await createOrder({
        customerId: Number(customerId),
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      setSuccess('Pedido creado exitosamente');
      setTimeout(() => router.push('/orders'), 1500);
    } catch (err) {
      setError('Error al crear el pedido');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/orders')}>
          Volver
        </Button>
        <Typography variant="h5" fontWeight={700}>Nuevo pedido</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>1. Seleccionar cliente</Typography>
        <Divider sx={{ mb: 2 }} />
        <TextField
          select
          label="Cliente"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          fullWidth
          size="small"
        >
          {customers.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.firstName} {c.lastName} — {c.city}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>2. Agregar productos</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            label="Producto"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
          >
            {products.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.productName} — ${p.unitPrice}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            size="small"
            sx={{ width: 100 }}
            inputProps={{ min: 1 }}
          />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem}>
            Agregar
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Producto</strong></TableCell>
                <TableCell><strong>Precio unit.</strong></TableCell>
                <TableCell><strong>Cantidad</strong></TableCell>
                <TableCell><strong>Subtotal</strong></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.product?.productName}</TableCell>
                  <TableCell>${item.product?.unitPrice}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${(item.product?.unitPrice ?? 0) * item.quantity}</TableCell>
                  <TableCell>
                    <IconButton color="error" size="small" onClick={() => handleRemoveItem(item.productId)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">Sin productos agregados</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            Total: ${calcTotal().toLocaleString()}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear pedido'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}