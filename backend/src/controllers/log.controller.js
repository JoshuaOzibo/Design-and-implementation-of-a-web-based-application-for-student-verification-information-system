import * as logService from "../services/log.service.js";

/**
 * Parses filter keys from Express request query parameters
 */
const parseQueryParams = (req) => {
  const filter = {};
  
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.location) filter.location = req.query.location;
  if (req.query.staff) filter.staff = req.query.staff;
  if (req.query.student) filter.student = req.query.student;

  const options = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    range: req.query.range,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    sortBy: req.query.sortBy,
  };

  return { filter, options };
};

/**
 * Get paginated verification logs handler
 */
export const getLogs = async (req, res, next) => {
  try {
    const { filter, options } = parseQueryParams(req);
    const data = await logService.queryLogs(filter, options);
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export matching verification logs as a download CSV file handler
 */
export const exportLogs = async (req, res, next) => {
  try {
    const { filter, options } = parseQueryParams(req);
    const csvContent = await logService.exportLogsToCSV(filter, options);

    // Set headers to trigger file download attachment in client browser
    const filename = `verification-logs-export-${Date.now()}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
