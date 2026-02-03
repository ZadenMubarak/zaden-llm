import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useConversations } from "@/lib/conversations-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Menu,
  X,
  Plus,
  Trash2,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Edit2,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  onEditTitle?: () => void;
}

export default function Layout({ children, onEditTitle }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    conversations,
    currentConversation,
    selectConversation,
    deleteConversation,
    createConversation,
  } = useConversations();

  const handleNewChat = () => {
    createConversation();
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleDeleteConversation = (
    e: React.MouseEvent,
    conversationId: string,
  ) => {
    e.stopPropagation();
    deleteConversation(conversationId);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background relative">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static md:w-64 md:translate-x-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col overflow-hidden h-screen md:h-auto w-64 z-50 md:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <div className="gradient-primary rounded-lg p-2">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-sidebar-foreground">mzansi gpt</span>
          </Link>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-sidebar-border">
          <Button
            onClick={handleNewChat}
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 justify-start gap-2 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 text-xs font-semibold text-sidebar-foreground/60 uppercase">
            Conversations
          </div>
          <ScrollArea className="flex-1">
            <div className="px-2 space-y-2">
              {conversations.length === 0 ? (
                <div className="px-2 py-8 text-center text-sm text-sidebar-foreground/50">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => selectConversation(conversation.id)}
                    className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                      currentConversation?.id === conversation.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) =>
                          handleDeleteConversation(e, conversation.id)
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-sidebar-accent transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="h-9 w-9 rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-sidebar-foreground">
                      {user?.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-border bg-card h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <h1 className="text-lg font-semibold">
              {currentConversation?.title || "New Chat"}
            </h1>
          </div>
          {currentConversation && onEditTitle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditTitle}
              className="hover:bg-muted"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
