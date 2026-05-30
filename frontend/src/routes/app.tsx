import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/svis/AppSidebar";
import { AppHeader } from "@/components/svis/AppHeader";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <AppHeader />
          <motion.main
            key={typeof window !== "undefined" ? window.location.pathname : ""}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex-1 p-6"
          >
            <Outlet />
          </motion.main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
