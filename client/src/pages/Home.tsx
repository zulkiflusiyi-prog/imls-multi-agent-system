import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Zap, Brain, BookOpen, BarChart3, MessageSquare, Users } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-muted border-t-accent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <DashboardRedirect />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-sora font-bold text-lg">IMLS</span>
          </div>
          <a href={getLoginUrl()}>
            <Button className="btn-primary">Sign In</Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <div className="badge-primary">
              <Zap className="w-3 h-3" />
              <span>AI-Powered Learning</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-sora font-bold mb-6 leading-tight">
            Intelligent Mobile
            <span className="text-gradient"> Learning System</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience personalized learning powered by multi-agent AI. Get adaptive course recommendations, intelligent tutoring, and real-time performance feedback.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href={getLoginUrl()}>
              <Button className="btn-primary h-12 px-8 text-base">
                Get Started
              </Button>
            </a>
            <Button className="btn-secondary h-12 px-8 text-base">
              Learn More
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
            <div className="card-interactive card p-4">
              <Brain className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Tutoring</h3>
              <p className="text-sm text-muted-foreground">Get instant answers and personalized guidance</p>
            </div>
            <div className="card-interactive card p-4">
              <BarChart3 className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart Tracking</h3>
              <p className="text-sm text-muted-foreground">Monitor progress with detailed analytics</p>
            </div>
            <div className="card-interactive card p-4">
              <BookOpen className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Adaptive Paths</h3>
              <p className="text-sm text-muted-foreground">Courses tailored to your learning style</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50 border-y border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-sora font-bold mb-4">Powered by Four Intelligent Agents</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our multi-agent system works together to create the perfect learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: "Student Agent",
                description: "Manages your profile and learning journey"
              },
              {
                icon: Brain,
                title: "Tutor Agent",
                description: "Provides personalized guidance and recommendations"
              },
              {
                icon: BookOpen,
                title: "Content Agent",
                description: "Curates and organizes learning materials"
              },
              {
                icon: BarChart3,
                title: "Assessment Agent",
                description: "Evaluates progress and provides feedback"
              }
            ].map((agent, i) => (
              <Card key={i} className="hover-lift p-6">
                <agent.icon className="w-10 h-10 text-accent mb-4" />
                <h3 className="font-semibold text-lg mb-2">{agent.title}</h3>
                <p className="text-sm text-muted-foreground">{agent.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-sora font-bold mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students using IMLS to achieve their learning goals with AI-powered personalization.
          </p>
          <a href={getLoginUrl()}>
            <Button className="btn-primary h-12 px-8 text-base">
              Start Learning Today
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-card/30">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center">
              <Brain className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-semibold">IMLS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Intelligent Mobile Learning System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function DashboardRedirect() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-muted border-t-accent animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Redirecting to dashboard...</p>
        <Link href="/dashboard">
          <Button className="btn-primary">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
