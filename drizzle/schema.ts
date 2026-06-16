import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("passwordHash"), // For email/password login
  loginMethod: varchar("loginMethod", { length: 64 }), // 'oauth', 'email', or 'both'
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isEmailVerified: boolean("isEmailVerified").default(false).notNull(),
  emailVerificationToken: varchar("emailVerificationToken", { length: 256 }),
  passwordResetToken: varchar("passwordResetToken", { length: 256 }),
  passwordResetExpiresAt: timestamp("passwordResetExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Auth sessions - track active user sessions
 */
export const authSessions = mysqlTable("auth_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionToken: varchar("sessionToken", { length: 256 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuthSession = typeof authSessions.$inferSelect;
export type InsertAuthSession = typeof authSessions.$inferInsert;

/**
 * Student profiles - extended information for students
 */
export const studentProfiles = mysqlTable("student_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  skillLevel: mysqlEnum("skillLevel", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  learningStyle: mysqlEnum("learningStyle", ["visual", "auditory", "kinesthetic", "reading"]).default("visual").notNull(),
  subjectInterests: json("subjectInterests").$type<string[]>().default([]).notNull(),
  bio: text("bio"),
  profileImageUrl: varchar("profileImageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

/**
 * Courses - learning content organized by subject
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  skillLevel: mysqlEnum("skillLevel", ["beginner", "intermediate", "advanced"]).notNull(),
  duration: int("duration"), // in minutes
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Lessons - individual learning units within courses
 */
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"), // markdown content
  contentType: mysqlEnum("contentType", ["text", "video", "interactive", "mixed"]).default("text").notNull(),
  mediaUrl: varchar("mediaUrl", { length: 512 }),
  duration: int("duration"), // in minutes
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/**
 * Learning paths - personalized course recommendations for students
 */
export const learningPaths = mysqlTable("learning_paths", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  recommendedCourses: json("recommendedCourses").$type<number[]>().notNull(),
  generatedBy: varchar("generatedBy", { length: 100 }).default("tutor-agent").notNull(),
  status: mysqlEnum("status", ["active", "completed", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof learningPaths.$inferInsert;

/**
 * Student enrollments - tracks which courses students are taking
 */
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  courseId: int("courseId").notNull(),
  status: mysqlEnum("status", ["enrolled", "in_progress", "completed"]).default("enrolled").notNull(),
  completionPercentage: decimal("completionPercentage", { precision: 5, scale: 2 }).default("0").notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Lesson progress - tracks student progress through individual lessons
 */
export const lessonProgress = mysqlTable("lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  lessonId: int("lessonId").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;

/**
 * Quizzes - assessment modules for lessons
 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  passingScore: decimal("passingScore", { precision: 5, scale: 2 }).default("70").notNull(),
  timeLimit: int("timeLimit"), // in minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * Quiz questions - individual questions within quizzes
 */
export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  question: text("question").notNull(),
  questionType: mysqlEnum("questionType", ["multiple_choice", "true_false", "short_answer"]).notNull(),
  options: json("options").$type<string[]>(), // for multiple choice
  correctAnswer: text("correctAnswer").notNull(),
  points: decimal("points", { precision: 5, scale: 2 }).default("1").notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

/**
 * Quiz attempts - tracks student quiz submissions
 */
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  quizId: int("quizId").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  totalPoints: decimal("totalPoints", { precision: 5, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  passed: boolean("passed").notNull(),
  answers: json("answers").$type<Record<string, string>>().notNull(),
  feedback: text("feedback"),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

/**
 * Agents - multi-agent system components
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  type: mysqlEnum("type", ["student", "tutor", "content", "assessment"]).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active").notNull(),
  role: text("role"), // detailed role description
  lastActivityAt: timestamp("lastActivityAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Agent activity logs - tracks agent actions and interactions
 */
export const agentActivityLogs = mysqlTable("agent_activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  details: json("details").$type<Record<string, unknown>>(),
  studentId: int("studentId"),
  status: mysqlEnum("status", ["success", "failure", "pending"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentActivityLog = typeof agentActivityLogs.$inferSelect;
export type InsertAgentActivityLog = typeof agentActivityLogs.$inferInsert;

/**
 * Chat messages - stores AI tutor chat history
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  context: json("context").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * System analytics - aggregate metrics for admin dashboard
 */
export const systemAnalytics = mysqlTable("system_analytics", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  totalStudents: int("totalStudents").default(0).notNull(),
  totalEnrollments: int("totalEnrollments").default(0).notNull(),
  totalCoursesCompleted: int("totalCoursesCompleted").default(0).notNull(),
  averageQuizScore: decimal("averageQuizScore", { precision: 5, scale: 2 }).default("0").notNull(),
  agentInteractions: int("agentInteractions").default(0).notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemAnalytics = typeof systemAnalytics.$inferSelect;
export type InsertSystemAnalytics = typeof systemAnalytics.$inferInsert;
