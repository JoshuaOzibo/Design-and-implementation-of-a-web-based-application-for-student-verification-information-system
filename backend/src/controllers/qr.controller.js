import * as qrService from "../services/qr.service.js";
import { verifyAccessToken } from "../utils/token.js";
import User from "../models/User.js";

/**
 * Generate QR code identity for a student handler
 */
export const generateQR = async (req, res, next) => {
  try {
    const qrIdentity = await qrService.generateQR(req.params.studentId);
    res.status(201).json({
      success: true,
      message: "Student QR identity generated successfully",
      data: qrIdentity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate QR code identity for a student handler
 */
export const regenerateQR = async (req, res, next) => {
  try {
    const qrIdentity = await qrService.regenerateQR(req.params.studentId);
    res.status(200).json({
      success: true,
      message: "Student QR identity regenerated successfully",
      data: qrIdentity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify student QR identity handler
 */
export const verifyQR = async (req, res, next) => {
  const wantsHtml = (req.headers.accept && req.headers.accept.includes("text/html")) || req.query.format === "html";
  try {
    const { verificationId } = req.params;
    const { location } = req.query; // optional checkpoint location
    
    // Optional token-based authentication (to identify staff if request is sent from frontend client)
    let staffId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id);
        if (user && user.status === "active") {
          req.user = user;
          staffId = user._id;
        }
      } catch (e) {
        // Ignore token decode errors for public route compatibility
      }
    }

    // Call verifyQR service (handles logging too)
    const result = await qrService.verifyQR(verificationId, staffId, location);

    if (wantsHtml) {
      const student = result.student;
      const facultyName = student && typeof student.faculty === "object" ? student.faculty.name : (student?.faculty || "Unknown Faculty");
      const departmentName = student && typeof student.department === "object" ? student.department.name : (student?.department || "Unknown Department");

      return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student ID Badge - ${student.fullName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      color: #f8fafc;
      padding: 20px;
    }
    .badge-card {
      width: 100%;
      max-width: 450px;
      background: rgba(30, 41, 59, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .badge-header {
      background: #0f172a;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .header-left h1 {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #38bdf8;
    }
    .header-left p {
      margin: 3px 0 0 0;
      font-size: 10px;
      color: #94a3b8;
    }
    .session-badge {
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.2);
      color: #38bdf8;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;
    }
    .badge-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    @media (min-width: 400px) {
      .badge-body {
        flex-direction: row;
        align-items: flex-start;
      }
    }
    .photo-container {
      width: 110px;
      height: 110px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.15);
      background: #0f172a;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .photo-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-placeholder {
      width: 100%;
      height: 100%;
      background: #1e293b;
      color: #38bdf8;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .details-container {
      flex-grow: 1;
      min-width: 0;
      width: 100%;
    }
    .student-name {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
      word-wrap: break-word;
    }
    .student-matric {
      font-family: monospace;
      font-size: 12px;
      color: #38bdf8;
      margin: 4px 0 14px 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 8px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .info-value {
      font-size: 11px;
      font-weight: 600;
      color: #e2e8f0;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      color: #22c55e;
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      width: fit-content;
      margin-top: 2px;
      text-transform: capitalize;
    }
    .status-badge.suspended {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .status-badge.graduated {
      background: rgba(168, 85, 247, 0.1);
      border: 1px solid rgba(168, 85, 247, 0.2);
      color: #a855f7;
    }
    .status-badge.pending {
      background: rgba(234, 179, 8, 0.1);
      border: 1px solid rgba(234, 179, 8, 0.2);
      color: #eab308;
    }
    .badge-footer {
      background: rgba(15, 23, 42, 0.4);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 12px 20px;
      text-align: center;
      font-size: 9px;
      color: #64748b;
    }
    .verification-checkmark {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 8px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      color: #22c55e;
      padding: 8px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 12px;
    }
    .verification-checkmark.invalid {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .print-button {
      margin-top: 16px;
      width: 100%;
      background: #38bdf8;
      color: #0f172a;
      border: none;
      border-radius: 8px;
      padding: 10px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .print-button:hover {
      background: #0ea5e9;
    }
    @media print {
      body {
        background: white;
        color: black;
        padding: 0;
      }
      .badge-card {
        box-shadow: none;
        border: 1px solid #cbd5e1;
        background: white;
      }
      .badge-header {
        background: #0f172a !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="badge-card">
    <div class="badge-header">
      <div class="header-left">
        <h1>University Registry</h1>
        <p>Student Verification System</p>
      </div>
      <div class="session-badge">${student.academicSession}</div>
    </div>
    
    <div class="badge-body">
      <div class="photo-container">
        ${student.photo 
          ? `<img src="${student.photo}" alt="${student.fullName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="photo-placeholder" style="display:none;">${student.fullName.slice(0, 2).toUpperCase()}</div>` 
          : `<div class="photo-placeholder">${student.fullName.slice(0, 2).toUpperCase()}</div>`
        }
      </div>
      
      <div class="details-container">
        <h2 class="student-name">${student.fullName}</h2>
        <div class="student-matric">${student.matricNumber}</div>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Department</div>
            <div class="info-value" title="${departmentName}">${departmentName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Faculty</div>
            <div class="info-value" title="${facultyName}">${facultyName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Level</div>
            <div class="info-value">${student.level}L</div>
          </div>
          <div class="info-item">
            <div class="info-label">Card Status</div>
            <div class="status-badge ${student.status}">${student.status}</div>
          </div>
        </div>
      </div>
    </div>

    <div style="padding: 0 24px 20px 24px;">
      ${student.status === 'active' 
        ? `<div class="verification-checkmark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            VERIFIED ACTIVE ID CARD
           </div>`
        : `<div class="verification-checkmark invalid">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            VERIFICATION DENIED: ${student.status.toUpperCase()}
           </div>`
      }
      <button class="print-button" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save as PDF
      </button>
    </div>
    
    <div class="badge-footer">
      This card remains the property of the University. Verifiable digital record.
    </div>
  </div>
</body>
</html>
      `);
    }

    res.status(200).json({
      success: true,
      message: result.verified ? "Student identity verified successfully" : "Student identity verification failed",
      data: result,
    });
  } catch (error) {
    if (wantsHtml) {
      return res.status(error.statusCode || 500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Error</title>
          <style>
            body { font-family: sans-serif; background: #0f172a; color: #ef4444; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .error-box { background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #ef4444; text-align: center; max-width: 400px; }
            h2 { margin-top: 0; }
            p { color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="error-box">
            <h2>Verification Failed</h2>
            <p>${error.message || "An unexpected error occurred."}</p>
          </div>
        </body>
        </html>
      `);
    }
    next(error);
  }
};
