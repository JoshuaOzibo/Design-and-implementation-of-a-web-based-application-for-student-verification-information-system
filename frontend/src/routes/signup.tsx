import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/svis/Logo";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Staff Registration · SVIS" }] }),
  component: Signup,
});

const schema = z.object({
  staffId: z.string().min(2, "Staff ID must be at least 2 characters"),
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Enter a valid institutional email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Admin", "Verification Officer", "Librarian", "Security Officer"], {
    errorMap: () => ({ message: "Please select an authorized role" }),
  }),
});
type Values = z.infer<typeof schema>;

function Signup() {
  const navigate = useNavigate();

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { staffId: "", fullName: "", email: "", password: "", role: "Verification Officer" },
  });

  const onSubmit = async (v: Values) => {
    try {
      const res = await authApi.register({
        staffId: v.staffId,
        fullName: v.fullName,
        email: v.email,
        password: v.password,
        role: v.role,
      });

      if (res.success) {
        toast.success("Staff account registered successfully! Please sign in.");
        navigate({ to: "/login" });
      } else {
        toast.error(res.message || "Failed to register staff account");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Registration error occurred");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link to="/" className="text-primary-foreground">
          <Logo />
        </Link>
        <div className="max-w-md">
          <ShieldCheck className="mb-5 h-10 w-10" />
          <h2 className="text-3xl font-semibold leading-tight">Enrolling authorized agents securely.</h2>
          <p className="mt-3 text-primary-foreground/80">
            Create an institutional staff profile to acquire cryptographically signed verification access keys.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/70">
          Official staff use only. Unsigned signups are monitored for credential authenticity.
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Card className="border-border/80">
            <CardContent className="p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Staff registration</h1>
                <p className="mt-1 text-sm text-muted-foreground">Register your institutional officer account.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="e.g. Professor Jane Smith" className="mt-1.5" {...register("fullName")} />
                  {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="staffId">Staff ID</Label>
                  <Input id="staffId" placeholder="e.g. ICT/2026/001" className="mt-1.5" {...register("staffId")} />
                  {errors.staffId && <p className="mt-1 text-xs text-destructive">{errors.staffId.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Institutional Email</Label>
                  <Input id="email" type="email" placeholder="name@university.edu" className="mt-1.5" {...register("email")} />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="role">Security / Staff Role</Label>
                  <div className="mt-1.5">
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="role" className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Verification Officer">Verification Officer</SelectItem>
                            <SelectItem value="Librarian">Librarian</SelectItem>
                            <SelectItem value="Security Officer">Security Officer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Security Password</Label>
                  <Input id="password" type="password" className="mt-1.5" {...register("password")} />
                  {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Registering…" : "Register secure account"}
                </Button>
                <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Passwords are cryptographically hashed and salted. Profiles require active registry status to sign in.
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
