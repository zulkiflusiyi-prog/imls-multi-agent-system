import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Brain,
  BookOpen,
  BarChart3,
  MessageSquare,
  Users,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const agentsQuery = trpc.agents.getAll.useQuery();
  const profileQuery = trpc.student.getProfile.useQuery();
  const enrollmentsQuery = trpc.student.getEnrollments.useQuery();
  const learningPathsQuery = trpc.learningPaths.getStudentPaths.useQuery();

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Continue your learning journey with personalized recommendations
            </p>
          </div>
          <Link href="/tutor">
            <Button className="btn-primary gap-2">
              <MessageSquare className="w-4 h-4" />
              Ask Tutor
            </Button>
          </Link>
        </div>

        {/* Multi-Agent Status */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-[hsl(var(--accent))]" />
            Active Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agentsQuery.data?.map((agent) => (
              <Card key={agent.id} className="hover-lift">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">{agent.type}</p>
                  </div>
                  <div className={`status-${agent.status === "active" ? "active" : "inactive"}`} />
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">
                  {agent.description}
                </p>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {agent.lastActivityAt
                    ? `Last active: ${new Date(agent.lastActivityAt).toLocaleDateString()}`
                    : "No recent activity"}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Courses Enrolled</p>
                    <p className="text-3xl font-bold">{enrollmentsQuery.data?.length || 0}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-[hsl(var(--accent))]/20" />
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Learning Paths</p>
                    <p className="text-3xl font-bold">{learningPathsQuery.data?.length || 0}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-[hsl(var(--accent))]/20" />
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Skill Level</p>
                    <p className="text-2xl font-bold capitalize">
                      {profileQuery.data?.skillLevel || "Beginner"}
                    </p>
                  </div>
                  <Zap className="w-10 h-10 text-[hsl(var(--accent))]/20" />
                </div>
              </Card>
            </div>

            {/* Profile Summary */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">Learning Style</p>
                  <Badge className="badge-primary">
                    {profileQuery.data?.learningStyle || "Visual"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">Subject Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {profileQuery.data?.subjectInterests?.length ? (
                      profileQuery.data.subjectInterests.map((interest, i) => (
                        <Badge key={i} className="badge-primary">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">No interests set yet</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Courses</h3>
              <Link href="/courses">
                <Button className="btn-secondary">Browse More</Button>
              </Link>
            </div>

            {enrollmentsQuery.data && enrollmentsQuery.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrollmentsQuery.data.map((enrollment) => (
                  <Card key={enrollment.id} className="hover-lift">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">Course {enrollment.courseId}</h4>
                      <Badge className={`badge-${
                        enrollment.status === "completed"
                          ? "success"
                          : enrollment.status === "in_progress"
                          ? "primary"
                          : "warning"
                      }`}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[hsl(var(--muted-foreground))]">Progress</span>
                          <span className="font-semibold">{enrollment.completionPercentage}%</span>
                        </div>
                        <Progress value={Number(enrollment.completionPercentage)} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <BookOpen className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))] mb-4">No courses enrolled yet</p>
                <Link href="/courses">
                  <Button className="btn-primary">Explore Courses</Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Learning Paths</h3>
              <Link href="/learning-paths">
                <Button className="btn-primary">Generate New Path</Button>
              </Link>
            </div>

            {learningPathsQuery.data && learningPathsQuery.data.length > 0 ? (
              <div className="space-y-4">
                {learningPathsQuery.data.map((path) => (
                  <Card key={path.id} className="hover-lift">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{path.title}</h4>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{path.description}</p>
                      </div>
                      <Badge className={`badge-${
                        path.status === "completed"
                          ? "success"
                          : path.status === "active"
                          ? "primary"
                          : "warning"
                      }`}>
                        {path.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      {path.recommendedCourses.length} courses recommended
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))] mb-4">No learning paths yet</p>
                <Link href="/learning-paths">
                  <Button className="btn-primary">Create Your First Path</Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Learning Statistics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-semibold">45%</span>
                  </div>
                  <Progress value={45} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Quiz Average</span>
                    <span className="text-sm font-semibold">82%</span>
                  </div>
                  <Progress value={82} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Lessons Completed</span>
                    <span className="text-sm font-semibold">12 of 28</span>
                  </div>
                  <Progress value={43} />
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, text: "Completed Quiz: Advanced JavaScript", time: "2 hours ago" },
                  { icon: BookOpen, text: "Started Course: React Fundamentals", time: "1 day ago" },
                  { icon: TrendingUp, text: "Achieved 90% on Assessment", time: "3 days ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-[hsl(var(--border))] last:border-0">
                    <activity.icon className="w-5 h-5 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
