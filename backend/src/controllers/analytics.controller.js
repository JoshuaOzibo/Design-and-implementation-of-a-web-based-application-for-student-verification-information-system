import * as analyticsService from "../services/analytics.service.js";

/**
 * Handle dashboard analytics retrieval request
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardAnalytics();
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
