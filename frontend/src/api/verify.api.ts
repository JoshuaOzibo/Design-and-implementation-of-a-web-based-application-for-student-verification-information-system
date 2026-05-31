import axiosInstance from "./axiosInstance";
import { StudentProfile } from "./student.api";

export interface VerificationResponse {
  success: boolean;
  message: string;
  data: {
    verified: boolean;
    reason?: string;
    student: StudentProfile;
  };
}

export const verifyApi = {
  verifyStudent: async (payload: {
    method: "matric" | "id" | "qr";
    identifier: string;
    location?: string;
  }): Promise<VerificationResponse> => {
    const { data } = await axiosInstance.post<VerificationResponse>("/verify", payload);
    return data;
  },
};

export default verifyApi;
