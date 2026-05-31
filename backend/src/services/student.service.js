import Student from "../models/Student.js";
import QRIdentity from "../models/QRIdentity.js";
import ApiError from "../utils/ApiError.js";

/**
 * Create a new student profile
 * @param {object} studentData - Student details
 * @returns {Promise<object>} Created student
 */
export const createStudent = async (studentData) => {
  const { matricNumber, email } = studentData;

  // Check if matric number exists
  const existingMatric = await Student.findOne({ matricNumber });
  if (existingMatric) {
    throw new ApiError(400, `Student with Matric Number '${matricNumber}' already exists`);
  }

  // Check if email exists
  const existingEmail = await Student.findOne({ email });
  if (existingEmail) {
    throw new ApiError(400, `Student with email '${email}' already exists`);
  }

  const student = await Student.create(studentData);
  return student;
};

/**
 * Update an existing student profile
 * @param {string} studentId - Student ObjectID
 * @param {object} updateData - Updatable fields
 * @returns {Promise<object>} Updated student profile
 */
export const updateStudent = async (studentId, updateData) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  // Check unique constraints if matricNumber changes
  if (updateData.matricNumber && updateData.matricNumber !== student.matricNumber) {
    const matricConflict = await Student.findOne({ matricNumber: updateData.matricNumber });
    if (matricConflict) {
      throw new ApiError(400, `Matric Number '${updateData.matricNumber}' is already in use`);
    }
  }

  // Check unique constraints if email changes
  if (updateData.email && updateData.email !== student.email) {
    const emailConflict = await Student.findOne({ email: updateData.email });
    if (emailConflict) {
      throw new ApiError(400, `Email '${updateData.email}' is already in use`);
    }
  }

  // Update fields
  Object.assign(student, updateData);
  await student.save();

  // Populate references and return
  return student.populate("faculty department");
};

/**
 * Delete student and their associated QR Identity
 * @param {string} studentId - Student ObjectID
 * @returns {Promise<void>}
 */
export const deleteStudent = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  // Delete associated QRIdentity
  await QRIdentity.deleteOne({ student: studentId });

  // Delete student profile
  await Student.findByIdAndDelete(studentId);
};

/**
 * Retrieve student by ObjectID
 * @param {string} studentId - Student ObjectID
 * @returns {Promise<object>} Populated student profile
 */
export const getStudentById = async (studentId) => {
  const student = await Student.findById(studentId).populate("faculty department");
  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }
  return student;
};

/**
 * Retrieve student by Matric Number
 * @param {string} matricNumber - Student Matric Number
 * @returns {Promise<object>} Populated student profile
 */
export const getStudentByMatric = async (matricNumber) => {
  const student = await Student.findOne({ matricNumber }).populate("faculty department");
  if (!student) {
    throw new ApiError(404, `Student with Matric Number '${matricNumber}' not found`);
  }
  return student;
};

/**
 * Query students with filtering, search query matching, sorting, and pagination
 * @param {object} filter - Filters (level, status, faculty, department)
 * @param {object} options - Pagination options (page, limit, search, sortBy)
 * @returns {Promise<object>} Paginated query results
 */
export const queryStudents = async (filter, options) => {
  const { page = 1, limit = 10, search, sortBy } = options;
  const skip = (page - 1) * limit;

  // Build dynamic search criteria
  const queryFilter = { ...filter };
  if (search) {
    const searchRegex = new RegExp(search, "i");
    queryFilter.$or = [
      { fullName: searchRegex },
      { matricNumber: searchRegex },
      { email: searchRegex },
    ];
  }

  // Build sort criteria
  let sort = {};
  if (sortBy) {
    const parts = sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const results = await Student.find(queryFilter)
    .populate("faculty department")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalResults = await Student.countDocuments(queryFilter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};
