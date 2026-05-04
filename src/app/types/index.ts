export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  phone: string;
}

export interface Product {
  id: number;
  productName: string;
  unitPrice: number;
  package: string;
  isDiscontinued: boolean;
  supplierId: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  unitPrice: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: number;
  orderDate: string;
  orderNumber: string;
  customerId: number;
  totalAmount: number;
  customer?: Customer;
  items?: OrderItem[];
}