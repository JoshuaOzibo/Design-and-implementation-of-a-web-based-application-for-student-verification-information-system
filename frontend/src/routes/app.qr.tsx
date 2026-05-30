import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCode } from "@/components/svis/QRCode";
import { students } from "@/lib/mock-data";
import { Download, RotateCw, Printer, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/qr")({
  head: () => ({ meta: [{ title: "QR Management · SVIS" }] }),
  component: Page,
});

function Page() {
  const [selected, setSelected] = useState(students[0].id);
  const s = students.find((x) => x.id === selected)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">QR identity management</h1>
        <p className="text-sm text-muted-foreground">Generate, preview, and manage tamper-evident QR identities issued by the registry.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Generate QR</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select student</Label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {students.slice(0, 12).map((st) => <SelectItem key={st.id} value={st.id}>{st.fullName} — {st.matric}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Verification URL</Label>
              <Input className="mt-1.5" readOnly value={`https://svis.uni.edu/v/${s.matric}`} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button onClick={() => toast.success("QR generated")}><Eye className="mr-2 h-4 w-4" />Preview</Button>
              <Button variant="outline" onClick={() => toast.success("Download started")}><Download className="mr-2 h-4 w-4" />Download</Button>
              <Button variant="outline" onClick={() => toast.message("New QR issued")}><RotateCw className="mr-2 h-4 w-4" />Regenerate</Button>
              <Button variant="outline" onClick={() => toast.message("Sent to print queue")}><Printer className="mr-2 h-4 w-4" />Print ID</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-3"><CardTitle className="text-base">Student ID preview</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between bg-primary px-5 py-3 text-primary-foreground">
                <div>
                  <div className="text-[10px] uppercase tracking-widest opacity-80">University of Excellence</div>
                  <div className="text-sm font-semibold">Official Student Identification</div>
                </div>
                <div className="text-[10px] opacity-90">Session {s.session}</div>
              </div>
              <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                <img src={s.photo} alt={s.fullName} className="h-32 w-32 rounded-md border border-border object-cover" />
                <div>
                  <div className="text-lg font-semibold">{s.fullName}</div>
                  <div className="text-xs text-muted-foreground">{s.matric}</div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <Info label="Department" value={s.department} />
                    <Info label="Faculty" value={s.faculty} />
                    <Info label="Level" value={s.level + "L"} />
                    <Info label="Status" value={s.status} />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-md border border-border p-3">
                  <QRCode value={s.matric} size={140} />
                  <div className="text-[10px] text-muted-foreground">Scan to verify</div>
                </div>
              </div>
              <div className="border-t border-border bg-muted/30 px-5 py-2 text-[10px] text-muted-foreground">
                This card remains the property of the University. If found, please return to the ICT Directorate.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (<div><div className="text-muted-foreground">{label}</div><div className="font-medium capitalize">{value}</div></div>);
}
