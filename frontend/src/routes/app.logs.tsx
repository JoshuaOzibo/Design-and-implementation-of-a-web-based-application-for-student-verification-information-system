import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VerificationBadge } from "@/components/svis/VerificationBadge";
import { logs } from "@/lib/mock-data";
import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/logs")({
  head: () => ({ meta: [{ title: "Verification Logs · SVIS" }] }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState("week");
  const filtered = useMemo(() =>
    logs.filter((l) => !q || l.studentName.toLowerCase().includes(q.toLowerCase()) || l.matric.toLowerCase().includes(q.toLowerCase())),
  [q]);
  void range;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Verification logs</h1>
          <p className="text-sm text-muted-foreground">Complete, tamper-evident audit trail of every verification.</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by student or matric…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="custom">Custom range…</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Matric</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-muted-foreground">{l.date}</TableCell>
                  <TableCell className="text-muted-foreground">{l.time}</TableCell>
                  <TableCell>{l.staffName}</TableCell>
                  <TableCell>{l.type}</TableCell>
                  <TableCell className="font-medium">{l.studentName}</TableCell>
                  <TableCell className="text-muted-foreground">{l.matric}</TableCell>
                  <TableCell className="text-muted-foreground">{l.location}</TableCell>
                  <TableCell className="text-right">
                    <VerificationBadge status={l.status === "verified" ? "verified" : "invalid"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
