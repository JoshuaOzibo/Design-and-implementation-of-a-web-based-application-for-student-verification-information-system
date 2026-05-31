import Student from "../models/Student.js";
import VerificationLog from "../models/VerificationLog.js";

/**
 * Get comprehensive analytics for the SVIS dashboard
 * @returns {Promise<object>} Aggregated stats and metrics object
 */
export const getDashboardAnalytics = async () => {
  const now = new Date();
  
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Last 7 days including today
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // 1. Basic Count Queries
  const [
    totalStudents,
    activeStudents,
    pendingStudents,
    totalVerifications,
    verificationsToday,
    verificationsThisMonth,
  ] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ status: "active" }),
    Student.countDocuments({ status: "pending" }),
    VerificationLog.countDocuments(),
    VerificationLog.countDocuments({ status: "verified", createdAt: { $gte: startOfToday } }),
    VerificationLog.countDocuments({ status: "verified", createdAt: { $gte: startOfMonth } }),
  ]);

  // 2. Daily Verification Trend (last 7 days)
  const trends = await VerificationLog.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        verified: {
          $sum: {
            $cond: [{ $eq: ["$status", "verified"] }, 1, 0],
          },
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 3. Verification By Method Distribution
  const byMethod = await VerificationLog.aggregate([
    {
      $group: {
        _id: "$type",
        value: { $sum: 1 },
      },
    },
    { $sort: { value: -1 } },
  ]);

  // 4. Verifications By Department (requires lookups)
  const byDepartment = await VerificationLog.aggregate([
    {
      $match: {
        student: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "students",
        localField: "student",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },
    {
      $lookup: {
        from: "departments",
        localField: "studentInfo.department",
        foreignField: "_id",
        as: "deptInfo",
      },
    },
    { $unwind: "$deptInfo" },
    {
      $group: {
        _id: "$deptInfo.name",
        code: { $first: "$deptInfo.code" },
        value: { $sum: 1 },
      },
    },
    { $sort: { value: -1 } },
  ]);

  // 5. Verifications By Faculty (requires lookups)
  const byFaculty = await VerificationLog.aggregate([
    {
      $match: {
        student: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "students",
        localField: "student",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },
    {
      $lookup: {
        from: "faculties",
        localField: "studentInfo.faculty",
        foreignField: "_id",
        as: "facultyInfo",
      },
    },
    { $unwind: "$facultyInfo" },
    {
      $group: {
        _id: "$facultyInfo.name",
        code: { $first: "$facultyInfo.code" },
        value: { $sum: 1 },
      },
    },
    { $sort: { value: -1 } },
  ]);

  // 6. Student Status Distribution
  const byStudentStatus = await Student.aggregate([
    {
      $group: {
        _id: "$status",
        value: { $sum: 1 },
      },
    },
    { $sort: { value: -1 } },
  ]);

  return {
    summary: {
      totalStudents,
      activeStudents,
      pendingStudents,
      totalVerifications,
      verificationsToday,
      verificationsThisMonth,
    },
    trends,
    byMethod,
    byDepartment,
    byFaculty,
    byStudentStatus,
  };
};
