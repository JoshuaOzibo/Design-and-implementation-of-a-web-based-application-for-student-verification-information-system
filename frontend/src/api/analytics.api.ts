import axiosInstance from "./axiosInstance";

export interface AnalyticsSummary {
  totalStudents: number;
  activeStudents: number;
  pendingStudents: number;
  totalVerifications: number;
  verificationsToday: number;
  verificationsThisMonth: number;
}

export interface TrendData {
  _id: string; // YYYY-MM-DD
  verified: number;
  failed: number;
}

export interface DistributionData {
  _id: string; // type/name/status
  value: number;
  code?: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    summary: AnalyticsSummary;
    trends: TrendData[];
    byMethod: DistributionData[];
    byDepartment: DistributionData[];
    byFaculty: DistributionData[];
    byStudentStatus: DistributionData[];
  };
}

export const analyticsApi = {
  getAnalytics: async (): Promise<AnalyticsResponse> => {
    const { data } = await axiosInstance.get<AnalyticsResponse>("/analytics");
    return data;
  },
};

export default analyticsApi;
