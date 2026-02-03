import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useConversations } from "@/lib/conversations-context";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, MoreVertical, Calendar, Mail } from "lucide-react";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { conversations } = useConversations();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      updateProfile({
        name: formData.name,
        email: formData.email,
      });
      setIsEditing(false);
      setIsSaving(false);
    }, 800);
  };

  const totalMessages = conversations.reduce(
    (sum, conv) => sum + conv.messages.length,
    0,
  );
  const totalConversations = conversations.length;

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Avatar and Basic Info */}
            <Card className="md:col-span-1 p-6 flex flex-col items-center text-center">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="h-24 w-24 rounded-full mb-4 border-4 border-primary/20"
              />
              <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
              <p className="text-muted-foreground text-sm mb-4">{user?.email}</p>
              <Button
                variant="outline"
                className="w-full rounded-lg"
                disabled
              >
                Change Avatar (Coming Soon)
              </Button>
            </Card>

            {/* Right Column - Stats */}
            <Card className="md:col-span-2 p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">Total Messages</p>
                  </div>
                  <p className="text-3xl font-bold">{totalMessages}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">Conversations</p>
                  </div>
                  <p className="text-3xl font-bold">{totalConversations}</p>
                </div>

                <div className="space-y-2 col-span-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <p className="text-sm font-medium">Member Since</p>
                  </div>
                  <p className="text-lg font-semibold">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Account Settings */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Account Information</h3>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-lg"
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="rounded-lg bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                    className="rounded-lg bg-muted/50"
                  />
                  <span className="text-xs text-green-600 font-medium px-3 py-2 bg-green-50 rounded-lg whitespace-nowrap">
                    ✓ Verified
                  </span>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="gradient-primary text-white rounded-lg"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Conversations */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Recent Conversations</h3>

            {conversations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No conversations yet. Start a new chat to see them here!
              </p>
            ) : (
              <div className="space-y-4">
                {conversations.slice(0, 5).map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.messages.length} messages •{" "}
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>View Details</DropdownMenuItem>
                        <DropdownMenuItem disabled>Export Chat</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
