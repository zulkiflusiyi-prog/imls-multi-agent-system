import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  createSession,
  verifySession,
  deleteSession,
  requestPasswordReset,
  resetPassword,
  getUserById,
  requestEmailVerification,
  verifyEmail,
} from "./auth";
import {
  getOrCreateStudentProfile,
  updateStudentProfile,
  getAllCourses,
  getCoursesByCategory,
  getLessonsByCourse,
  enrollStudent,
  getStudentEnrollments,
  updateEnrollmentProgress,
  getStudentLearningPaths,
  getQuizzesByLesson,
  getQuizQuestions,
  recordQuizAttempt,
  getStudentQuizAttempts,
  getAllAgents,
  getAgentActivityLogs,
  getStudentChatHistory,
  getAllUsers,
  getLatestAnalytics,
  getStudentLessonProgress,
  updateLessonProgress,
} from "./db";
import {
  initializeAgents,
  getAllAgentsStatus,
  generatePersonalizedLearningPath,
  getTutorResponse,
  generateQuizFeedback,
  getContentRecommendations,
} from "./agents";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email("Invalid email address"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          name: z.string().min(2, "Name must be at least 2 characters"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const user = await registerUser(input.email, input.password, input.name);
          const sessionToken = await createSession(user.id);
          return {
            success: true,
            user,
            sessionToken,
          };
        } catch (error: any) {
          throw new Error(error.message || "Registration failed");
        }
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Invalid email address"),
          password: z.string().min(1, "Password is required"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const user = await loginUser(input.email, input.password);
          const sessionToken = await createSession(user.id);
          return {
            success: true,
            user,
            sessionToken,
          };
        } catch (error: any) {
          throw new Error(error.message || "Login failed");
        }
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    requestEmailVerification: protectedProcedure.mutation(async ({ ctx }) => {
      const appUrl = ctx.req.headers.origin || "https://imls-learn-jha5ptns.manus.space";
      const success = await requestEmailVerification(ctx.user.id, ctx.user.email || "", appUrl);
      return { success, message: "Verification email has been sent." };
    }),

    verifyEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const success = await verifyEmail(input.token);
        return { success, message: "Email verified successfully!" };
      }),

    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const appUrl = ctx.req.headers.origin || "https://imls-learn-jha5ptns.manus.space";
        const success = await requestPasswordReset(input.email, appUrl);
        return { success, message: "If an account exists with this email, a reset link has been sent." };
      }),

    resetPassword: publicProcedure
      .input(
        z.object({
          resetToken: z.string(),
          newPassword: z.string().min(8, "Password must be at least 8 characters"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await resetPassword(input.resetToken, input.newPassword);
          return { success: true, message: "Password reset successful" };
        } catch (error: any) {
          throw new Error(error.message || "Password reset failed");
        }
      }),
  }),

  // ============ STUDENT PROFILE ROUTES ============
  student: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return getOrCreateStudentProfile(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
          learningStyle: z.enum(["visual", "auditory", "kinesthetic", "reading"]).optional(),
          subjectInterests: z.array(z.string()).optional(),
          bio: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return updateStudentProfile(ctx.user.id, input);
      }),

    getEnrollments: protectedProcedure.query(async ({ ctx }) => {
      return getStudentEnrollments(ctx.user.id);
    }),

    getLessonProgress: protectedProcedure.query(async ({ ctx }) => {
      return getStudentLessonProgress(ctx.user.id);
    }),

    updateLessonProgress: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
          status: z.enum(["not_started", "in_progress", "completed"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return updateLessonProgress(ctx.user.id, input.lessonId, input.status);
      }),
  }),

  // ============ COURSE & CONTENT ROUTES ============
  courses: router({
    getAll: publicProcedure.query(async () => {
      return getAllCourses();
    }),

    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return getCoursesByCategory(input.category);
      }),

    getLessons: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return getLessonsByCourse(input.courseId);
      }),

    enroll: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return enrollStudent({
          studentId: ctx.user.id,
          courseId: input.courseId,
          status: "enrolled",
        });
      }),

    updateProgress: protectedProcedure
      .input(
        z.object({
          enrollmentId: z.number(),
          completionPercentage: z.number().min(0).max(100),
        })
      )
      .mutation(async ({ input }) => {
        return updateEnrollmentProgress(
          input.enrollmentId,
          input.completionPercentage
        );
      }),
  }),

  // ============ LEARNING PATH ROUTES ============
  learningPaths: router({
    getStudentPaths: protectedProcedure.query(async ({ ctx }) => {
      return getStudentLearningPaths(ctx.user.id);
    }),

    generatePersonalized: protectedProcedure
      .input(
        z.object({
          skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
          subjectInterests: z.array(z.string()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return generatePersonalizedLearningPath(
          ctx.user.id,
          input.skillLevel,
          input.subjectInterests
        );
      }),
  }),

  // ============ QUIZ & ASSESSMENT ROUTES ============
  quizzes: router({
    getByLesson: publicProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(async ({ input }) => {
        return getQuizzesByLesson(input.lessonId);
      }),

    getQuestions: publicProcedure
      .input(z.object({ quizId: z.number() }))
      .query(async ({ input }) => {
        return getQuizQuestions(input.quizId);
      }),

    submitAttempt: protectedProcedure
      .input(
        z.object({
          quizId: z.number(),
          score: z.number(),
          totalPoints: z.number(),
          percentage: z.number(),
          passed: z.boolean(),
          answers: z.record(z.string(), z.string()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const attempt = await recordQuizAttempt({
          studentId: ctx.user.id,
          quizId: input.quizId,
          score: input.score.toString() as any,
          totalPoints: input.totalPoints.toString() as any,
          percentage: input.percentage.toString() as any,
          passed: input.passed,
          answers: input.answers as Record<string, string>,
        });

        // Generate feedback using Assessment Agent
        const feedback = await generateQuizFeedback(
          ctx.user.id,
          input.quizId,
          input.score,
          input.totalPoints,
          input.answers as Record<string, string>
        );

        return {
          attempt,
          feedback,
        };
      }),

    getAttempts: protectedProcedure.query(async ({ ctx }) => {
      return getStudentQuizAttempts(ctx.user.id);
    }),
  }),

  // ============ TUTOR CHAT ROUTES ============
  tutor: router({
    askQuestion: protectedProcedure
      .input(z.object({ question: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return getTutorResponse(ctx.user.id, input.question);
      }),

    getChatHistory: protectedProcedure.query(async ({ ctx }) => {
      return getStudentChatHistory(ctx.user.id, 50);
    }),

    getRecommendations: protectedProcedure
      .input(z.object({ skillLevel: z.string() }))
      .query(async ({ ctx, input }) => {
        return getContentRecommendations(ctx.user.id, input.skillLevel);
      }),
  }),

  // ============ MULTI-AGENT SYSTEM ROUTES ============
  agents: router({
    initialize: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can initialize agents");
      }
      return initializeAgents();
    }),

    getAll: publicProcedure.query(async () => {
      return getAllAgentsStatus();
    }),

    getActivityLogs: protectedProcedure
      .input(z.object({ agentId: z.number().optional(), limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can view agent activity logs");
        }
        return getAgentActivityLogs(input.agentId, input.limit ?? 100);
      }),
  }),

  // ============ ADMIN ROUTES ============
  admin: router({
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view all users");
      }
      return getAllUsers();
    }),

    getSystemAnalytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view system analytics");
      }
      return getLatestAnalytics();
    }),

    getAgentActivityLogs: protectedProcedure
      .input(z.object({ agentId: z.number().optional(), limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can view agent activity logs");
        }
        return getAgentActivityLogs(input.agentId, input.limit ?? 100);
      }),
  }),
});

export type AppRouter = typeof appRouter;
