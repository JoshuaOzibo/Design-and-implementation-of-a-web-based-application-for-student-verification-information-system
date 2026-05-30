import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { students, logs } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerificationBadge, StatusPill } from "@/components/svis/VerificationBadge";
import { QRCode } from "@/components/svis/QRCode";
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from "lucide-react";

export const Route = createFileRoute("/app/student/$id")({
  head: () => ({ meta: [{ title: "Student profile · SVIS" }] }),
  loader: ({ params }) => {
    const student = students.find((s) => s.id === params.id);
    if (!student) throw notFound();
    return { student };
  },
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">Student not found.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-sm text-destructive">{error.message}</div>
  ),
  component: Page,
});

function Page() {
  const { student } = Route.useLoaderData();
  const history = logs.filter((l) => l.matric === student.matric).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm"><Link to="/app/students"><ArrowLeft className="mr-1.5 h-4 w-4" />Back</Link></Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{student.fullName}</h1>
          <p className="text-sm text-muted-foreground">{student.matric} · {student.department}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <VerificationBadge status="verified" />
          <StatusPill status={student.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <img src={student.photo} alt={student.fullName} className="h-32 w-32 rounded-md border border-border object-cover" />
            <div className="mt-4 text-base font-semibold">{student.fullName}</div>
            <div className="text-xs text-muted-foreground">{student.matric}</div>
            <div className="mt-5 w-full space-y-2 text-left text-sm">
              <Row icon={Mail} label={student.email} />
              <Row icon={Phone} label={student.phone} />
              <Row icon={Calendar} label={`DOB ${student.dob}`} />
              <Row icon={MapPin} label={student.address} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Academic information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Department" value={student.department} />
            <Field label="Faculty" value={student.faculty} />
            <Field label="Level" value={student.level + "L"} />
            <Field label="Session" value={student.session} />
            <Field label="Student ID" value={student.id} />
            <Field label="Status" value={student.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">QR identity</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <QRCode value={student.matric} size={160} />
            <div className="text-xs text-muted-foreground">https://svis.uni.edu/v/{student.matric}</div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm"><Link to="/app/qr">Manage QR</Link></Button>
              <Button size="sm">Download</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Verification history</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {history.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">No verifications yet.</div>}
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <div className="text-sm font-medium">{h.type} verification</div>
                  <div className="text-xs text-muted-foreground">{h.date} · {h.time} · {h.location} · by {h.staffName}</div>
                </div>
                <VerificationBadge status={h.status === "verified" ? "verified" : "invalid"} />
              </div>
            ))}
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
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </div>
  );
}
