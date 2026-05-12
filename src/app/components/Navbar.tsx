'use client';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from 'next/link';

const pages = [
  { label: 'Dashboard', href: '/' },
  { label: 'Pedidos', href: '/orders' },
  { label: 'Productos', href: '/products' },
  { label: 'Clientes', href: '/customers' },
  { label: 'Estado', href: '/health' },
];

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 0, mr: 4, fontWeight: 700 }}>
          Orders
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          {pages.map((page) => (
            <Button
              key={page.href}
              color="inherit"
              component={Link}
              href={page.href}
            >
              {page.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}