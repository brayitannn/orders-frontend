'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { getHealth } from '../services';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HealthPage() {
  const [status, setStatus] = useState<'ok' | 'error' | 'loading'>('loading');
  const [checkedAt, setCheckedAt] = useState<string>('');

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    setStatus('loading');
    try {
      await getHealth();
      setStatus('ok');
    } catch {
      setStatus('error');
    } finally {
      setCheckedAt(new Date().toLocaleTimeString('es-CO'));
    }
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Estado del sistema</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>API REST</Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          {status === 'loading' && <CircularProgress size={24} />}
          {status === 'ok' && <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />}
          {status === 'error' && <ErrorIcon color="error" sx={{ fontSize: 40 }} />}

          <Box>
            <Typography variant="h6">
              {status === 'loading' && 'Verificando...'}
              {status === 'ok' && 'API funcionando correctamente'}
              {status === 'error' && 'API no disponible'}
            </Typography>
            {checkedAt && (
              <Typography variant="body2" color="text.secondary">
                Última verificación: {checkedAt}
              </Typography>
            )}
          </Box>

          <Chip
            label={status === 'ok' ? 'Online' : status === 'error' ? 'Offline' : '...'}
            color={status === 'ok' ? 'success' : status === 'error' ? 'error' : 'default'}
            sx={{ ml: 'auto' }}
          />
        </Box>

        {status === 'ok' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            El servicio está activo y respondiendo correctamente.
          </Alert>
        )}
        {status === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No se pudo conectar con la API. Verifica que el servidor esté corriendo.
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={checkHealth}
          >
            Verificar de nuevo
          </Button>
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(`${API_URL}/api/v1/docs`, '_blank')}
          >
            Ver documentación Swagger
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>Información del sistema</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">URL de la API</Typography>
            <Typography fontWeight={500}>{API_URL}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Versión</Typography>
            <Typography fontWeight={500}>v1.0.0</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Frontend</Typography>
            <Typography fontWeight={500}>Next.js + Material UI</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Endpoint health</Typography>
            <Typography fontWeight={500}>{API_URL}/api/v1/health</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}