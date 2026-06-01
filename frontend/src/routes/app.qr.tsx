import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCode } from "@/components/svis/QRCode";
import { Download, RotateCw, Printer, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi, StudentProfile } from "../api/student.api";
import { qrApi } from "../api/qr.api";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/qr")({
  head: () => ({ meta: [{ title: "QR Management · SVIS" }] }),
  component: Page,
});

function Page() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>("");

  // Fetch all students for the dropdown (limit 100 for evaluation)
  const { data: studentsRes, isLoading: loadingStudents } = useQuery({
    queryKey: ["qr-students-list"],
    queryFn: () => studentApi.getStudents({ limit: 100 }),
  });

  const students = studentsRes?.data?.results || [];

  // Automatically select the first student in the list once loaded
  if (!selectedId && students.length > 0) {
    setSelectedId(students[0]._id);
  }

  const s = students.find((x) => x._id === selectedId);

  // Fetch cryptographic QR details for selected student
  const { data: qrRes } = useQuery({
    queryKey: ["qr-student-identity", selectedId],
    queryFn: () => qrApi.generateQR(selectedId),
    enabled: !!selectedId,
  });

  // Rotate QR Mutation
  const rotateQRMutation = useMutation({
    mutationFn: qrApi.regenerateQR,
    onSuccess: () => {
      toast.success("Cryptographic student QR token regenerated successfully");
      queryClient.invalidateQueries({ queryKey: ["qr-students-list"] });
      if (selectedId) {
        queryClient.invalidateQueries({ queryKey: ["qr-student-identity", selectedId] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to regenerate QR token");
    },
  });

  const handlePrint = () => {
    if (!s) return;
    const printContent = document.getElementById("student-id-card-preview");
    if (!printContent) return;

    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Popup blocker prevented opening the print window");
      return;
    }

    const facultyName = typeof s.faculty === "object" ? s.faculty.name : s.faculty;
    const departmentName = typeof s.department === "object" ? s.department.name : s.department;

    win.document.write(`
      <html>
        <head>
          <title>Print ID Card - ${s.fullName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f1f5f9;
            }
            .card {
              width: 480px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              border: 1px solid #e2e8f0;
              overflow: hidden;
            }
            .header {
              background-color: #0f172a;
              color: white;
              padding: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header-title {
              font-size: 14px;
              font-weight: 600;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }
            .header-subtitle {
              font-size: 10px;
              opacity: 0.8;
            }
            .content {
              display: grid;
              grid-template-columns: auto 1fr auto;
              gap: 20px;
              padding: 24px;
              align-items: center;
            }
            .photo {
              width: 110px;
              height: 110px;
              border-radius: 8px;
              object-fit: cover;
              border: 1px solid #cbd5e1;
            }
            .details {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .name {
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
            }
            .matric {
              font-size: 12px;
              color: #64748b;
              font-family: monospace;
              margin-bottom: 8px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 16px;
              font-size: 11px;
            }
            .meta-label {
              color: #94a3b8;
            }
            .meta-value {
              font-weight: 600;
              color: #334155;
            }
            .qr-container {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
            }
            .qr-label {
              font-size: 8px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .footer {
              background-color: #f8fafc;
              border-top: 1px solid #e2e8f0;
              padding: 10px 16px;
              font-size: 9px;
              color: #94a3b8;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div>
                <div class="header-title">University Registry</div>
                <div class="header-subtitle">Official Student Identification Card</div>
              </div>
              <div style="font-size: 11px; font-weight: 600;">Session ${s.academicSession}</div>
            </div>
            <div class="content">
              ${s.photo ? `<img class="photo" src="${s.photo}" />` : `<div class="photo" style="background:#cbd5e1; display:flex; justify-content:center; align-items:center; font-weight:bold; font-size:24px;">${s.fullName.slice(0, 2).toUpperCase()}</div>`}
              <div class="details">
                <div class="name">${s.fullName}</div>
                <div class="matric">${s.matricNumber}</div>
                <div class="meta-grid">
                  <div>
                    <div class="meta-label">Dept</div>
                    <div class="meta-value">${departmentName}</div>
                  </div>
                  <div>
                    <div class="meta-label">Faculty</div>
                    <div class="meta-value">${facultyName}</div>
                  </div>
                  <div>
                    <div class="meta-label">Level</div>
                    <div class="meta-value">${s.level}L</div>
                  </div>
                  <div>
                    <div class="meta-label">Status</div>
                    <div class="meta-value" style="color: #22c55e;">${s.status.toUpperCase()}</div>
                  </div>
                </div>
              </div>
              <div class="qr-container">
                <!-- Inline SVG copy of the QRCode -->
                ${document.getElementById("print-qr-svg-holder")?.innerHTML || ""}
                <div class="qr-label">Scan to verify</div>
              </div>
            </div>
            <div class="footer">
              This card remains the property of the University. If found, please return to the ICT Directorate.
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 600);
          </script>
        </body>
      </html>
    `);
    win.document.close();
    toast.info("Sent to print queue");
  };

  const handleDownload = () => {
    if (!s) return;
    toast.success(`Download student badge PDF for ${s.fullName}`);
  };

  if (loadingStudents) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading identity registry details…</p>
        </div>
      </div>
    );
  }

  const facultyName = s
    ? (typeof s.faculty === "object" ? s.faculty.name : s.faculty)
    : "N/A";
  const departmentName = s
    ? (typeof s.department === "object" ? s.department.name : s.department)
    : "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">QR identity management</h1>
        <p className="text-sm text-muted-foreground">Generate, preview, and rotate dynamic cryptographic student ID tokens.</p>
      </div>

      {students.length === 0 ? (
        <Card className="border-dashed py-16 text-center">
          <CardContent>
            <p className="text-sm text-muted-foreground">No students enrolled in the registry database yet.</p>
            <Button asChild className="mt-4">
              <Link to="/app/students" search={{ register: "true" }}>Enroll a Student</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        s && (
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Identity controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="student-select">Select Student Record</Label>
                  <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger id="student-select" className="mt-1.5">
                      <SelectValue placeholder="Choose student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((st) => (
                        <SelectItem key={st._id} value={st._id}>
                          {st.fullName} — {st.matricNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="verification-url">Dynamic Key URL</Label>
                  <Input
                    id="verification-url"
                    className="mt-1.5 font-mono text-xs select-all bg-muted/30"
                    readOnly
                    value={`http://localhost:5173/app/verify?id=${s._id}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4 text-primary" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => rotateQRMutation.mutate(s._id)}
                    disabled={rotateQRMutation.isPending}
                  >
                    {rotateQRMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCw className="mr-2 h-4 w-4 text-primary" />
                    )}
                    Rotate Token
                  </Button>
                  <Button className="col-span-2" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print ID Badge
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">ID card badge preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div id="student-id-card-preview" className="overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">University Registry</div>
                      <div className="text-sm font-bold">Official Student Identification</div>
                    </div>
                    <div className="text-xs font-semibold bg-slate-800 px-2 py-1 rounded">Session {s.academicSession}</div>
                  </div>
                  <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                    <div className="h-32 w-32 overflow-hidden rounded-md border bg-slate-50 flex items-center justify-center">
                      {s.photo ? (
                        <img src={s.photo} alt={s.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-bold text-2xl text-slate-400">
                          {s.fullName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-lg font-bold text-slate-900">{s.fullName}</div>
                        <div className="text-xs font-mono text-slate-400">{s.matricNumber}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <Info label="Department" value={departmentName} />
                        <Info label="Faculty" value={facultyName} />
                        <Info label="Level" value={s.level + "L"} />
                        <Info label="Card Status" value={s.status} />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 rounded-md border bg-slate-50 p-3">
                      <div id="print-qr-svg-holder">
                        <QRCode value={qrRes?.data?.verificationUrl || s.matricNumber} size={110} />
                      </div>
                      <div className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Scan to Verify</div>
                    </div>
                  </div>
                  <div className="border-t bg-slate-50 px-5 py-2.5 text-[9px] text-slate-400 text-center">
                    This card remains the property of the University. If found, please return to the ICT Directorate.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-400 font-medium">{label}</div>
      <div className="font-semibold text-slate-800 capitalize truncate max-w-[120px]">{value}</div>
    </div>
  );
}

export default Page;
