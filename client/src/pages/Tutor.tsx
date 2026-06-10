import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox } from "@/components/AIChatBox";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { MessageSquare, Send, Lightbulb } from "lucide-react";

export default function Tutor() {
  const { user } = useAuth();
  const chatHistoryQuery = trpc.tutor.getChatHistory.useQuery();
  const askQuestionMutation = trpc.tutor.askQuestion.useMutation();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      await askQuestionMutation.mutateAsync({ question });
      setQuestion("");
      chatHistoryQuery.refetch();
    } catch (error) {
      console.error("Error asking question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[hsl(var(--accent))]" />
            AI Tutor
          </h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Ask questions and get intelligent, personalized responses from our AI tutor
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                {chatHistoryQuery.data && chatHistoryQuery.data.length > 0 ? (
                  chatHistoryQuery.data
                    .slice()
                    .reverse()
                    .map((message, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === "user"
                              ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                              : "bg-[hsl(var(--muted))] text-foreground"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                      <p className="text-[hsl(var(--muted-foreground))]">Start a conversation with your AI tutor</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-[hsl(var(--border))] p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !isLoading) {
                        handleAskQuestion();
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAskQuestion}
                    disabled={isLoading || !question.trim()}
                    className="btn-primary"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Tips */}
            <Card>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[hsl(var(--accent))]" />
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                <li>• Ask about concepts you don't understand</li>
                <li>• Request examples or explanations</li>
                <li>• Ask for study tips and strategies</li>
                <li>• Get help with problem-solving</li>
              </ul>
            </Card>

            {/* Tutor Info */}
            <Card>
              <h3 className="font-semibold mb-3">About Your Tutor</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                Your AI tutor is powered by advanced language models and understands your learning context.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Response Time</span>
                  <span className="font-semibold">Instant</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Availability</span>
                  <span className="font-semibold">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Languages</span>
                  <span className="font-semibold">Multiple</span>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card>
              <h3 className="font-semibold mb-3">Recommended Topics</h3>
              <div className="space-y-2">
                <Button className="btn-secondary w-full text-left justify-start text-xs h-auto py-2">
                  JavaScript Basics
                </Button>
                <Button className="btn-secondary w-full text-left justify-start text-xs h-auto py-2">
                  React Hooks
                </Button>
                <Button className="btn-secondary w-full text-left justify-start text-xs h-auto py-2">
                  API Design
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
