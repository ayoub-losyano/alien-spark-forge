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
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: () => <AppLayout><Settings /></AppLayout> });

type Company = {
  agency_name: string; currency: string; language: string; contact_email: string; zalo: string; address: string;
};
const COMPANY_DEFAULT: Company = {
  agency_name: "AlienSpark VN", currency: "VND", language: "English", contact_email: "", zalo: "", address: "",
};

function Settings() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [company, setCompany] = useState<Company>(COMPANY_DEFAULT);
  const [theme, setTheme] = useState(true);
  const [lang, setLang] = useState("EN");

  useEffect(() => {
    try {
      const c = localStorage.getItem("ops.company");
      if (c) setCompany({ ...COMPANY_DEFAULT, ...JSON.parse(c) });
      const l = localStorage.getItem("ops.lang");
      if (l) setLang(l);
    } catch {}
  }, []);

  const saveCompany = () => {
    localStorage.setItem("ops.company", JSON.stringify(company));
    toast.success("Company settings saved");
  };
  const savePrefs = () => {
    localStorage.setItem("ops.lang", lang);
    toast.success("Preferences saved");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your console preferences.</p>
      </div>
      <Tabs defaultValue="company">
        <TabsList className="bg-white/5">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="prefs">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Agency name</Label><Input value={company.agency_name} onChange={(e) => setCompany({ ...company, agency_name: e.target.value })} /></div>
              <div><Label>Contact email</Label><Input value={company.contact_email} onChange={(e) => setCompany({ ...company, contact_email: e.target.value })} /></div>
              <div><Label>Zalo phone</Label><Input value={company.zalo} onChange={(e) => setCompany({ ...company, zalo: e.target.value })} /></div>
              <div><Label>Default currency</Label>
                <Select value={company.currency} onValueChange={(v) => setCompany({ ...company, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["VND","USD","EUR"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Default language</Label>
                <Select value={company.language} onValueChange={(v) => setCompany({ ...company, language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Vietnamese">Vietnamese</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><Label>Address</Label><Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></div>
            </div>
            <Button onClick={saveCompany} className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
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
              <div className="mt-1 text-xs text-muted-foreground font-mono break-all">{user?.id}</div>
            </div>
            <Button variant="destructive" onClick={async () => { await signOut(); nav({ to: "/login" }); }}>Logout</Button>
          </div>
        </TabsContent>

        <TabsContent value="prefs">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark theme</div>
                <div className="text-xs text-muted-foreground">Console uses dark futuristic theme by default.</div>
              </div>
              <Switch checked={theme} onCheckedChange={setTheme} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Language</div>
                <div className="text-xs text-muted-foreground">UI language preference.</div>
              </div>
              <Select value={lang} onValueChange={setLang}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="EN">English</SelectItem><SelectItem value="VI">Tiếng Việt</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={savePrefs} className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}