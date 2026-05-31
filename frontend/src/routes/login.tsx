import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/svis/Logo";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Staff Login · SVIS" }] }),
  component: Login,
});

const schema = z.object({
  staffId: z.string().min(2, "Enter your staff ID"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  remember: z.boolean().optional(),
});
type Values = z.infer<typeof schema>;

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { staffId: "", email: "", password: "", remember: true },
  });

  const onSubmit = async (v: Values) => {
    try {
      const res = await authApi.login({
        staffId: v.staffId,
        email: v.email,
        password: v.password,
      });

      if (res.success) {
        login(res.data.accessToken, res.data.user);
        toast.success("Signed in securely");
        navigate({ to: "/app/dashboard" });
      } else {
        toast.error(res.message || "Failed to sign in");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication error occurred");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link to="/" className="text-primary-foreground"><Logo /></Link>
        <div className="max-w-md">
          <ShieldCheck className="mb-5 h-10 w-10" />
          <h2 className="text-3xl font-semibold leading-tight">Verified identity for a connected campus.</h2>
          <p className="mt-3 text-primary-foreground/80">
            SVIS gives every authorised staff member a single, auditable workspace for student identity verification across faculties, hostels and examination halls.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/70">
          Authorised use only. Activity on this system is monitored and logged.
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <Card className="border-border/80">
            <CardContent className="p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Staff sign in</h1>
                <p className="mt-1 text-sm text-muted-foreground">Use your institutional credentials to continue.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="staffId">Staff ID</Label>
                  <Input id="staffId" placeholder="e.g. ICT/2019/0421" className="mt-1.5" {...register("staffId")} />
                  {errors.staffId && <p className="mt-1 text-xs text-destructive">{errors.staffId.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Institutional email</Label>
                  <Input id="email" type="email" placeholder="name@university.edu" className="mt-1.5" {...register("email")} />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                  </div>
                  <Input id="password" type="password" className="mt-1.5" {...register("password")} />
                  {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox {...register("remember")} defaultChecked /> Remember this device
                </label>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in…" : "Sign in securely"}
                </Button>
                <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Your session is encrypted and bound to this device. Unauthorised access is prohibited under university ICT policy.
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
