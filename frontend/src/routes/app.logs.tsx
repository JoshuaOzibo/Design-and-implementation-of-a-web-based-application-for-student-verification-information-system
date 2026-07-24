import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VerificationBadge } from "@/components/svis/VerificationBadge";
import { Download, Search, Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { logApi } from "../api/log.api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/logs")({
  head: () => ({ meta: [{ title: "Verification Logs · SVIS" }] }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState("week");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Query Logs with filters and pagination
  const { data: logsRes, isLoading: loadingLogs, isFetching: fetchingLogs } = useQuery({
    queryKey: ["logs", q, range, startDate, endDate, page],
    queryFn: () =>
      logApi.getLogs({
        page,
        limit: pageSize,
        search: q || undefined,
        range: range !== "all" ? range : undefined,
        startDate: range === "custom" && startDate ? startDate : undefined,
        endDate: range === "custom" && endDate ? endDate : undefined,
      }),
  });

  // Export CSV handler
  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await logApi.exportLogs({
        search: q || undefined,
        range: range !== "all" ? range : undefined,
        startDate: range === "custom" && startDate ? startDate : undefined,
        endDate: range === "custom" && endDate ? endDate : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `svis-verification-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV log export downloaded successfully");
    } catch (err) {
      toast.error("Failed to compile CSV export");
    } finally {
      setExporting(false);
    }
  };

  const logsList = logsRes?.data?.results || [];
  const totalResults = logsRes?.data?.totalResults || 0;
  const totalPages = logsRes?.data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Verification logs</h1>
          <p className="text-sm text-muted-foreground">Complete, tamper-evident audit trail of every checkpoint scan.</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student, matric, location, or officer..."
                className="pl-9"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={range}
                onValueChange={(v) => {
                  setRange(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All history</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="custom">Custom range…</SelectItem>
                </SelectContent>
              </Select>

              {range === "custom" && (
                <div className="flex items-center gap-2 border rounded-md p-1 bg-muted/20">
                  <Input
                    type="date"
                    className="h-8 border-0 bg-transparent py-0 text-xs w-28 focus-visible:ring-0"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    className="h-8 border-0 bg-transparent py-0 text-xs w-28 focus-visible:ring-0"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingLogs ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date / Time</TableHead>
                    <TableHead>Scanned By</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Matric Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsList.map((l) => {
                    let formattedDate = "";
                    let formattedTime = "";
                    try {
                      const dateObj = new Date(l.createdAt);
                      formattedDate = dateObj.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                      formattedTime = dateObj.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch (e) {
                      formattedDate = "Unknown Date";
                      formattedTime = "Unknown Time";
                    }

                    const staffName = l.staff ? l.staff.fullName : "System Agent";

                    return (
                      <TableRow key={l._id}>
                        <TableCell className="text-xs whitespace-nowrap min-w-[110px]">
                          <div className="font-medium text-foreground">{formattedDate}</div>
                          <div className="text-muted-foreground">{formattedTime}</div>
                        </TableCell>
                        <TableCell className="text-sm font-medium whitespace-nowrap">
                          {staffName}
                        </TableCell>
                        <TableCell className="text-xs font-mono whitespace-nowrap">{l.type}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">
                          {l.student ? (
                            <Link to="/app/student/$id" params={{ id: l.student._id }} className="hover:underline text-primary">
                              {l.student.fullName}
                            </Link>
                          ) : (
                            "Unregistered profile"
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">{l.matricNumber}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{l.location || "N/A"}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-1">
                            <VerificationBadge status={l.status === "verified" ? "verified" : "invalid"} />
                            {l.reason && (
                              <span className="text-[10px] text-destructive block max-w-[150px] truncate" title={l.reason}>
                                {l.reason}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {logsList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                        No verification logs found matching query parameters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-4">
            <span className="text-xs text-muted-foreground">
              Showing {logsList.length} of {totalResults} audit records
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
