import { z } from "zod";

export const registerSchema = {
  body: z.object({
    staffId: z.string().min(2, "Staff ID must be at least 2 characters"),
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["Admin", "Verification Officer", "Librarian", "Security Officer"], {
      errorMap: () => ({ message: "Invalid role selected. Allowed: Admin, Verification Officer, Librarian, Security Officer" }),
    }),
  }),
};

export const loginSchema = {
  body: z.object({
    staffId: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(1, "Password is required"),
  }).refine((data) => data.staffId || data.email, {
    message: "Either email or staff ID must be provided to sign in",
    path: ["email"],
  }),
};
