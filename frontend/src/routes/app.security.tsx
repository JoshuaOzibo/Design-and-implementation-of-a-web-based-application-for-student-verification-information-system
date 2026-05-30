import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/svis/StatCard";
import { ShieldAlert, ShieldCheck, ShieldX, Activity } from "lucide-react";
import { verificationTrend } from "@/lib/mock-data";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

export const Route = createFileRoute("/app/security")({
  head: () => ({ meta: [{ title: "Security · SVIS" }] }),
  component: Page,
});

const events = [
  { t: "08:42", title: "Multiple failed verifications", detail: "5 failures from Hostel Gate 2 in 3 minutes", level: "warn" },
  { t: "07:51", title: "QR replay detected", detail: "Same QR scanned at two locations within 60s", level: "danger" },
  { t: "06:30", title: "New staff session opened", detail: "Prof. Hassan Bala from ICT/Workstation 14", level: "info" },
  { t: "Yesterday", title: "Bulk export completed", detail: "Verification logs exported by Mrs. Sade Adelaja", level: "info" },
];

const levelStyles: Record<string, string> = {
  warn: "bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-primary/10 text-primary",
};

function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System security</h1>
        <p className="text-sm text-muted-foreground">Verification health, suspicious activity, and audit events.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Verification attempts" value="1,287" icon={Activity} tone="primary" />
        <StatCard label="Successful" value="1,213" icon={ShieldCheck} tone="success" />
        <StatCard label="Failed" value="74" icon={ShieldX} tone="warning" />
        <StatCard label="Suspicious" value="3" delta="Under review" icon={ShieldAlert} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Verification trends</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={verificationTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" fontSize={12} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="verified" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="failed" stroke="var(--color-destructive)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Recent security events</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {events.map((e, i) => (
              <div key={i} className="flex items-start gap-3 rounded-md border border-border p-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${levelStyles[e.level]}`}>
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-[11px] text-muted-foreground">{e.t}</div>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{e.detail}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
