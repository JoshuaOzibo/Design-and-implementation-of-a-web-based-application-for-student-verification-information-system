import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerificationBadge, StatusPill } from "@/components/svis/VerificationBadge";
import { QRCode } from "@/components/svis/QRCode";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Loader2, QrCode } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "../api/student.api";
import { logApi } from "../api/log.api";
import { qrApi } from "../api/qr.api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/student/$id")({
  head: () => ({ meta: [{ title: "Student profile · SVIS" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();

  // Query 1: Student Details
  const { data: studentRes, isLoading: studentLoading, error: studentError } = useQuery({
    queryKey: ["student", id],
    queryFn: () => studentApi.getStudentById(id),
  });

  // Query 2: Student Verification Logs
  const { data: logsRes, isLoading: logsLoading } = useQuery({
    queryKey: ["student-logs", id],
    queryFn: () => logApi.getLogs({ student: id, limit: 5 }),
    enabled: !!studentRes?.data,
  });

  // Rotate QR Mutation
  const rotateQRMutation = useMutation({
    mutationFn: qrApi.regenerateQR,
    onSuccess: () => {
      toast.success("Student cryptographic identity rotated successfully");
      queryClient.invalidateQueries({ queryKey: ["student", id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to rotate cryptographic card");
    },
  });

  if (studentLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading student profile…</p>
        </div>
      </div>
    );
  }

  if (studentError || !studentRes?.data) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-destructive font-medium">
          {studentError ? (studentError as any).response?.data?.message || "Error loading profile" : "Student profile not found"}
        </p>
        <Button asChild variant="outline">
          <Link to="/app/students">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to list
          </Link>
        </Button>
      </div>
    );
  }

  const student = studentRes.data;
  const history = logsRes?.data?.results || [];

  const facultyName = typeof student.faculty === "object" ? student.faculty.name : "Unknown Faculty";
  const departmentName = typeof student.department === "object" ? student.department.name : "Unknown Department";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/students">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{student.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            {student.matricNumber} · {departmentName}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <VerificationBadge status={student.status === "active" ? "verified" : "invalid"} />
          <StatusPill status={student.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="h-32 w-32 overflow-hidden rounded-md border border-border bg-muted">
              {student.photo ? (
                <img src={student.photo} alt={student.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-semibold text-xl">
                  {student.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="mt-4 text-base font-semibold">{student.fullName}</div>
            <div className="text-xs text-muted-foreground">{student.matricNumber}</div>
            <div className="mt-5 w-full space-y-2.5 text-left text-sm">
              <Row icon={Mail} label={student.email} />
              <Row icon={Phone} label={student.phone} />
              <Row icon={Calendar} label={`DOB: ${student.dob ? new Date(student.dob).toLocaleDateString() : "Unknown"}`} />
              <Row icon={MapPin} label={student.address} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Academic information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Department" value={departmentName} />
            <Field label="Faculty" value={facultyName} />
            <Field label="Level" value={student.level + "L"} />
            <Field label="Session" value={student.academicSession} />
            <Field label="Database ID" value={student._id} />
            <Field label="Status" value={student.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">QR identity card</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <QRCode value={student.matricNumber} size={160} />
            <div className="text-center">
              <div className="text-xs font-mono text-muted-foreground select-all truncate max-w-[200px]">
                {student.matricNumber}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Cryptographic key dynamically linked</p>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => rotateQRMutation.mutate(student._id)}
                disabled={rotateQRMutation.isPending}
              >
                {rotateQRMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <QrCode className="mr-1.5 h-3.5 w-3.5" />
                )}
                Rotate ID
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Verification logs (Recent 5)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logsLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No verification scans recorded for this student.
              </div>
            ) : (
              history.map((h) => {
                let formattedTime = "";
                try {
                  formattedTime = new Date(h.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });
                } catch (e) {
                  formattedTime = "Unknown date/time";
                }
                return (
                  <div key={h._id} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <div className="text-sm font-medium">{h.type} verification</div>
                      <div className="text-xs text-muted-foreground">
                        Scanned at {h.location || "Unknown location"} · {formattedTime} {h.staff ? `· by Officer` : ""}
                      </div>
                      {h.reason && <div className="text-xs text-destructive mt-1">Reason: {h.reason}</div>}
                    </div>
                    <VerificationBadge status={h.status === "verified" ? "verified" : "invalid"} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium capitalize">{value}</div>
    </div>
  );
}

function Row({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

export default Page;
