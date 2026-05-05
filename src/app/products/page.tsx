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
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { getProducts } from '../services';
import { Product } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ productName: '', unitPrice: '', package: '', isDiscontinued: false });

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const data = await getProducts(page + 1, rowsPerPage);
      setProducts(data.data ?? data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEdit(product: Product) {
    setEditProduct(product);
    setFormData({
      productName: product.productName,
      unitPrice: product.unitPrice.toString(),
      package: product.package,
      isDiscontinued: product.isDiscontinued,
    });
    setDialogOpen(true);
  }

  function handleOpenCreate() {
    setEditProduct(null);
    setFormData({ productName: '', unitPrice: '', package: '', isDiscontinued: false });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      const body = {
        productName: formData.productName,
        unitPrice: Number(formData.unitPrice),
        package: formData.package,
        isDiscontinued: formData.isDiscontinued,
      };
      if (editProduct) {
        await fetch(`${API_URL}/api/v1/products/${editProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        setSnackbar('Producto actualizado');
      } else {
        await fetch(`${API_URL}/api/v1/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        setSnackbar('Producto creado');
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  }

  const filtered = products.filter((p) =>
    p.productName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Productos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Nuevo producto
        </Button>
      </Box>

      <TextField
        label="Buscar producto"
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
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Precio</strong></TableCell>
                  <TableCell><strong>Presentación</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>${product.unitPrice?.toLocaleString()}</TableCell>
                    <TableCell>{product.package}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.isDiscontinued ? 'Discontinuado' : 'Activo'}
                        color={product.isDiscontinued ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenEdit(product)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay productos</TableCell>
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

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editProduct ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nombre"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Precio unitario"
            type="number"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Presentación"
            value={formData.package}
            onChange={(e) => setFormData({ ...formData, package: e.target.value })}
            fullWidth
            size="small"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography>Discontinuado</Typography>
            <Switch
              checked={formData.isDiscontinued}
              onChange={(e) => setFormData({ ...formData, isDiscontinued: e.target.checked })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        message={snackbar}
      />
    </Box>
  );
}