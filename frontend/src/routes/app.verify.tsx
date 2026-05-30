import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { findStudent, students } from "@/lib/mock-data";
import { VerificationBadge, StatusPill } from "@/components/svis/VerificationBadge";
import { QRCode } from "@/components/svis/QRCode";
import { Search, ScanLine, IdCard, ShieldCheck, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/app/verify")({
  head: () => ({ meta: [{ title: "Verify Student · SVIS" }] }),
  component: Verify,
});

type Result = { student: ReturnType<typeof findStudent>; ok: boolean } | null;

function Verify() {
  const [result, setResult] = useState<Result>(null);
  const [q, setQ] = useState("");

  const onVerify = (val: string) => {
    const s = findStudent(val);
    if (s) { setResult({ student: s, ok: true }); toast.success("Identity verified"); }
    else { setResult({ student: undefined, ok: false }); toast.error("No matching record"); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Student verification</h1>
        <p className="text-sm text-muted-foreground">Confirm identity using matric number, student ID, or QR scan.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Verification methods</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="matric" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="matric"><IdCard className="mr-1.5 h-4 w-4" />Matric</TabsTrigger>
                <TabsTrigger value="id"><Search className="mr-1.5 h-4 w-4" />Student ID</TabsTrigger>
                <TabsTrigger value="qr"><ScanLine className="mr-1.5 h-4 w-4" />QR Scan</TabsTrigger>
              </TabsList>

              <TabsContent value="matric" className="mt-5 space-y-3">
                <Input placeholder="e.g. UNI/2022/1234" value={q} onChange={(e) => setQ(e.target.value)} />
                <Button className="w-full" onClick={() => onVerify(q || "UNI/2022/1234")}>
                  <ShieldCheck className="mr-2 h-4 w-4" />Verify identity
                </Button>
                <p className="text-xs text-muted-foreground">Try: UNI/2022/1234 (demo data)</p>
              </TabsContent>

              <TabsContent value="id" className="mt-5 space-y-3">
                <Input placeholder="e.g. STU-1003" value={q} onChange={(e) => setQ(e.target.value)} />
                <Button className="w-full" onClick={() => onVerify(q || "STU-1003")}>
                  <ShieldCheck className="mr-2 h-4 w-4" />Verify identity
                </Button>
              </TabsContent>

              <TabsContent value="qr" className="mt-5">
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-8 text-center">
                  <ScanLine className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">Position the QR within the frame</p>
                  <p className="mt-1 text-xs text-muted-foreground">Camera access required</p>
                  <Button variant="outline" className="mt-4" onClick={() => onVerify("UNI/2022/1234")}>Simulate scan</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!result && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-semibold">Awaiting verification</h3>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Select a verification method and provide the student identifier to display their record.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {result?.ok && result.student && (
              <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start gap-6">
                      <img src={result.student.photo} alt={result.student.fullName} className="h-32 w-32 rounded-md border border-border object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold">{result.student.fullName}</h2>
                          <VerificationBadge status="verified" />
                          <StatusPill status={result.student.status} />
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">{result.student.matric} · {result.student.id}</div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <Field label="Department" value={result.student.department} />
                          <Field label="Faculty" value={result.student.faculty} />
                          <Field label="Level" value={result.student.level + "L"} />
                          <Field label="Session" value={result.student.session} />
                          <Field label="Email" value={result.student.email} />
                          <Field label="Phone" value={result.student.phone} />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 rounded-md border border-border p-3">
                        <QRCode value={result.student.matric} size={120} />
                        <div className="text-[10px] text-muted-foreground">Tamper-evident</div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/app/student/$id" params={{ id: result.student.id }}>
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />Open profile
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast.message("Recorded in verification log")}>Approve entry</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => toast.error("Flagged for review")}>Flag</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {result && !result.ok && (
              <motion.div key="bad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-destructive/40">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <VerificationBadge status="invalid" />
                    <p className="mt-3 max-w-sm text-sm text-muted-foreground">No student record matched the identifier provided. Verify the input or contact the registrar.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 text-xs text-muted-foreground">
            Sample identifiers: <code className="rounded bg-muted px-1.5 py-0.5">{students[0].matric}</code> · <code className="rounded bg-muted px-1.5 py-0.5">{students[2].matric}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
