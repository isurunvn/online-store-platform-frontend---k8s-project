export interface User {
  id: string;
  keycloakUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CreateOrderRequest {
  orderItems: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiError {
  message: string;
  code?: string;
}
