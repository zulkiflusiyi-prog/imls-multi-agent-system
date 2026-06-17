import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Search,
  BookOpen,
  Users,
  Clock,
  Star,
  Filter,
  ChevronRight,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Programming",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "Cloud Computing",
  "AI & Machine Learning",
  "DevOps",
];

const DIFFICULTY_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function Courses() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  const coursesQuery = trpc.courses.getAll.useQuery();
  const enrollmentsQuery = trpc.student.getEnrollments.useQuery();

  if (!user) return null;

  const courses = coursesQuery.data || [];
  const enrollments = enrollmentsQuery.data || [];
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  // Filter and search courses
  let filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "All" || course.skillLevel === selectedDifficulty.toLowerCase();

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Sort courses
  if (sortBy === "newest") {
    filteredCourses.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortBy === "rating") {
    // Sort by rating (default 4.5 for all)
    filteredCourses.sort((a, b) => 0);
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Learning Resources</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Explore our comprehensive course library and expand your skills
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              placeholder="Search courses, topics, or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4" />
              <span className="font-semibold text-sm">Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4" />
              <span className="font-semibold text-sm">Difficulty Level</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <Button
                  key={level}
                  variant={selectedDifficulty === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(level)}
                  className="rounded-full"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-sm">Sort By</span>
            </div>
            <Tabs value={sortBy} onValueChange={setSortBy}>
              <TabsList>
                <TabsTrigger value="popular">Most Popular</TabsTrigger>
                <TabsTrigger value="newest">Newest</TabsTrigger>
                <TabsTrigger value="rating">Highest Rated</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Courses Grid */}
        <div>
          <div className="mb-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
            </p>
          </div>

          {coursesQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-[hsl(var(--muted-foreground))]">
                Try adjusting your filters or search query
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const isEnrolled = enrolledCourseIds.has(course.id);
                return (
                  <Link key={course.id} href={`/course/${course.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                      {/* Course Header */}
                      <div className="h-40 bg-gradient-to-br from-purple-500 to-blue-500 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <Badge variant="secondary" className="bg-white/20 text-white border-0">
                            {course.category}
                          </Badge>
                          {isEnrolled && (
                            <Badge className="bg-green-500 text-white border-0">
                              Enrolled
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white">{course.title}</h3>
                      </div>

                      {/* Course Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 flex-1">
                          {course.description}
                        </p>

                        {/* Course Meta */}
                        <div className="space-y-3 mb-4 border-t pt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                            <span>{enrolledCourseIds.has(course.id) ? "Enrolled" : "0 students"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                            <span>{course.duration || "Self-paced"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">4.5</span>
                            <span className="text-[hsl(var(--muted-foreground))]">
                              (128 reviews)
                            </span>
                          </div>
                        </div>

                        {/* Difficulty Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <Badge
                            variant="outline"
                            className={`${
                              course.skillLevel === "beginner"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : course.skillLevel === "intermediate"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {course.skillLevel.charAt(0).toUpperCase() + course.skillLevel.slice(1)}
                          </Badge>
                        </div>

                        {/* Action Button */}
                        <Button
                          className="w-full gap-2"
                          variant={isEnrolled ? "outline" : "default"}
                        >
                          {isEnrolled ? (
                            <>
                              <ChevronRight className="w-4 h-4" />
                              Continue Learning
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-4 h-4" />
                              View Course
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
