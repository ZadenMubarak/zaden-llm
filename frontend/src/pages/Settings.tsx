import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Palette,
  MessageSquare,
  Lock,
  Database,
  Save,
} from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: "auto",
    fontSize: "medium",
    emailNotifications: true,
    messageNotifications: true,
    soundEnabled: true,
    autoSave: true,
    dataCollection: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("appSettings", JSON.stringify(settings));
      setIsSaving(false);
    }, 800);
  };

  return (
    <Layout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Customize your mzansi gpt experience
            </p>
          </div>

          {/* Appearance Settings */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Appearance</h2>
            </div>
            <Separator className="mb-6" />

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="theme" className="text-sm font-medium">
                  Theme
                </Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) =>
                    handleSettingChange("theme", value)
                  }
                >
                  <SelectTrigger id="theme" className="w-full rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose how mzansi gpt looks on your device
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="fontSize" className="text-sm font-medium">
                  Font Size
                </Label>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value) =>
                    handleSettingChange("fontSize", value)
                  }
                >
                  <SelectTrigger id="fontSize" className="w-full rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Adjust the text size for better readability
                </p>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>
            <Separator className="mb-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(value) =>
                    handleSettingChange("emailNotifications", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Message Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified about new messages
                  </p>
                </div>
                <Switch
                  checked={settings.messageNotifications}
                  onCheckedChange={(value) =>
                    handleSettingChange("messageNotifications", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Sound Effects</p>
                  <p className="text-xs text-muted-foreground">
                    Play sounds for notifications
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(value) =>
                    handleSettingChange("soundEnabled", value)
                  }
                />
              </div>
            </div>
          </Card>

          {/* Chat Settings */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Chat Behavior</h2>
            </div>
            <Separator className="mb-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Auto-Save Conversations</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically save your chats
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(value) =>
                    handleSettingChange("autoSave", value)
                  }
                />
              </div>
            </div>
          </Card>

          {/* Privacy & Data Settings */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Privacy & Data</h2>
            </div>
            <Separator className="mb-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    Improve mzansi gpt with Usage Data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Help us improve by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  checked={settings.dataCollection}
                  onCheckedChange={(value) =>
                    handleSettingChange("dataCollection", value)
                  }
                />
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Data Management</h2>
            </div>
            <Separator className="mb-6" />

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg"
                disabled
              >
                Download Your Data (Coming Soon)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive rounded-lg"
                disabled
              >
                Delete All Data (Coming Soon)
              </Button>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="gap-2 rounded-lg gradient-primary text-white"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
