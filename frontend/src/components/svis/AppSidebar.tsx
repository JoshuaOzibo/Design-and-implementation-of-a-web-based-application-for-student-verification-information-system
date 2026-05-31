import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShieldCheck, Users, QrCode, FileText, Settings,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "./Logo";

const main = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Verify Student", url: "/app/verify", icon: ShieldCheck },
  { title: "Students", url: "/app/students", icon: Users },
  { title: "QR Management", url: "/app/qr", icon: QrCode },
];
const ops = [
  { title: "Verification Logs", url: "/app/logs", icon: FileText },
];
const sys = [{ title: "Settings", url: "/app/settings", icon: Settings }];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const renderItems = (items: typeof main) =>
    items.map((it) => {
      const active = path === it.url || path.startsWith(it.url + "/");
      return (
        <SidebarMenuItem key={it.url}>
          <SidebarMenuButton asChild isActive={active}>
            <Link to={it.url} className="flex items-center gap-2.5">
              <it.icon className="h-4 w-4" />
              <span>{it.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(main)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(ops)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(sys)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="text-[11px] text-muted-foreground">
          <div className="font-medium text-foreground">University ICT</div>
          v1.0 · Secure Session
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
