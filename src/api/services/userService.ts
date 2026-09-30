import api from '../axios';
import { User, Address } from '../../types';

// Depending on gateway configuration, we might prefix this
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL ? import.meta.env.VITE_USER_SERVICE_URL + '/api/users' : '/api/users';

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>(`${USER_SERVICE_URL}/me`);
    return response.data;
  },
  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`${USER_SERVICE_URL}/me`, data);
    return response.data;
  },
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get<Address[]>(`${USER_SERVICE_URL}/address`);
    return response.data;
  },
  addAddress: async (data: Address): Promise<Address> => {
    const response = await api.post<Address>(`${USER_SERVICE_URL}/address`, data);
    return response.data;
  }
};
