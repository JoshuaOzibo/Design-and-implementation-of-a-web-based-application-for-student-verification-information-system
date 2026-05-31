import axiosInstance from "./axiosInstance";
import { UserProfile } from "../hooks/useAuth";

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: UserProfile;
    accessToken: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export const authApi = {
  login: async (payload: Record<string, any>): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>("/auth/login", payload);
    return data;
  },

  register: async (payload: Record<string, any>): Promise<RegisterResponse> => {
    const { data } = await axiosInstance.post<RegisterResponse>("/auth/register", payload);
    return data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.post<{ success: boolean; message: string }>("/auth/logout");
    return data;
  },

  refresh: async (): Promise<{ success: boolean; data: { accessToken: string } }> => {
    const { data } = await axiosInstance.post<{ success: boolean; data: { accessToken: string } }>("/auth/refresh");
    return data;
  },
};

export default authApi;
