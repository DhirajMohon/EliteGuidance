import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRequests } from "@/hooks/use-requests";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";

export default function MessagesPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialRequestId = searchParams.get("requestId");

  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    initialRequestId ? Number(initialRequestId) : null
  );

  const { user } = useAuth();
  const { data: requests, isLoading: isLoadingRequests } = useRequests();
  
  // Filter only accepted requests for chatting
  const chats = requests?.filter(r => r.status === 'accepted') || [];

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-3xl font-display font-bold text-primary mb-6">Messages</h1>
      
      <div className="flex flex-1 gap-6 overflow-hidden h-full border rounded-xl shadow-sm bg-white">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r flex flex-col bg-muted/10">
          <div className="p-4 border-b bg-white">
            <h2 className="font-semibold text-lg">Conversations</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoadingRequests ? (
              <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : chats.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground text-sm">
                No active conversations yet.
              </div>
            ) : (
              chats.map(req => {
                const partnerName = user?.role === 'student' ? req.mentor?.name : req.student?.name;
                const initials = partnerName?.substring(0, 2).toUpperCase();
                const isActive = selectedRequestId === req.id;

                return (
                  <div 
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={clsx(
                      "p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarFallback className={isActive ? "bg-primary-foreground text-primary" : ""}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{partnerName}</p>
                      <p className={clsx("text-xs truncate", isActive ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        Click to view chat
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedRequestId ? (
            <ChatWindow requestId={selectedRequestId} currentUserId={user!.id} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatWindow({ requestId, currentUserId }: { requestId: number; currentUserId: number }) {
  const { data: messages, isLoading } = useMessages(requestId);
  const { mutate: sendMessage, isPending } = useSendMessage();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    sendMessage({ requestId, content: inputValue }, {
      onSuccess: () => setInputValue("")
    });
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <>
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            This is the start of your conversation.
          </div>
        ) : (
          messages?.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={clsx("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                  isMe 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted text-foreground rounded-tl-none"
                )}>
                  <p>{msg.content}</p>
                  <p className={clsx("text-[10px] mt-1 opacity-70 text-right")}>
                    {format(new Date(msg.createdAt!), 'h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isPending}
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim() || isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </>
  );
}
