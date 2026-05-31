import express from "express";

const router = express.Router();

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Student Verification Information System (SVIS) API",
    version: "1.0.0",
    description: "API specifications for SVIS backend supporting authentication, student records, QR identities, check-ins, logs, uploads, and analytics."
  },
  servers: [
    {
      url: "/api/v1",
      description: "V1 Base URL"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          stack: { type: "string" }
        }
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Register new staff member",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["staffId", "fullName", "email", "password", "role"],
                properties: {
                  staffId: { type: "string", example: "UNI/ADM/001" },
                  fullName: { type: "string", example: "Dr. Jane Doe" },
                  email: { type: "string", format: "email", example: "jane.doe@uni.edu" },
                  password: { type: "string", minLength: 6, example: "securePassword123" },
                  role: { type: "string", enum: ["Admin", "Verification Officer", "Librarian", "Security Officer"], example: "Admin" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Staff registered successfully" },
          400: { description: "Invalid inputs or duplication" }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Authenticate staff member",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: {
                  staffId: { type: "string", example: "UNI/ADM/001" },
                  email: { type: "string", format: "email", example: "jane.doe@uni.edu" },
                  password: { type: "string", example: "securePassword123" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Login successful, sets refresh cookie and returns access token" },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/auth/refresh": {
      post: {
        summary: "Refresh access token",
        tags: ["Authentication"],
        responses: {
          200: { description: "Token refreshed successfully" },
          401: { description: "Invalid refresh token" }
        }
      }
    },
    "/auth/logout": {
      post: {
        summary: "Sign out staff member",
        tags: ["Authentication"],
        responses: {
          200: { description: "Logout successful" }
        }
      }
    },
    "/students": {
      get: {
        summary: "Retrieve paginated student list",
        tags: ["Student Management"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "sortBy", in: "query", schema: { type: "string", example: "fullName:asc" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["active", "suspended", "graduated", "pending"] } }
        ],
        responses: {
          200: { description: "List of students" }
        }
      },
      post: {
        summary: "Create new student profile (Admin only)",
        tags: ["Student Management"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["matricNumber", "fullName", "email", "phone", "dob", "address", "faculty", "department", "level", "academicSession"],
                properties: {
                  matricNumber: { type: "string", example: "UNI/2026/0001" },
                  fullName: { type: "string", example: "Adaeze Okafor" },
                  email: { type: "string", format: "email", example: "adaeze@student.edu" },
                  phone: { type: "string", example: "+2348011112222" },
                  dob: { type: "string", format: "date", example: "2004-06-12" },
                  address: { type: "string", example: "12 Campus Road" },
                  photo: { type: "string", example: "https://cloudinary.com/img.png" },
                  faculty: { type: "string", description: "Faculty ObjectID" },
                  department: { type: "string", description: "Department ObjectID" },
                  level: { type: "string", enum: ["100", "200", "300", "400", "500"] },
                  academicSession: { type: "string", example: "2024/2025" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Student created successfully" },
          403: { description: "Forbidden - Admin privilege required" }
        }
      }
    },
    "/students/{id}": {
      get: {
        summary: "Get student by ID",
        tags: ["Student Management"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Student details" }
        }
      },
      patch: {
        summary: "Update student details (Admin only)",
        tags: ["Student Management"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  status: { type: "string", enum: ["active", "suspended", "graduated", "pending"] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Student updated successfully" }
        }
      },
      delete: {
        summary: "Delete student profile (Admin only)",
        tags: ["Student Management"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Student deleted successfully" }
        }
      }
    },
    "/students/matric/{matricNumber}": {
      get: {
        summary: "Get student by matric number",
        tags: ["Student Management"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "matricNumber", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Student details" }
        }
      }
    },
    "/qr/generate": {
      post: {
        summary: "Generate QR Code for student (Admin only)",
        tags: ["QR Identity"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["studentId"],
                properties: {
                  studentId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "QR identity created" }
        }
      }
    },
    "/qr/regenerate": {
      post: {
        summary: "Regenerate / Rotate QR Code key (Admin only)",
        tags: ["QR Identity"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["studentId"],
                properties: {
                  studentId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "QR identity rotated successfully" }
        }
      }
    },
    "/verify": {
      post: {
        summary: "Verify student checkpoint status",
        tags: ["Verification Engine"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["method", "identifier"],
                properties: {
                  method: { type: "string", enum: ["matric", "id", "qr"], example: "matric" },
                  identifier: { type: "string", example: "UNI/2026/0001" },
                  location: { type: "string", example: "Library Gate" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Verification complete, returns status (verified/failed)" }
        }
      }
    },
    "/logs": {
      get: {
        summary: "Query verification logs",
        tags: ["Verification Logs"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "type", in: "query", schema: { type: "string", enum: ["Matric", "Student ID", "QR Scan"] } },
          { name: "status", in: "query", schema: { type: "string", enum: ["verified", "failed"] } },
          { name: "range", in: "query", schema: { type: "string", enum: ["today", "this week", "this month", "custom"] } }
        ],
        responses: {
          200: { description: "Paginated log outputs" }
        }
      }
    },
    "/logs/export": {
      get: {
        summary: "Export verification logs as CSV file attachment",
        tags: ["Verification Logs"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "type", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Returns file stream download content-type text/csv" }
        }
      }
    },
    "/upload": {
      post: {
        summary: "Upload student photo file (Admin only)",
        tags: ["File Upload"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["photo"],
                properties: {
                  photo: { type: "string", format: "binary" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Photo stored successfully" }
        }
      },
      delete: {
        summary: "Delete photo asset (Admin only)",
        tags: ["File Upload"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["publicId"],
                properties: {
                  publicId: { type: "string", example: "uploads/photo-123.jpg" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Asset deleted successfully" }
        }
      }
    },
    "/analytics": {
      get: {
        summary: "Retrieve dashboard statistics summary and aggregated charts",
        tags: ["Dashboard Analytics"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Structured dashboard analytics response payload" }
        }
      }
    }
  }
};

// Expose OpenAPI specs directly via JSON
router.get("/", (req, res) => {
  res.status(200).json(openApiSpec);
});

export default router;
export { router };
