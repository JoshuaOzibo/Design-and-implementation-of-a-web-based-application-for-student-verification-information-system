import * as studentService from "../services/student.service.js";

/**
 * Create student profile handler
 */
export const createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({
      success: true,
      message: "Student profile created successfully",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update student profile handler
 */
export const updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete student profile handler
 */
export const deleteStudent = async (req, res, next) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.status(200).json({
      success: true,
      message: "Student profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student by ObjectID handler
 */
export const getStudentById = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student by Matric Number handler
 */
export const getStudentByMatric = async (req, res, next) => {
  try {
    const student = await studentService.getStudentByMatric(req.params.matricNumber);
    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get students list with pagination, search query, sorting, and filters handler
 */
export const getStudents = async (req, res, next) => {
  try {
    // Separate filter params from option query params
    const filter = {};
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      sortBy: req.query.sortBy,
    };

    if (req.query.level) filter.level = req.query.level;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.faculty) filter.faculty = req.query.faculty;
    if (req.query.department) filter.department = req.query.department;

    const data = await studentService.queryStudents(filter, options);
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
