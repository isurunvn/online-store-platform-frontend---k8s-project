import api from '../axios';
import { Order, CreateOrderRequest } from '../../types';

const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL ? import.meta.env.VITE_ORDER_SERVICE_URL + '/api/orders' : '/api/orders';

export const orderService = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>(`${ORDER_SERVICE_URL}`, data);
    return response.data;
  },
  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>(`${ORDER_SERVICE_URL}`);
    return response.data;
  },
  getOrderById: async (id: number | string): Promise<Order> => {
    const response = await api.get<Order>(`${ORDER_SERVICE_URL}/${id}`);
    return response.data;
  }
};
