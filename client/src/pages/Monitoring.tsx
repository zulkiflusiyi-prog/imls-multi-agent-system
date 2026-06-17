import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  BookOpen,
  Brain,
  TrendingUp,
  RefreshCw,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface AgentStatus {
  id: number;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  uptime: number;
  requestsProcessed: number;
  averageResponseTime: number;
  errorRate: number;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  uptime: number;
}

export default function Monitoring() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const agentsQuery = trpc.admin.getAllUsers.useQuery();
  const activitiesQuery = trpc.admin.getAgentActivityLogs.useQuery({ limit: 50 });

  if (!user || user.role !== "admin") {
    return (
      <DashboardLayout>
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-[hsl(var(--muted-foreground))]">
            Only administrators can access the monitoring interface.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  // Mock system metrics
  const systemMetrics: SystemMetrics = {
    cpuUsage: 45,
    memoryUsage: 62,
    activeConnections: 128,
    requestsPerSecond: 234,
    averageResponseTime: 145,
    uptime: 99.98,
  };

  // Mock agent statuses
  const agents: AgentStatus[] = [
    {
      id: 1,
      name: "Student Agent",
      type: "student",
      status: "active",
      uptime: 99.99,
      requestsProcessed: 5420,
      averageResponseTime: 120,
      errorRate: 0.02,
    },
    {
      id: 2,
      name: "Tutor Agent",
      type: "tutor",
      status: "active",
      uptime: 99.95,
      requestsProcessed: 3890,
      averageResponseTime: 280,
      errorRate: 0.05,
    },
    {
      id: 3,
      name: "Content Agent",
      type: "content",
      status: "active",
      uptime: 100.0,
      requestsProcessed: 2150,
      averageResponseTime: 95,
      errorRate: 0.0,
    },
    {
      id: 4,
      name: "Assessment Agent",
      type: "assessment",
      status: "active",
      uptime: 99.98,
      requestsProcessed: 1840,
      averageResponseTime: 210,
      errorRate: 0.03,
    },
  ];

  // Mock performance data
  const performanceData = [
    { time: "00:00", cpu: 35, memory: 45, requests: 120 },
    { time: "04:00", cpu: 42, memory: 52, requests: 180 },
    { time: "08:00", cpu: 55, memory: 68, requests: 280 },
    { time: "12:00", cpu: 48, memory: 62, requests: 240 },
    { time: "16:00", cpu: 52, memory: 65, requests: 260 },
    { time: "20:00", cpu: 45, memory: 58, requests: 200 },
    { time: "24:00", cpu: 38, memory: 50, requests: 150 },
  ];

  // Mock user engagement data
  const engagementData = [
    { day: "Mon", activeUsers: 245, coursesCompleted: 12, quizzesTaken: 34 },
    { day: "Tue", activeUsers: 312, coursesCompleted: 18, quizzesTaken: 45 },
    { day: "Wed", activeUsers: 289, coursesCompleted: 15, quizzesTaken: 38 },
    { day: "Thu", activeUsers: 356, coursesCompleted: 22, quizzesTaken: 52 },
    { day: "Fri", activeUsers: 428, coursesCompleted: 28, quizzesTaken: 68 },
    { day: "Sat", activeUsers: 512, coursesCompleted: 35, quizzesTaken: 82 },
    { day: "Sun", activeUsers: 478, coursesCompleted: 32, quizzesTaken: 76 },
  ];

  const activities = (activitiesQuery.data as any) || [];

  const isLoading = agentsQuery.isLoading || activitiesQuery.isLoading;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Activity className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">System Monitoring</h1>
              <p className="text-[hsl(var(--muted-foreground))]">
                Real-time monitoring of agents, performance, and system health
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button size="sm" onClick={() => activitiesQuery.refetch()}>
              Refresh Now
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  CPU Usage
                </p>
                <p className="text-2xl font-bold">{systemMetrics.cpuUsage}%</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-100">
                <Zap className="w-5 h-5 text-orange-700" />
              </div>
            </div>
            <Progress value={systemMetrics.cpuUsage} className="mt-3" />
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Memory Usage
                </p>
                <p className="text-2xl font-bold">{systemMetrics.memoryUsage}%</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Brain className="w-5 h-5 text-purple-700" />
              </div>
            </div>
            <Progress value={systemMetrics.memoryUsage} className="mt-3" />
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Active Connections
                </p>
                <p className="text-2xl font-bold">
                  {systemMetrics.activeConnections}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <Users className="w-5 h-5 text-green-700" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  System Uptime
                </p>
                <p className="text-2xl font-bold">{systemMetrics.uptime}%</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Agent Status Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {agent.type}
                        </p>
                      </div>
                      <Badge
                        className={`${
                          agent.status === "active"
                            ? "bg-green-100 text-green-700"
                            : agent.status === "error"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {agent.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">
                          Uptime
                        </span>
                        <span className="font-semibold">{agent.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">
                          Requests
                        </span>
                        <span className="font-semibold">
                          {agent.requestsProcessed.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">
                          Avg Response
                        </span>
                        <span className="font-semibold">
                          {agent.averageResponseTime}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">
                          Error Rate
                        </span>
                        <span
                          className={`font-semibold ${
                            agent.errorRate > 0.1 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {agent.errorRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">All Systems Operational</span>
                  </div>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    Last checked 2 minutes ago
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Agent Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Agent</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Uptime</th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Requests
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Avg Response
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Error Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr key={agent.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{agent.name}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {agent.type}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={`${
                              agent.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {agent.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{agent.uptime}%</td>
                        <td className="py-3 px-4">
                          {agent.requestsProcessed.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{agent.averageResponseTime}ms</td>
                        <td className="py-3 px-4">
                          <span
                            className={
                              agent.errorRate > 0.1
                                ? "text-red-600 font-semibold"
                                : "text-green-600"
                            }
                          >
                            {agent.errorRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">System Performance (24h)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="#f97316"
                    name="CPU Usage (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    stroke="#a855f7"
                    name="Memory Usage (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Request Rate (24h)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requests" fill="#3b82f6" name="Requests/sec" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">User Engagement (Weekly)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="activeUsers"
                    fill="#10b981"
                    name="Active Users"
                  />
                  <Bar
                    dataKey="coursesCompleted"
                    fill="#3b82f6"
                    name="Courses Completed"
                  />
                  <Bar
                    dataKey="quizzesTaken"
                    fill="#f59e0b"
                    name="Quizzes Taken"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Total Active Users
                </p>
                <p className="text-3xl font-bold">2,620</p>
                <p className="text-xs text-green-600 mt-2">↑ 12% from last week</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Courses Completed
                </p>
                <p className="text-3xl font-bold">162</p>
                <p className="text-xs text-green-600 mt-2">↑ 8% from last week</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Avg Quiz Score
                </p>
                <p className="text-3xl font-bold">78.5%</p>
                <p className="text-xs text-green-600 mt-2">↑ 2% from last week</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Activity Logs */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-[hsl(var(--muted-foreground))] text-center py-8">
              No activities recorded yet
            </p>
          ) : (
            <div className="space-y-2">
              {activities.slice(0, 10).map((activity: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
                    <Activity className="w-4 h-4 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      {activity.action || "System Activity"}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {(activity as any).details || "No details available"}
                    </p>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] flex-shrink-0">
                    {new Date((activity as any).createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
