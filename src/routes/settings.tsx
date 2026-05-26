import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { settingsService } from "@/lib/services";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: () => (
    <AppLayout>
      <Settings />
    </AppLayout>
  ),
});

function Settings() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const nav = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await settingsService.get();
        if (settings) {
          setCompany(settings);
        } else {
          setCompany(settingsService.getDefaultSettings());
        }
      } catch (error: any) {
        toast.error(error.message);
        setCompany(settingsService.getDefaultSettings());
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const saveCompany = async () => {
    if (!company) return;
    setSaving(true);
    try {
      const payload = {
        ...company,
        updated_at: new Date().toISOString(),
      };
      
      if (company.id) {
        await settingsService.update(company.id, payload);
      } else {
        const created = await settingsService.create(payload);
        setCompany((prev: any) => ({ ...prev, id: created.id }));
      }
      toast.success("Settings saved");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground text-sm">Loading…</div>;
  }

  if (!company) {
    return <div className="text-muted-foreground text-sm">Loading…</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your console preferences.</p>
      </div>
      <Tabs defaultValue="company">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="prefs">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Agency name</Label>
                <Input
                  value={company.agency_name}
                  onChange={(e) => setCompany({ ...company, agency_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact email</Label>
                <Input
                  value={company.contact_email ?? ""}
                  onChange={(e) => setCompany({ ...company, contact_email: e.target.value })}
                />
              </div>
              <div>
                <Label>Zalo phone</Label>
                <Input
                  value={company.zalo ?? ""}
                  onChange={(e) => setCompany({ ...company, zalo: e.target.value })}
                />
              </div>
              <div>
                <Label>Default currency</Label>
                <Select
                  value={company.currency}
                  onValueChange={(v) => setCompany({ ...company, currency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["VND", "USD", "EUR"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Default language</Label>
                <Select
                  value={company.language}
                  onValueChange={(v) => setCompany({ ...company, language: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={company.address ?? ""}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={saveCompany}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div>
              <Label>Email</Label>
              <div className="mt-1 text-sm">{user?.email}</div>
            </div>
            <div>
              <Label>User ID</Label>
              <div className="mt-1 text-xs text-muted-foreground font-mono break-all">
                {user?.id}
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={async () => {
                await signOut();
                nav({ to: "/login" });
              }}
            >
              Logout
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">New order notifications</div>
                <div className="text-xs text-muted-foreground">
                  Get notified when a new order is created.
                </div>
              </div>
              <Switch
                checked={!!company.notify_new_order}
                onCheckedChange={(v) => setCompany({ ...company, notify_new_order: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Payment notifications</div>
                <div className="text-xs text-muted-foreground">
                  Alerts when payment status changes.
                </div>
              </div>
              <Switch
                checked={!!company.notify_payment}
                onCheckedChange={(v) => setCompany({ ...company, notify_payment: v })}
              />
            </div>
            <Button
              onClick={saveCompany}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="prefs">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark theme</div>
                <div className="text-xs text-muted-foreground">Toggle dark or light mode.</div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
