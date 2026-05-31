import express from "express";
import * as studentController from "../controllers/student.controller.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import {
  createStudentSchema,
  updateStudentSchema,
  queryStudentsSchema,
} from "../middleware/student.validation.js";

const router = express.Router();

// Apply auth protection to all student endpoints
router.use(protect);

// Get students list (search, pagination, filters)
router.get("/", validate(queryStudentsSchema), studentController.getStudents);

// Get student by matric number
router.get("/matric/:matricNumber", studentController.getStudentByMatric);

// Get student by ID
router.get("/:id", studentController.getStudentById);

// Create new student profile (Admin only)
router.post("/", restrictTo("Admin"), validate(createStudentSchema), studentController.createStudent);

// Update student profile (Admin only)
router.patch("/:id", restrictTo("Admin"), validate(updateStudentSchema), studentController.updateStudent);

// Delete student profile (Admin only)
router.delete("/:id", restrictTo("Admin"), studentController.deleteStudent);

export default router;
export { router };
