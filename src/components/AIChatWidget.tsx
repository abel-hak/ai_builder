import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { streamAI, Msg } from "@/lib/ai-stream";
import { cn } from "@/lib/utils";

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm Abel's AI assistant. Want to know if he has experience with a specific tech stack or project? Just ask!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user" as const, content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    
    // Temporary assistant message for streaming
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    await streamAI({
      mode: "hire-me",
      messages: newMessages,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
      },
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setMessages([...newMessages, { role: "assistant", content: `Oops, something went wrong: ${err}` }]);
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-glow shadow-primary/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-card/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shadow-inner">
                  <Bot size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Abel's AI Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground font-medium">Online & Ready</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Chat History Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "ml-auto" : "mr-auto")}>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-br-sm shadow-md" 
                      : "bg-secondary text-secondary-foreground rounded-bl-sm border border-border shadow-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs p-3 bg-secondary/50 w-fit rounded-2xl rounded-bl-sm border border-border">
                  <Loader2 size={12} className="animate-spin text-primary" /> Checking Abel's brain...
                </div>
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={handleSend} className="p-3 border-t border-border bg-card/80 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Abel's tech stack..."
                className="flex-1 bg-background text-sm rounded-full px-4 py-2.5 border border-border focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                disabled={isLoading}
                spellCheck={false}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex-shrink-0 shadow-md"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-glow flex items-center justify-center text-primary-foreground hover:scale-105 active:scale-95 transition-all duration-300 relative",
          isOpen ? "bg-secondary text-foreground shadow-none" : "bg-gradient-primary"
        )}
        aria-label="Toggle AI chat"
      >
        {isOpen ? <X size={24} /> : (
          <>
            <MessageCircle size={24} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-background"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default AIChatWidget;
