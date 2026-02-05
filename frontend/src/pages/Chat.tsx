import { useState, useEffect, useRef } from "react";
import { useConversations } from "@/lib/conversations-context";
import { useAuth } from "@/lib/auth-context";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Zap, Lightbulb, BookOpen, Settings, Edit2, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const SUGGESTED_PROMPTS = [
  {
    icon: Zap,
    title: "Quick Analysis",
    description: "Analyze data or text quickly",
  },
  {
    icon: Lightbulb,
    title: "Creative Ideas",
    description: "Generate creative solutions",
  },
  {
    icon: BookOpen,
    title: "Learn Something",
    description: "Explain complex topics",
  },
  {
    icon: Settings,
    title: "Technical Help",
    description: "Get coding assistance",
  },
];

export default function Chat() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { currentConversation, addMessage, createConversation, updateConversationTitle } =
    useConversations();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter for new line, Enter alone to send
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Allow default behavior (new line)
        return;
      } else {
        // Send message
        e.preventDefault();
        handleSendMessage(e as any);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create a conversation if needed
    if (!currentConversation) {
      createConversation(input.substring(0, 50));
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
      timestamp: Date.now(),
    };

    addMessage(currentConversation?.id || "", userMessage);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: `Thank you for your message! This is a simulated response. In a real application, this would be connected to an AI model like GPT-4. Your message was: "${input.substring(0, 100)}${input.length > 100 ? "..." : ""}"`,
        timestamp: Date.now(),
      };

      addMessage(currentConversation?.id || "", assistantMessage);
      setIsLoading(false);
    }, 1000);
  };

  const handleEditTitle = () => {
    if (currentConversation) {
      setEditTitle(currentConversation.title);
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = () => {
    if (currentConversation && editTitle.trim()) {
      updateConversationTitle(currentConversation.id, editTitle.trim());
      setIsEditingTitle(false);
    }
  };

  const showSuggestions = !currentConversation || currentConversation.messages.length === 0;

  return (
    <Layout onEditTitle={handleEditTitle}>
      <div className="flex flex-col h-full">
        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-8 h-full flex flex-col">
            {showSuggestions ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-12">
                {/* Header */}
                <div className="text-center space-y-2 mb-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Welcome to Mzansi GPT
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Hello {user?.name}! What would you like to discuss?
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {SUGGESTED_PROMPTS.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={index}
                        className="p-4 rounded-xl border border-border hover:border-primary bg-card hover:bg-card/80 transition-all hover:shadow-lg group text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">
                              {prompt.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {prompt.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-8">
                {currentConversation?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } animate-slide-up`}
                  >
                    <div
                      className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl ${
                        message.role === "user"
                          ? "user-message"
                          : "ai-message bg-muted"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-xs opacity-60 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start animate-slide-up">
                    <div className="ai-message px-4 py-3 rounded-2xl">
                      <div className="flex gap-2">
                        <div className="h-2 w-2 bg-foreground rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-foreground rounded-full animate-bounce delay-100" />
                        <div className="h-2 w-2 bg-foreground rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-card">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="no-scroll flex-1 rounded-2xl bg-muted border border-muted-foreground/30 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                disabled={isLoading}
                rows={1}
                style={{ minHeight: "44px", maxHeight: "200px" }}
                
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="gradient-primary text-white rounded-2xl px-6 hover:opacity-90 h-auto self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Free tier • Responses are simulated
            </p>
          </form>
        </div>

        {/* Edit Title Dialog */}
        <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Conversation Title</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter new title..."
                className="col-span-4"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingTitle(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="gradient-primary text-white"
                onClick={handleSaveTitle}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
