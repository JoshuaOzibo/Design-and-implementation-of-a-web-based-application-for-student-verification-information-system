import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings · SVIS" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Institutional configuration, accounts, and platform preferences.</p>
      </div>

      <Tabs defaultValue="institution">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="institution">Institution</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="institution" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Institution information</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Institution name" defaultValue="University of Excellence" />
              <Field label="Abbreviation" defaultValue="UoE" />
              <Field label="ICT contact email" defaultValue="ict@university.edu" />
              <Field label="Support phone" defaultValue="+234 800 000 0000" />
              <Field label="Registrar office" defaultValue="Senate Building, Room 102" />
              <Field label="Academic session" defaultValue="2024/2025" />
            </CardContent>
            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button variant="ghost">Cancel</Button>
              <Button onClick={() => toast.success("Institution details saved")}>Save changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">User management</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {[
                { name: "Dr. Anita Bello", role: "Examination Officer" },
                { name: "Mr. John Okeke", role: "Library Staff" },
                { name: "Mrs. Sade Adelaja", role: "Hostel Administrator" },
                { name: "Prof. Hassan Bala", role: "Administrator" },
                { name: "Ms. Joy Eze", role: "Security Personnel" },
              ].map((u) => (
                <div key={u.name} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs">{u.role}</div>
                  </div>
                  <Button variant="ghost" size="sm">Manage</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Roles & permissions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {["Administrator", "Examination Officer", "Library Staff", "Hostel Administrator", "Security Personnel", "Faculty Staff"].map((r) => (
                <div key={r} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div className="text-sm font-medium">{r}</div>
                  <Button variant="outline" size="sm">Edit permissions</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Notification preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Toggle label="Email on failed verification" defaultChecked />
              <Toggle label="Daily verification digest" defaultChecked />
              <Toggle label="Alert on suspicious activity" defaultChecked />
              <Toggle label="Weekly faculty report" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">System preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Toggle label="Enable QR offline cache (15 min)" defaultChecked />
              <Toggle label="Show staff photos in verification result" />
              <Toggle label="Show department code on ID card" defaultChecked />
              <Separator />
              <Field label="Default verification location" defaultValue="Main Library" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Security settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Toggle label="Require multi-factor authentication" defaultChecked />
              <Toggle label="Bind sessions to device fingerprint" defaultChecked />
              <Toggle label="Auto sign-out after 15 minutes of inactivity" defaultChecked />
              <Field label="Password rotation policy (days)" defaultValue="90" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" defaultValue="Dr. Anita Bello" />
              <Field label="Staff ID" defaultValue="ICT/2019/0421" />
              <Field label="Email" defaultValue="anita.bello@university.edu" />
              <Field label="Department" defaultValue="Examinations" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="mt-1.5" defaultValue={defaultValue} />
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <div className="text-sm">{label}</div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
