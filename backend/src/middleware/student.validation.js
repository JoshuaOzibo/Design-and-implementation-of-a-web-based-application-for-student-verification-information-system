import { z } from "zod";

// Helper regex to validate MongoDB ObjectID
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, { message: "Invalid ID format" });

export const createStudentSchema = {
  body: z.object({
    matricNumber: z.string().min(3, "Matric number is required"),
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(5, "Phone number is required"),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date of birth format",
    }),
    address: z.string().min(5, "Address must be at least 5 characters"),
    photo: z.string().optional(),
    faculty: objectIdSchema,
    department: objectIdSchema,
    level: z.enum(["100", "200", "300", "400", "500"], {
      errorMap: () => ({ message: "Invalid level value" }),
    }),
    academicSession: z.string().min(3, "Academic session is required"),
    status: z.enum(["active", "suspended", "graduated", "pending"]).optional(),
  }),
};

export const updateStudentSchema = {
  body: z.object({
    matricNumber: z.string().min(3).optional(),
    fullName: z.string().min(3).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }).optional(),
    address: z.string().min(5).optional(),
    photo: z.string().optional(),
    faculty: objectIdSchema.optional(),
    department: objectIdSchema.optional(),
    level: z.enum(["100", "200", "300", "400", "500"]).optional(),
    academicSession: z.string().min(3).optional(),
    status: z.enum(["active", "suspended", "graduated", "pending"]).optional(),
  }),
};

export const queryStudentsSchema = {
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    faculty: z.string().regex(objectIdRegex).optional(),
    department: z.string().regex(objectIdRegex).optional(),
    level: z.enum(["100", "200", "300", "400", "500"]).optional(),
    status: z.enum(["active", "suspended", "graduated", "pending"]).optional(),
    sortBy: z.string().optional(),
  }),
};
