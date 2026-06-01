import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { QRScanner } from "../components/svis/QRScanner";
import { VerificationBadge, StatusPill } from "@/components/svis/VerificationBadge";
import { QRCode } from "@/components/svis/QRCode";
import { Search, ScanLine, IdCard, ShieldCheck, ExternalLink, Loader2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { verifyApi } from "../api/verify.api";
import { studentApi } from "../api/student.api";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/verify")({
  head: () => ({ meta: [{ title: "Verify Student · SVIS" }] }),
  component: Verify,
});

interface VerificationResult {
  student: any;
  ok: boolean;
  reason?: string;
}

function Verify() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("Main Gate");
  const [isScanning, setIsScanning] = useState(false);

  // Fetch some sample students to display in the UI as examples
  const { data: studentsRes } = useQuery({
    queryKey: ["verify-sample-students"],
    queryFn: () => studentApi.getStudents({ limit: 3 }),
  });
  const samples = studentsRes?.data?.results || [];

  // Verification Mutation
  const verifyMutation = useMutation({
    mutationFn: verifyApi.verifyStudent,
    onSuccess: (res) => {
      if (res.data.verified) {
        setResult({ student: res.data.student, ok: true });
        toast.success("Identity verified successfully");
      } else {
        setResult({ student: res.data.student, ok: false, reason: res.data.reason });
        toast.error(res.data.reason || "Identity verification failed");
      }
    },
    onError: (err: any) => {
      setResult({ student: null, ok: false, reason: err.response?.data?.message || "No matching student record found." });
      toast.error(err.response?.data?.message || "Failed to process student verification");
    },
  });

  const handleVerify = (method: "matric" | "id" | "qr", identifier: string) => {
    if (!identifier.trim()) {
      toast.error("Please enter a valid student identifier");
      return;
    }
    verifyMutation.mutate({
      method,
      identifier: identifier.trim(),
      location,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Student verification checkpoint</h1>
        <p className="text-sm text-muted-foreground">Confirm identities using matric numbers, physical ID cards, or digital dynamic QR codes.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Verification settings & methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Checkpoint Location Selection */}
            <div className="space-y-1.5 border-b pb-4">
              <Label htmlFor="location" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Active Checkpoint Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Gate, Library Checkpoint"
              />
            </div>

            <Tabs defaultValue="matric" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="matric">
                  <IdCard className="mr-1.5 h-3.5 w-3.5" />
                  Matric
                </TabsTrigger>
                <TabsTrigger value="id">
                  <Search className="mr-1.5 h-3.5 w-3.5" />
                  ID Card
                </TabsTrigger>
                <TabsTrigger value="qr">
                  <ScanLine className="mr-1.5 h-3.5 w-3.5" />
                  QR Scan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matric" className="mt-4 space-y-3">
                <Input
                  placeholder="Enter Matric Number (e.g. SCI/19/0001)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <Button
                  className="w-full"
                  disabled={verifyMutation.isPending}
                  onClick={() => handleVerify("matric", q)}
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Verify Matric Code
                </Button>
              </TabsContent>

              <TabsContent value="id" className="mt-4 space-y-3">
                <Input
                  placeholder="Enter Student ID (e.g. Mongo ObjectID)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <Button
                  className="w-full"
                  disabled={verifyMutation.isPending}
                  onClick={() => handleVerify("id", q)}
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Verify ID Card
                </Button>
              </TabsContent>

              <TabsContent value="qr" className="mt-4 space-y-3">
                {isScanning ? (
                  <div className="space-y-3">
                    <QRScanner
                      onScanSuccess={(decodedText) => {
                        handleVerify("qr", decodedText);
                        setIsScanning(false);
                      }}
                    />
                    <Button
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => setIsScanning(false)}
                    >
                      Stop Camera Scanner
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-6 text-center">
                    <ScanLine className="mb-2 h-8 w-8 text-primary animate-pulse" />
                    <p className="text-xs font-semibold">Dynamic Scanner Camera</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Scan student dynamic QR codes at checkpoint</p>
                    
                    <Button
                      className="mt-4 w-full text-xs"
                      onClick={() => setIsScanning(true)}
                    >
                      <ScanLine className="mr-1.5 h-3.5 w-3.5" />
                      Start Camera Scanner
                    </Button>

                    {samples.length > 0 && (
                      <Button
                        variant="ghost"
                        className="mt-2 w-full text-[10px] text-muted-foreground hover:text-foreground"
                        disabled={verifyMutation.isPending}
                        onClick={() => handleVerify("qr", `VERIFY-${samples[0].matricNumber.replace(/\//g, "-")}`)}
                      >
                        Simulate scanning card
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!result && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-dashed h-[300px] flex items-center justify-center">
                  <CardContent className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-semibold">Awaiting scan or input</h3>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      Fill out verification fields or scan a QR card. Verified student academic logs will display dynamically here.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {result?.ok && result.student && (
              <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="border-success/30 bg-success/5">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start gap-6">
                      <div className="h-32 w-32 overflow-hidden rounded-md border border-border bg-muted">
                        {result.student.photo ? (
                          <img src={result.student.photo} alt={result.student.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-semibold text-xl">
                            {result.student.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold">{result.student.fullName}</h2>
                          <VerificationBadge status="verified" />
                          <StatusPill status={result.student.status} />
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {result.student.matricNumber} · {typeof result.student.department === "object" ? result.student.department.name : result.student.department}
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <Field label="Faculty" value={typeof result.student.faculty === "object" ? result.student.faculty.name : result.student.faculty} />
                          <Field label="Level" value={result.student.level + "L"} />
                          <Field label="Session" value={result.student.academicSession} />
                          <Field label="Verification Status" value="CLEARED - PASSED" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-white p-3">
                        <QRCode value={result.student.matricNumber} size={100} />
                        <div className="text-[9px] text-muted-foreground font-mono">Dynamic Key</div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/app/student/$id" params={{ id: result.student._id }}>
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          Open profile file
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                        Clear screen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {result && !result.ok && (
              <motion.div key="bad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-destructive/40 bg-destructive/5">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive animate-bounce">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <VerificationBadge status="invalid" />
                    <h3 className="text-base font-semibold mt-4 text-destructive">Verification Denied</h3>
                    <p className="mt-2 max-w-sm text-xs text-muted-foreground">
                      {result.reason || "No matching student record was found in the institution database."}
                    </p>
                    {result.student && (
                      <div className="mt-4 border p-4 rounded-md w-full max-w-md text-left bg-white">
                        <div className="font-semibold text-sm mb-2">{result.student.fullName} ({result.student.matricNumber})</div>
                        <div className="text-xs text-muted-foreground">Status: <span className="font-bold text-destructive uppercase">{result.student.status}</span></div>
                        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                          <Link to="/app/student/$id" params={{ id: result.student._id }}>View Profile Details</Link>
                        </Button>
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="mt-6" onClick={() => setResult(null)}>
                      Retry verification
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {samples.length > 0 && (
            <div className="mt-6 text-xs text-muted-foreground border-t pt-4">
              <span className="font-semibold">Sample checkpoint codes for evaluation:</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {samples.map((s) => (
                  <button
                    key={s._id}
                    className="rounded bg-muted hover:bg-primary/10 border px-2 py-1 font-mono transition-colors text-left"
                    onClick={() => {
                      setQ(s.matricNumber);
                      toast.info(`Loaded sample ${s.fullName}`);
                    }}
                  >
                    {s.matricNumber} ({s.fullName})
                  </button>
                ))}
              </div>
            </div>
          )}
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

export default Verify;
