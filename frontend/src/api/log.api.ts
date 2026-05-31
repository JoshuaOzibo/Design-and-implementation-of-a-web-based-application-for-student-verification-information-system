import axiosInstance from "./axiosInstance";

export interface LogRecord {
  _id: string;
  matricNumber: string;
  type: "Matric" | "Student ID" | "QR Scan";
  location: string;
  status: "verified" | "failed";
  reason?: string;
  createdAt: string;
  student?: {
    fullName: string;
    email: string;
  };
  staff: {
    fullName: string;
    role: string;
  };
}

export interface LogsResponse {
  success: boolean;
  data: {
    results: LogRecord[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

export const logApi = {
  getLogs: async (params: Record<string, any>): Promise<LogsResponse> => {
    const { data } = await axiosInstance.get<LogsResponse>("/logs", { params });
    return data;
  },

  exportLogs: async (params: Record<string, any>): Promise<Blob> => {
    const { data } = await axiosInstance.get<Blob>("/logs/export", {
      params,
      responseType: "blob",
    });
    return data;
  },
};

export default logApi;
