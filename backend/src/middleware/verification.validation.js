import { z } from "zod";

export const verifyStudentSchema = {
  body: z.object({
    method: z.enum(["matric", "id", "qr"], {
      errorMap: () => ({ message: "Method must be one of: 'matric', 'id', or 'qr'" }),
    }),
    identifier: z.string().min(1, "Identifier is required"),
    location: z.string().min(1, "Location must be at least 1 character").optional(),
  }),
};
