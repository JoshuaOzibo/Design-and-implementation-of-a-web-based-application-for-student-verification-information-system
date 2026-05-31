import { z } from "zod";

export const queryLogsSchema = {
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    type: z.enum(["Matric", "Student ID", "QR Scan"]).optional(),
    status: z.enum(["verified", "failed"]).optional(),
    location: z.string().optional(),
    range: z.enum(["today", "week", "month", "custom"]).optional(),
    startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid start date format",
    }),
    endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid end date format",
    }),
    sortBy: z.string().optional(),
  }),
};
