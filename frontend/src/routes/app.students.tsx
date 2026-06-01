import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableBody as TBody } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusPill } from "@/components/svis/VerificationBadge";
import { Plus, Upload, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Loader2, Trash2, Edit, QrCode } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { studentApi, StudentProfile } from "../api/student.api";
import { qrApi } from "../api/qr.api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/students")({
  validateSearch: (search: Record<string, unknown>) => ({
    register: (search.register as string) || undefined,
  }),
  head: () => ({ meta: [{ title: "Students · SVIS" }] }),
  component: Page,
});

function Page() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { register: registerParam } = Route.useSearch();
  const [q, setQ] = useState("");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);

  // Form Fields
  const [matricNumber, setMatricNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState<"100" | "200" | "300" | "400" | "500">("100");
  const [academicSession, setAcademicSession] = useState("2025/2026");
  const [status, setStatus] = useState<"active" | "suspended" | "graduated" | "pending">("active");

  // Fetch Students list
  const { data: studentsRes, isLoading: loadingStudents } = useQuery({
    queryKey: ["students", q, facultyFilter, page],
    queryFn: () =>
      studentApi.getStudents({
        page,
        limit: pageSize,
        search: q || undefined,
        faculty: facultyFilter !== "all" ? facultyFilter : undefined,
      }),
  });

  // Fetch Metadata
  const { data: facultiesRes } = useQuery({
    queryKey: ["faculties"],
    queryFn: studentApi.getFaculties,
  });

  const { data: departmentsRes } = useQuery({
    queryKey: ["departments"],
    queryFn: studentApi.getDepartments,
  });

  const faculties = facultiesRes?.data || [];
  const departments = departmentsRes?.data || [];

  // Filter departments in form by selected faculty
  const filteredDepartmentsInForm = departments.filter((d) => !faculty || d.faculty === faculty);

  // Mutations
  const createMutation = useMutation({
    mutationFn: studentApi.createStudent,
    onSuccess: () => {
      toast.success("Student profile created successfully");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create student profile");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => studentApi.updateStudent(id, payload),
    onSuccess: () => {
      toast.success("Student profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update student profile");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: studentApi.deleteStudent,
    onSuccess: () => {
      toast.success("Student profile deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete student profile");
    },
  });

  const rotateQRMutation = useMutation({
    mutationFn: qrApi.regenerateQR,
    onSuccess: () => {
      toast.success("Student cryptographic identity rotated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to rotate cryptographic card");
    },
  });

  const openCreateDialog = () => {
    setEditingStudent(null);
    setMatricNumber("");
    setFullName("");
    setEmail("");
    setPhone("");
    setDob("");
    setAddress("");
    setFaculty("");
    setDepartment("");
    setLevel("100");
    setAcademicSession("2025/2026");
    setStatus("active");
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (registerParam === "true") {
      openCreateDialog();
      // Clear query params to prevent re-opening on refresh
      navigate({ search: {} });
    }
  }, [registerParam]);

  const openEditDialog = (s: StudentProfile) => {
    setEditingStudent(s);
    setMatricNumber(s.matricNumber);
    setFullName(s.fullName);
    setEmail(s.email);
    setPhone(s.phone);
    // Format dob to YYYY-MM-DD for standard input date value
    const dobString = s.dob ? new Date(s.dob).toISOString().split("T")[0] : "";
    setDob(dobString);
    setAddress(s.address);
    setFaculty(typeof s.faculty === "object" ? s.faculty._id : s.faculty);
    setDepartment(typeof s.department === "object" ? s.department._id : s.department);
    setLevel(s.level);
    setAcademicSession(s.academicSession);
    setStatus(s.status);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faculty || !department) {
      toast.error("Please select a valid Faculty and Department association");
      return;
    }
    const payload = {
      matricNumber,
      fullName,
      email,
      phone,
      dob,
      address,
      faculty,
      department,
      level,
      academicSession,
      status,
    };

    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const studentsList = studentsRes?.data?.results || [];
  const totalResults = studentsRes?.data?.totalResults || 0;
  const totalPages = studentsRes?.data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Student records</h1>
          <p className="text-sm text-muted-foreground">Manage enrollment data across faculties and departments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Bulk import</Button>
          <Button onClick={openCreateDialog}><Plus className="mr-2 h-4 w-4" />Add student</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or matric…"
                className="pl-9"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={facultyFilter}
              onValueChange={(v) => {
                setFacultyFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All faculties</SelectItem>
                {faculties.map((f) => (
                  <SelectItem key={f._id} value={f._id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingStudents ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
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
                {studentsList.map((s) => {
                  const facultyName = typeof s.faculty === "object" ? s.faculty.name : "Unknown Faculty";
                  const deptName = typeof s.department === "object" ? s.department.name : "Unknown Department";
                  return (
                    <TableRow key={s._id}>
                      <TableCell>
                        <div className="h-8 w-8 overflow-hidden rounded-full border bg-muted">
                          {s.photo ? (
                            <img src={s.photo} alt={s.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-medium text-xs">
                              {s.fullName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link to="/app/student/$id" params={{ id: s._id }} className="hover:underline text-primary">
                          {s.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.matricNumber}</TableCell>
                      <TableCell>{deptName}</TableCell>
                      <TableCell className="text-muted-foreground">{facultyName}</TableCell>
                      <TableCell>{s.level}L</TableCell>
                      <TableCell>
                        <StatusPill status={s.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to="/app/student/$id" params={{ id: s._id }}>View profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(s)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit student
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => rotateQRMutation.mutate(s._id)}>
                              <QrCode className="mr-2 h-4 w-4" />
                              Rotate QR
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${s.fullName}?`)) {
                                  deleteMutation.mutate(s._id);
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {studentsList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      No student records found matching query parameters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-4">
            <span className="text-xs text-muted-foreground">
              Showing {studentsList.length} of {totalResults} students
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

      {/* Add / Edit Student Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Edit Student Profile" : "Add Student Record"}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="matricNumber">Matric Number</Label>
                <Input
                  id="matricNumber"
                  required
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  placeholder="e.g. SCI/19/0001"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@student.edu"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Profile Status</Label>
                <Select
                  value={status}
                  onValueChange={(v: any) => setStatus(v)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="faculty">Faculty</Label>
                <Select
                  value={faculty}
                  onValueChange={(v) => {
                    setFaculty(v);
                    setDepartment("");
                  }}
                >
                  <SelectTrigger id="faculty">
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f._id} value={f._id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={department}
                  onValueChange={(v) => setDepartment(v)}
                  disabled={!faculty}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder={faculty ? "Select department" : "Choose faculty first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDepartmentsInForm.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={level}
                  onValueChange={(v: any) => setLevel(v)}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="academicSession">Academic Session</Label>
                <Input
                  id="academicSession"
                  required
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                  placeholder="e.g. 2025/2026"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="address">Residential Address</Label>
                <Input
                  id="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, City, State"
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
