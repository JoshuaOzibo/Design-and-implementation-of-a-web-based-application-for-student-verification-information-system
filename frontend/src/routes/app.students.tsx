import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusPill } from "@/components/svis/VerificationBadge";
import { students } from "@/lib/mock-data";
import { Plus, Upload, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/students")({
  head: () => ({ meta: [{ title: "Students · SVIS" }] }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [faculty, setFaculty] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchQ = !q || s.fullName.toLowerCase().includes(q.toLowerCase()) || s.matric.toLowerCase().includes(q.toLowerCase());
      const matchF = faculty === "all" || s.faculty === faculty;
      return matchQ && matchF;
    });
  }, [q, faculty]);

  const slice = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Student records</h1>
          <p className="text-sm text-muted-foreground">Manage enrollment data across faculties and departments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Bulk import</Button>
          <Button><Plus className="mr-2 h-4 w-4" />Add student</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or matric…" className="pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
            </div>
            <Select value={faculty} onValueChange={(v) => { setFaculty(v); setPage(0); }}>
              <SelectTrigger className="w-48"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Faculty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All faculties</SelectItem>
                {[...new Set(students.map((s) => s.faculty))].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Matric</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><img src={s.photo} alt={s.fullName} className="h-8 w-8 rounded-full border border-border object-cover" /></TableCell>
                  <TableCell>
                    <Link to="/app/student/$id" params={{ id: s.id }} className="font-medium hover:text-primary">{s.fullName}</Link>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.matric}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell className="text-muted-foreground">{s.faculty}</TableCell>
                  <TableCell>{s.level}L</TableCell>
                  <TableCell><StatusPill status={s.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link to="/app/student/$id" params={{ id: s.id }}>View profile</Link></DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Regenerate QR</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {slice.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No students match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <div>Showing {slice.length} of {filtered.length}</div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="px-2">Page {page + 1} / {totalPages}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
