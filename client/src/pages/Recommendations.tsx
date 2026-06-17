import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Sparkles,
  TrendingUp,
  BookOpen,
  Users,
  Clock,
  Star,
  ArrowRight,
  Filter,
  Zap,
  Target,
  Brain,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface Recommendation {
  id: number;
  courseId: number;
  title: string;
  description: string;
  category: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  matchScore: number;
  reason: string;
  icon: React.ReactNode;
  duration: number | null;
}

export default function Recommendations() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  const studentQuery = trpc.student.getProfile.useQuery();
  const coursesQuery = trpc.courses.getAll.useQuery();
  const enrollmentsQuery = trpc.student.getEnrollments.useQuery();

  if (!user) return null;

  const student = studentQuery.data;
  const courses = coursesQuery.data || [];
  const enrollments = enrollmentsQuery.data || [];
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  // Generate recommendations based on student profile
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    courses.forEach((course) => {
      if (enrolledCourseIds.has(course.id)) return;

      let matchScore = 0;
      let reason = "";
      let icon = <BookOpen className="w-5 h-5" />;

      // Match based on skill level
      if (student?.skillLevel === course.skillLevel) {
        matchScore += 30;
        reason = "Matches your current skill level";
        icon = <Target className="w-5 h-5" />;
      } else if (
        student?.skillLevel === "beginner" &&
        course.skillLevel === "intermediate"
      ) {
        matchScore += 25;
        reason = "Perfect next step in your learning journey";
        icon = <TrendingUp className="w-5 h-5" />;
      } else if (
        student?.skillLevel === "intermediate" &&
        course.skillLevel === "advanced"
      ) {
        matchScore += 25;
        reason = "Advance your expertise further";
        icon = <Zap className="w-5 h-5" />;
      }

      // Match based on interests
      if (
        student?.subjectInterests &&
        student.subjectInterests.includes(course.category)
      ) {
        matchScore += 40;
        reason = "Based on your interests in " + course.category;
        icon = <Brain className="w-5 h-5" />;
      }

      // Match based on learning style
      if (student?.learningStyle === "visual" && course.category === "Design") {
        matchScore += 15;
      } else if (
        student?.learningStyle === "kinesthetic" &&
        (course.category === "Development" || course.category === "Engineering")
      ) {
        matchScore += 15;
      }

      // Popular courses get a boost
      matchScore += 10;

      if (matchScore > 30) {
        recommendations.push({
          id: course.id,
          courseId: course.id,
          title: course.title,
          description: course.description || "",
          category: course.category,
          skillLevel: course.skillLevel,
          matchScore: Math.min(100, matchScore),
          reason: reason || "Recommended for you",
          icon,
          duration: course.duration,
        });
      }
    });

    // Sort recommendations
    if (sortBy === "relevance") {
      recommendations.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "newest") {
      recommendations.reverse();
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  // Filter recommendations
  let filteredRecommendations = recommendations;
  if (selectedFilter !== "all") {
    filteredRecommendations = recommendations.filter(
      (r) => r.skillLevel === selectedFilter
    );
  }

  const isLoading =
    studentQuery.isLoading ||
    coursesQuery.isLoading ||
    enrollmentsQuery.isLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Sparkles className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Personalized Recommendations</h1>
              <p className="text-[hsl(var(--muted-foreground))]">
                AI-powered course suggestions tailored to your learning profile
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Recommendations
                </p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <BookOpen className="w-5 h-5 text-blue-700" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Enrolled Courses
                </p>
                <p className="text-2xl font-bold">{enrollments.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-700" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Avg. Match Score
                </p>
                <p className="text-2xl font-bold">
                  {recommendations.length > 0
                    ? Math.round(
                        recommendations.reduce((a, b) => a + b.matchScore, 0) /
                          recommendations.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Sparkles className="w-5 h-5 text-purple-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              All Levels
            </Button>
            <Button
              variant={selectedFilter === "beginner" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("beginner")}
            >
              Beginner
            </Button>
            <Button
              variant={selectedFilter === "intermediate" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("intermediate")}
            >
              Intermediate
            </Button>
            <Button
              variant={selectedFilter === "advanced" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("advanced")}
            >
              Advanced
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={sortBy === "relevance" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("relevance")}
            >
              Most Relevant
            </Button>
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
            >
              Newest
            </Button>
          </div>
        </div>

        {/* Recommendations List */}
        {filteredRecommendations.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-4">
              Complete your profile to get personalized recommendations
            </p>
            <Button onClick={() => setLocation("/dashboard")}>
              Update Profile
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecommendations.map((rec) => (
              <Card
                key={rec.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{rec.category}</Badge>
                        <Badge
                          className={`${
                            rec.skillLevel === "beginner"
                              ? "bg-green-100 text-green-700"
                              : rec.skillLevel === "intermediate"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {rec.skillLevel.charAt(0).toUpperCase() +
                            rec.skillLevel.slice(1)}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold mb-1">{rec.title}</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {rec.description}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-100 flex-shrink-0">
                      {rec.icon}
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        Match Score
                      </span>
                      <span className="text-sm font-bold text-purple-700">
                        {rec.matchScore}%
                      </span>
                    </div>
                    <Progress value={rec.matchScore} />
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {rec.reason}
                    </p>
                  </div>

                  {/* Course Meta */}
                  <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))] pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {rec.duration ? `${rec.duration} hours` : "Self-paced"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      4.8/5.0
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      2,450+ students
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full gap-2">
                    Enroll Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recommendation Insights */}
        {student && (
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-700" />
              Why These Recommendations?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Your Skill Level
                </p>
                <p className="font-semibold capitalize">
                  {student.skillLevel || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Learning Style
                </p>
                <p className="font-semibold capitalize">
                  {student.learningStyle || "Not specified"}
                </p>
              </div>
              <div>
                <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                  Your Interests
                </p>
                <p className="font-semibold">
                  {student.subjectInterests && student.subjectInterests.length > 0
                    ? student.subjectInterests.join(", ")
                    : "Not specified"}
                </p>
              </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
