import api from '../axios';
import { Product, Category, PagedResponse } from '../../types';

const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL ? import.meta.env.VITE_PRODUCT_SERVICE_URL + '/api' : '/api';

export const productService = {
  getProducts: async (page: number = 0, size: number = 10): Promise<PagedResponse<Product>> => {
    const response = await api.get<PagedResponse<Product>>(`${PRODUCT_SERVICE_URL}/products?page=${page}&size=${size}`);
    return response.data;
  },
  getProductById: async (id: number | string): Promise<Product> => {
    const response = await api.get<Product>(`${PRODUCT_SERVICE_URL}/products/${id}`);
    return response.data;
  },
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>(`${PRODUCT_SERVICE_URL}/categories`);
    return response.data;
  },
  createCategory: async (name: string): Promise<Category> => {
    const response = await api.post<Category>(`${PRODUCT_SERVICE_URL}/categories`, { name });
    return response.data;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post<Product>(`${PRODUCT_SERVICE_URL}/products`, data);
    return response.data;
  },
  updateProduct: async (id: number | string, data: Partial<Product>): Promise<Product> => {
    const response = await api.put<Product>(`${PRODUCT_SERVICE_URL}/products/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id: number | string): Promise<void> => {
    await api.delete(`${PRODUCT_SERVICE_URL}/products/${id}`);
  }
};
