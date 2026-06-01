import { createFileRoute, Link } from "@tanstack/react-router";
import { StatCard } from "@/components/svis/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, Clock, FileWarning, ScanLine, Search, QrCode, ArrowUpRight, Loader2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { VerificationBadge } from "@/components/svis/VerificationBadge";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics.api";
import { logApi } from "../api/log.api";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · SVIS" }] }),
  component: Dashboard,
});

function Dashboard() {
  // Query 1: Overview Analytics
  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: analyticsApi.getAnalytics,
  });

  // Query 2: Recent Logs (limit 6)
  const { data: logsRes, isLoading: logsLoading } = useQuery({
    queryKey: ["recent-logs"],
    queryFn: () => logApi.getLogs({ limit: 6 }),
  });

  if (analyticsLoading || logsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard analytics…</p>
        </div>
      </div>
    );
  }

  const summary = analyticsRes?.data?.summary;
  const rawTrends = analyticsRes?.data?.trends || [];
  const rawMethods = analyticsRes?.data?.byMethod || [];
  const recentLogs = logsRes?.data?.results || [];

  // Format Trends: Map YYYY-MM-DD to day of week / short format
  const trendData = rawTrends.map((t) => {
    let dayLabel = t._id;
    try {
      const date = new Date(t._id);
      dayLabel = date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
    } catch (e) {
      // Fallback to raw ID
    }
    return {
      day: dayLabel,
      verified: t.verified,
      failed: t.failed,
    };
  });

  // Format Methods for Bar Chart
  const methodData = rawMethods.map((m) => ({
    name: m._id || "Unknown",
    value: m.value,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Verification overview</h1>
          <p className="text-sm text-muted-foreground">Welcome back. Here's what's happening across the institution today.</p>
        </div>
        <Button asChild><Link to="/app/verify"><ShieldCheck className="mr-2 h-4 w-4" />Verify a student</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={summary?.totalStudents?.toLocaleString() || "0"}
          delta="Enrolled in campus registry"
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Verified Today"
          value={summary?.verificationsToday?.toLocaleString() || "0"}
          delta="Checkpoints processed today"
          icon={ShieldCheck}
          tone="success"
        />
        <StatCard
          label="Active Students"
          value={summary?.activeStudents?.toLocaleString() || "0"}
          delta="Cleared and dynamic cards active"
          icon={ScanLine}
          tone="accent"
        />
        <StatCard
          label="Pending Records"
          value={summary?.pendingStudents?.toLocaleString() || "0"}
          delta="Awaiting identity uploads"
          icon={FileWarning}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Daily verification trend</CardTitle>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="verified" stroke="var(--color-primary)" strokeWidth={2} fill="url(#vGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No verification timeline trends recorded.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Verification by method</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              {methodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={methodData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="value" name="Verifications" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No methods analyzed.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent verifications</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/app/logs">View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Matric</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((l) => {
                  let formattedTime = "";
                  try {
                    formattedTime = new Date(l.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch (e) {
                    formattedTime = "unknown";
                  }
                  return (
                    <TableRow key={l._id}>
                      <TableCell className="font-medium">{l.student?.fullName || "Unregistered ID"}</TableCell>
                      <TableCell className="text-muted-foreground">{l.matricNumber}</TableCell>
                      <TableCell>{l.type}</TableCell>
                      <TableCell className="text-muted-foreground">{l.location}</TableCell>
                      <TableCell className="text-muted-foreground">{formattedTime}</TableCell>
                      <TableCell className="text-right">
                        <VerificationBadge status={l.status === "verified" ? "verified" : "invalid"} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {recentLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      No student checkpoint verifications recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
          <CardContent className="grid gap-2.5">
            <QuickAction to="/app/verify" icon={ShieldCheck} label="Verify Student" />
            <QuickAction to="/app/students" icon={Search} label="Search Student" />
            <QuickAction to="/app/qr" icon={QrCode} label="Generate Student QR" />
            <QuickAction to="/app/students" icon={Users} label="Manage Records" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Button asChild variant="outline" className="h-11 justify-start">
      <Link to={to}><Icon className="mr-2 h-4 w-4 text-primary" />{label}</Link>
    </Button>
  );
}
export default Dashboard;
