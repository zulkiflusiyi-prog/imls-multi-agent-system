import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  Users,
  BarChart3,
  Activity,
  Search,
  Filter,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const usersQuery = trpc.admin.getAllUsers.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const analyticsQuery = trpc.admin.getSystemAnalytics.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const activityLogsQuery = trpc.admin.getAgentActivityLogs.useQuery(
    { limit: 50 },
    { enabled: user?.role === "admin" }
  );

  if (!user || user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredUsers = usersQuery.data?.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-accent" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage users, view system analytics, and monitor agent activity
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold">{analyticsQuery.data?.totalStudents || 0}</p>
              </div>
              <Users className="w-10 h-10 text-accent/20" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Enrollments</p>
                <p className="text-3xl font-bold">{analyticsQuery.data?.totalEnrollments || 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-accent/20" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Courses Completed</p>
                <p className="text-3xl font-bold">{analyticsQuery.data?.totalCoursesCompleted || 0}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-accent/20" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Quiz Score</p>
                <p className="text-3xl font-bold">
                  {analyticsQuery.data?.averageQuizScore.toString().split(".")[0] || 0}%
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-accent/20" />
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Agent Activity</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="btn-secondary gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button className="btn-secondary gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 text-sm font-medium">{u.name || "—"}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{u.email || "—"}</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge
                            className={`badge-${u.role === "admin" ? "primary" : "warning"}`}
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(u.lastSignedIn).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4">System Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Student Engagement</span>
                      <span className="text-sm font-semibold">78%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{ width: "78%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Course Completion Rate</span>
                      <span className="text-sm font-semibold">65%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{ width: "65%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Quiz Pass Rate</span>
                      <span className="text-sm font-semibold">82%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{ width: "82%" }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Agent Performance</h3>
                <div className="space-y-3">
                  {[
                    { name: "Student Agent", uptime: "99.9%" },
                    { name: "Tutor Agent", uptime: "99.8%" },
                    { name: "Content Agent", uptime: "100%" },
                    { name: "Assessment Agent", uptime: "99.7%" },
                  ].map((agent, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{agent.name}</span>
                      <Badge className="badge-success">{agent.uptime}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-2">
              {activityLogsQuery.data && activityLogsQuery.data.length > 0 ? (
                activityLogsQuery.data.map((log, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{log.action}</h4>
                          <Badge
                            className={`badge-${
                              log.status === "success"
                                ? "success"
                                : log.status === "failure"
                                ? "error"
                                : "warning"
                            }`}
                          >
                            {log.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Agent ID: {log.agentId}
                          {log.studentId && ` • Student ID: ${log.studentId}`}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-12">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No activity logs yet</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
