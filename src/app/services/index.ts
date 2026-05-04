const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── ORDERS ───────────────────────────────────────────
export async function getOrders(page = 1, limit = 10) {
  const res = await fetch(`${API_URL}/api/v1/orders?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json();
}

export async function getOrderById(orderId: number) {
  const res = await fetch(`${API_URL}/api/v1/orders/${orderId}`);
  if (!res.ok) throw new Error('Pedido no encontrado');
  return res.json();
}

export async function createOrder(data: object) {
  const res = await fetch(`${API_URL}/api/v1/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear pedido');
  return res.json();
}

export async function updateOrder(orderId: number, data: object) {
  const res = await fetch(`${API_URL}/api/v1/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar pedido');
  return res.json();
}

export async function deleteOrder(orderId: number) {
  const res = await fetch(`${API_URL}/api/v1/orders/${orderId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar pedido');
}

// ─── PRODUCTS ─────────────────────────────────────────
export async function getProducts(page = 1, limit = 10) {
  const res = await fetch(`${API_URL}/api/v1/products?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
}

export async function getProductById(productId: number) {
  const res = await fetch(`${API_URL}/api/v1/products/${productId}`);
  if (!res.ok) throw new Error('Producto no encontrado');
  return res.json();
}

// ─── CUSTOMERS ────────────────────────────────────────
export async function getCustomers(page = 1, limit = 10) {
  const res = await fetch(`${API_URL}/api/v1/customers?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Error al obtener clientes');
  return res.json();
}

export async function getCustomerById(customerId: number) {
  const res = await fetch(`${API_URL}/api/v1/customers/${customerId}`);
  if (!res.ok) throw new Error('Cliente no encontrado');
  return res.json();
}

// ─── HEALTH ───────────────────────────────────────────
export async function getHealth() {
  const res = await fetch(`${API_URL}/api/v1/health`);
  if (!res.ok) throw new Error('API no disponible');
  return res.json();
}