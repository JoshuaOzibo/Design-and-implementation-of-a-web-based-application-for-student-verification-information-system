import VerificationLog from "../models/VerificationLog.js";
import User from "../models/User.js";
import Student from "../models/Student.js";

/**
 * Builds the database filter criteria for logs based on query input
 */
const buildLogsFilter = async (filter, options) => {
  const { search, range, startDate, endDate } = options;
  const queryFilter = { ...filter };

  // 1. Text Search Filter across Matric, Location, Staff name, and Student name
  if (search) {
    const searchRegex = new RegExp(search, "i");
    
    // Find matching staff user IDs
    const matchingUsers = await User.find({ fullName: searchRegex }).select("_id");
    const userIds = matchingUsers.map((u) => u._id);

    // Find matching student IDs
    const matchingStudents = await Student.find({ fullName: searchRegex }).select("_id");
    const studentIds = matchingStudents.map((s) => s._id);

    queryFilter.$or = [
      { matricNumber: searchRegex },
      { location: searchRegex },
      { staff: { $in: userIds } },
      { student: { $in: studentIds } },
    ];
  }

  // 2. Date Range Filter
  if (range && range !== "custom") {
    const now = new Date();
    let startDateLimit;

    if (range === "today") {
      startDateLimit = new Date(now.setHours(0, 0, 0, 0));
    } else if (range === "week") {
      startDateLimit = new Date(now.setDate(now.getDate() - 7));
    } else if (range === "month") {
      startDateLimit = new Date(now.setMonth(now.getMonth() - 1));
    }

    if (startDateLimit) {
      queryFilter.createdAt = { $gte: startDateLimit };
    }
  } else if (startDate || endDate) {
    queryFilter.createdAt = {};
    if (startDate) {
      queryFilter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      // Set to the end of the day (23:59:59.999) to cover all events on that date
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      queryFilter.createdAt.$lte = endOfDay;
    }
  }

  return queryFilter;
};

/**
 * Query verification logs with filtering, searching, sorting, and pagination
 * @param {object} filter - Field filters (type, status, location, staff, student)
 * @param {object} options - Search and paging parameters (page, limit, search, range, startDate, endDate, sortBy)
 * @returns {Promise<object>} Paginated logs results
 */
export const queryLogs = async (filter, options) => {
  const { page = 1, limit = 10, sortBy } = options;
  const skip = (page - 1) * limit;

  const queryFilter = await buildLogsFilter(filter, options);

  // Sorting
  let sort = {};
  if (sortBy) {
    const parts = sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1; // Default: newest first
  }

  const results = await VerificationLog.find(queryFilter)
    .populate("staff student")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalResults = await VerificationLog.countDocuments(queryFilter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Compile a CSV string containing all logs matching the filter and search parameters
 * @param {object} filter - Field filters
 * @param {object} options - Search and date parameters
 * @returns {Promise<string>} Compiled CSV text
 */
export const exportLogsToCSV = async (filter, options) => {
  const queryFilter = await buildLogsFilter(filter, options);

  // Retrieve all logs matching criteria (no pagination limit)
  const logs = await VerificationLog.find(queryFilter)
    .populate("staff student")
    .sort({ createdAt: -1 });

  // Escape CSV fields helper (surrounds in quotes and doubles inner quotes)
  const escapeCsv = (str) => `"${String(str || "").replace(/"/g, '""')}"`;

  // Headers
  let csv = "Date,Time,Staff Name,Staff ID,Type,Student Name,Matric Number,Location,Status,Reason\n";

  for (const log of logs) {
    const timestamp = new Date(log.createdAt);
    const dateStr = timestamp.toISOString().split("T")[0];
    const timeStr = timestamp.toTimeString().split(" ")[0];

    const staffName = log.staff ? log.staff.fullName : "Deleted Staff";
    const staffId = log.staff ? log.staff.staffId : "N/A";
    const studentName = log.student ? log.student.fullName : (log.status === "failed" ? "N/A" : "Unknown");
    const matric = log.matricNumber;
    const type = log.type;
    const location = log.location;
    const status = log.status;
    const reason = log.reason || "";

    csv += `${dateStr},${timeStr},${escapeCsv(staffName)},${escapeCsv(staffId)},${type},${escapeCsv(studentName)},${escapeCsv(matric)},${escapeCsv(location)},${status},${escapeCsv(reason)}\n`;
  }

  return csv;
};
