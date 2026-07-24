import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/svis/AppSidebar";
import { AppHeader } from "@/components/svis/AppHeader";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Restoring session…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Let useEffect handle navigation redirect
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
          <AppHeader />
          <motion.main
            key={typeof window !== "undefined" ? window.location.pathname : ""}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex-1 p-6 min-w-0 overflow-x-hidden"
          >
            <Outlet />
          </motion.main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
export default AppLayout;
