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
  BookOpen,
  Users,
  Clock,
  Star,
  Download,
  Play,
  CheckCircle,
  Lock,
  ChevronDown,
  FileText,
  Video,
  Code,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function CourseDetails() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const courseId = parseInt(location.split("/").pop() || "0");
  const [isEnrolling, setIsEnrolling] = useState(false);

  const coursesQuery = trpc.courses.getAll.useQuery();
  const lessonsQuery = trpc.courses.getLessons.useQuery({ courseId });
  const enrollmentsQuery = trpc.student.getEnrollments.useQuery();

  if (!user) return null;

  const course = coursesQuery.data?.find((c) => c.id === courseId);
  const lessons = lessonsQuery.data || [];
  const enrollments = enrollmentsQuery.data || [];
  const isEnrolled = enrollments.some((e) => e.courseId === courseId);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      // Enrollment logic will be implemented
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await enrollmentsQuery.refetch();
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (coursesQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
          <h3 className="text-lg font-semibold mb-2">Course not found</h3>
          <Button onClick={() => setLocation("/courses")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/courses")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Title and Meta */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="mb-3">{course.category}</Badge>
                  <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                  <p className="text-lg text-[hsl(var(--muted-foreground))]">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Students
                    </p>
                    <p className="font-semibold">2,450+</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Duration
                    </p>
                    <p className="font-semibold">
                      {course.duration ? `${course.duration} hours` : "Self-paced"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Rating
                    </p>
                    <p className="font-semibold">4.8/5.0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Content Tabs */}
            <Tabs defaultValue="lessons" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Lessons Tab */}
              <TabsContent value="lessons" className="space-y-4 mt-6">
                {lessonsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : lessons.length === 0 ? (
                  <Card className="p-8 text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
                    <p className="text-[hsl(var(--muted-foreground))]">
                      No lessons available yet
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson, index) => (
                      <Card
                        key={lesson.id}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1">{lesson.title}</h4>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                              {lesson.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                              <span className="flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                Video Lesson
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.duration || 30} min
                              </span>
                            </div>
                          </div>
                          {isEnrolled ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Lock className="w-5 h-5 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: "Course Slides",
                      type: "PDF",
                      size: "12.5 MB",
                      icon: FileText,
                    },
                    {
                      name: "Code Repository",
                      type: "GitHub",
                      size: "5.2 MB",
                      icon: Code,
                    },
                    {
                      name: "Supplementary Videos",
                      type: "Video",
                      size: "450 MB",
                      icon: Video,
                    },
                    {
                      name: "Practice Exercises",
                      type: "ZIP",
                      size: "8.7 MB",
                      icon: FileText,
                    },
                  ].map((resource, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <resource.icon className="w-5 h-5 text-purple-700" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{resource.name}</h4>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
                            {resource.type} • {resource.size}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-2"
                            disabled={!isEnrolled}
                          >
                            <Download className="w-3 h-3" />
                            {isEnrolled ? "Download" : "Enroll to Download"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4 mt-6">
                <Card className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        author: "Sarah Chen",
                        rating: 5,
                        text: "Excellent course! The instructor explains complex concepts in a very clear way.",
                      },
                      {
                        author: "Michael Rodriguez",
                        rating: 5,
                        text: "Great practical examples and hands-on projects. Highly recommended!",
                      },
                      {
                        author: "Emma Wilson",
                        rating: 4,
                        text: "Very informative. Would have liked more advanced topics.",
                      },
                    ].map((review, idx) => (
                      <div key={idx} className="pb-4 border-b last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{review.author}</span>
                          <div className="flex gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-500 fill-yellow-500"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {review.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 p-6 space-y-4">
              {/* Difficulty Badge */}
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                  Difficulty
                </p>
                <Badge
                  className={`${
                    course.skillLevel === "beginner"
                      ? "bg-green-100 text-green-700"
                      : course.skillLevel === "intermediate"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {course.skillLevel.charAt(0).toUpperCase() +
                    course.skillLevel.slice(1)}
                </Badge>
              </div>

              {/* Progress (if enrolled) */}
              {isEnrolled && (
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                    Your Progress
                  </p>
                  <Progress value={45} className="mb-2" />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    45% complete
                  </p>
                </div>
              )}

              {/* Enrollment Button */}
              {!isEnrolled ? (
                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full"
                  size="lg"
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll Now"
                  )}
                </Button>
              ) : (
                <Button className="w-full" size="lg">
                  Continue Learning
                </Button>
              )}

              {/* Course Info */}
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                    Lessons
                  </p>
                  <p className="font-semibold">{lessons.length} lessons</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                    Certificate
                  </p>
                  <p className="font-semibold">Available</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                    Access
                  </p>
                  <p className="font-semibold">Lifetime</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
