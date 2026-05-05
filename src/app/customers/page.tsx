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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { getCustomers } from '../services';
import { Customer } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', city: '', country: '', phone: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage]);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const data = await getCustomers(page + 1, rowsPerPage);
      setCustomers(data.data ?? data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEdit(customer: Customer) {
    setEditCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      city: customer.city,
      country: customer.country,
      phone: customer.phone,
    });
    setDialogOpen(true);
  }

  function handleOpenCreate() {
    setEditCustomer(null);
    setFormData({ firstName: '', lastName: '', city: '', country: '', phone: '' });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      if (editCustomer) {
        await fetch(`${API_URL}/api/v1/customers/${editCustomer.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setSnackbar('Cliente actualizado');
      } else {
        await fetch(`${API_URL}/api/v1/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setSnackbar('Cliente creado');
      }
      setDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error(error);
    }
  }

  const filtered = customers.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase()) ||
    c.country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Clientes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Nuevo cliente
        </Button>
      </Box>

      <TextField
        label="Buscar cliente"
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
                  <TableCell><strong>Ciudad</strong></TableCell>
                  <TableCell><strong>País</strong></TableCell>
                  <TableCell><strong>Teléfono</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                    <TableCell>{customer.city}</TableCell>
                    <TableCell>{customer.country}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenEdit(customer)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay clientes</TableCell>
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
        <DialogTitle>{editCustomer ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nombre"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            fullWidth size="small"
          />
          <TextField
            label="Apellido"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            fullWidth size="small"
          />
          <TextField
            label="Ciudad"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            fullWidth size="small"
          />
          <TextField
            label="País"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            fullWidth size="small"
          />
          <TextField
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            fullWidth size="small"
          />
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