import axiosInstance from "./axiosInstance";

export interface StudentProfile {
  _id: string;
  matricNumber: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  photo: string;
  faculty: { _id: string; name: string; code: string } | string;
  department: { _id: string; name: string; code: string } | string;
  level: "100" | "200" | "300" | "400" | "500";
  academicSession: string;
  status: "active" | "suspended" | "graduated" | "pending";
}

export interface StudentsListResponse {
  success: boolean;
  data: {
    results: StudentProfile[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

export interface StudentDetailResponse {
  success: boolean;
  data: StudentProfile;
}

export const studentApi = {
  getStudents: async (params: Record<string, any>): Promise<StudentsListResponse> => {
    const { data } = await axiosInstance.get<StudentsListResponse>("/students", { params });
    return data;
  },

  getStudentById: async (id: string): Promise<StudentDetailResponse> => {
    const { data } = await axiosInstance.get<StudentDetailResponse>(`/students/${id}`);
    return data;
  },

  getStudentByMatric: async (matric: string): Promise<StudentDetailResponse> => {
    const { data } = await axiosInstance.get<StudentDetailResponse>(`/students/matric/${matric}`);
    return data;
  },

  createStudent: async (payload: Record<string, any>): Promise<StudentDetailResponse> => {
    const { data } = await axiosInstance.post<StudentDetailResponse>("/students", payload);
    return data;
  },

  updateStudent: async (id: string, payload: Record<string, any>): Promise<StudentDetailResponse> => {
    const { data } = await axiosInstance.patch<StudentDetailResponse>(`/students/${id}`, payload);
    return data;
  },

  deleteStudent: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(`/students/${id}`);
    return data;
  },

  getFaculties: async (): Promise<{ success: boolean; data: Array<{ _id: string; name: string; code: string }> }> => {
    const { data } = await axiosInstance.get<{ success: boolean; data: Array<{ _id: string; name: string; code: string }> }>("/students/meta/faculties");
    return data;
  },

  getDepartments: async (): Promise<{ success: boolean; data: Array<{ _id: string; name: string; code: string; faculty: string }> }> => {
    const { data } = await axiosInstance.get<{ success: boolean; data: Array<{ _id: string; name: string; code: string; faculty: string }> }>("/students/meta/departments");
    return data;
  },

  uploadPhoto: async (fileBlob: Blob | File): Promise<{ success: boolean; data: { url: string; publicId: string } }> => {
    const formData = new FormData();
    formData.append("photo", fileBlob, "student-photo.jpg");
    const { data } = await axiosInstance.post<{ success: boolean; data: { url: string; publicId: string } }>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};

export default studentApi;
