import axiosInstance from "./axiosInstance";

export interface QRResponse {
  success: boolean;
  message: string;
  data: {
    verificationId: string;
    qrCodeUrl: string;
    verificationUrl: string;
  };
}

export const qrApi = {
  generateQR: async (studentId: string): Promise<QRResponse> => {
    const { data } = await axiosInstance.post<QRResponse>("/qr/generate", { studentId });
    return data;
  },

  regenerateQR: async (studentId: string): Promise<QRResponse> => {
    const { data } = await axiosInstance.post<QRResponse>("/qr/regenerate", { studentId });
    return data;
  },
};

export default qrApi;
