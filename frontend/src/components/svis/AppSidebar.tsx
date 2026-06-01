import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShieldCheck, Users, QrCode, FileText, Settings, UserPlus,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "./Logo";

interface SidebarItem {
  title: string;
  url: string;
  search?: Record<string, string>;
  icon: any;
}

const main: SidebarItem[] = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Verify Student", url: "/app/verify", icon: ShieldCheck },
  { title: "Students", url: "/app/students", icon: Users },
  { title: "Register Student", url: "/app/students", search: { register: "true" }, icon: UserPlus },
  { title: "QR Management", url: "/app/qr", icon: QrCode },
];
const ops: SidebarItem[] = [
  { title: "Verification Logs", url: "/app/logs", icon: FileText },
];
const sys: SidebarItem[] = [{ title: "Settings", url: "/app/settings", icon: Settings }];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const renderItems = (items: SidebarItem[]) =>
    items.map((it) => {
      // Check if it's the exact match
      const hasRegisterSearch = it.search?.register === "true";
      const isRegisterActive = hasRegisterSearch && window.location.search.includes("register=true");
      
      const active = hasRegisterSearch 
        ? (path === it.url && isRegisterActive)
        : (path === it.url && !window.location.search.includes("register=true")) || (path.startsWith(it.url + "/") && !hasRegisterSearch);
      
      return (
        <SidebarMenuItem key={it.title}>
          <SidebarMenuButton asChild isActive={active}>
            <Link to={it.url} search={it.search as any} className="flex items-center gap-2.5">
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
