import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  studentProfiles,
  InsertStudentProfile,
  courses,
  InsertCourse,
  lessons,
  InsertLesson,
  enrollments,
  InsertEnrollment,
  learningPaths,
  InsertLearningPath,
  quizzes,
  InsertQuiz,
  quizQuestions,
  InsertQuizQuestion,
  quizAttempts,
  InsertQuizAttempt,
  agents,
  InsertAgent,
  agentActivityLogs,
  InsertAgentActivityLog,
  chatMessages,
  InsertChatMessage,
  systemAnalytics,
  InsertSystemAnalytics,
  lessonProgress,
  InsertLessonProgress,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

// ============ STUDENT PROFILE OPERATIONS ============

export async function getOrCreateStudentProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const newProfile: InsertStudentProfile = {
    userId,
    skillLevel: "beginner",
    learningStyle: "visual",
    subjectInterests: [],
  };

  await db.insert(studentProfiles).values(newProfile);
  return db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1)
    .then((r) => (r.length > 0 ? r[0] : null));
}

export async function updateStudentProfile(
  userId: number,
  updates: Partial<InsertStudentProfile>
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(studentProfiles)
    .set(updates)
    .where(eq(studentProfiles.userId, userId));

  return db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1)
    .then((r) => (r.length > 0 ? r[0] : null));
}

// ============ COURSE OPERATIONS ============

export async function createCourse(course: InsertCourse) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(courses).values(course);
  const courseId = Number(result[0].insertId);
  const created = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses);
}

export async function getCoursesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.category, category));
}

// ============ LESSON OPERATIONS ============

export async function getLessonsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(lessons.order);
}

export async function createLesson(lesson: InsertLesson) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(lessons).values(lesson);
  const lessonId = Number(result[0].insertId);
  const created = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return created.length > 0 ? created[0] : null;
}

// ============ ENROLLMENT OPERATIONS ============

export async function enrollStudent(enrollment: InsertEnrollment) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(enrollments).values(enrollment);
  const enrollmentId = Number(result[0].insertId);
  const created = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getStudentEnrollments(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(enrollments)
    .where(eq(enrollments.studentId, studentId));
}

export async function updateEnrollmentProgress(
  enrollmentId: number,
  completionPercentage: number
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(enrollments)
    .set({ completionPercentage: completionPercentage.toString() as any })
    .where(eq(enrollments.id, enrollmentId));

  return db
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, enrollmentId))
    .limit(1)
    .then((r) => (r.length > 0 ? r[0] : null));
}

// ============ LEARNING PATH OPERATIONS ============

export async function createLearningPath(path: InsertLearningPath) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(learningPaths).values(path);
  const pathId = Number(result[0].insertId);
  const created = await db.select().from(learningPaths).where(eq(learningPaths.id, pathId)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getStudentLearningPaths(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.studentId, studentId))
    .orderBy(desc(learningPaths.createdAt));
}

// ============ QUIZ OPERATIONS ============

export async function createQuiz(quiz: InsertQuiz) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(quizzes).values(quiz);
  const quizId = Number(result[0].insertId);
  const created = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getQuizzesByLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizzes).where(eq(quizzes.lessonId, lessonId));
}

export async function addQuizQuestion(question: InsertQuizQuestion) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(quizQuestions).values(question);
  const questionId = Number(result[0].insertId);
  const created = await db.select().from(quizQuestions).where(eq(quizQuestions.id, questionId)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getQuizQuestions(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId))
    .orderBy(quizQuestions.order);
}

export async function recordQuizAttempt(attempt: InsertQuizAttempt) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(quizAttempts).values(attempt);
  const attemptId = Number(result[0].insertId);
  const created = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getStudentQuizAttempts(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, studentId))
    .orderBy(desc(quizAttempts.attemptedAt));
}

// ============ AGENT OPERATIONS ============

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agents);
}

export async function getAgentByName(name: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.name, name))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateAgent(agent: InsertAgent) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getAgentByName(agent.name!);

  if (existing) {
    await db
      .update(agents)
      .set({ ...agent, updatedAt: new Date() })
      .where(eq(agents.name, agent.name!));
    return getAgentByName(agent.name!);
  } else {
    const result = await db.insert(agents).values(agent);
    return db
      .select()
      .from(agents)
      .where(eq(agents.id, Number(result[0].insertId)))
      .limit(1);
  }
}

export async function updateAgentStatus(agentId: number, status: 'active' | 'inactive' | 'maintenance') {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(agents)
    .set({ status: status as any, lastActivityAt: new Date() })
    .where(eq(agents.id, agentId));

  return db
    .select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1)
    .then((r) => (r.length > 0 ? r[0] : null));
}

// ============ AGENT ACTIVITY LOG OPERATIONS ============

export async function logAgentActivity(log: InsertAgentActivityLog) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(agentActivityLogs).values(log);
  const logId = Number(result[0].insertId);
  const created = await db.select().from(agentActivityLogs).where(eq(agentActivityLogs.id, logId)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getAgentActivityLogs(agentId?: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  if (agentId) {
    return db
      .select()
      .from(agentActivityLogs)
      .where(eq(agentActivityLogs.agentId, agentId))
      .orderBy(desc(agentActivityLogs.createdAt))
      .limit(limit);
  }

  return db
    .select()
    .from(agentActivityLogs)
    .orderBy(desc(agentActivityLogs.createdAt))
    .limit(limit);
}

// ============ CHAT MESSAGE OPERATIONS ============

export async function saveChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(chatMessages).values(message);
  const messageId = Number(result[0].insertId);
  const created = await db.select().from(chatMessages).where(eq(chatMessages.id, messageId)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getStudentChatHistory(studentId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.studentId, studentId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

// ============ SYSTEM ANALYTICS OPERATIONS ============

export async function recordSystemAnalytics(analytics: InsertSystemAnalytics) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(systemAnalytics).values(analytics);
  const analyticsId = Number(result[0].insertId);
  const created = await db.select().from(systemAnalytics).where(eq(systemAnalytics.id, analyticsId)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getLatestAnalytics() {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(systemAnalytics)
    .orderBy(desc(systemAnalytics.date))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============ LESSON PROGRESS OPERATIONS ============

export async function updateLessonProgress(
  studentId: number,
  lessonId: number,
  status: 'not_started' | 'in_progress' | 'completed'
) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.studentId, studentId),
        eq(lessonProgress.lessonId, lessonId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(lessonProgress)
      .set({
        status,
        completedAt: status === "completed" ? new Date() : null,
      })
      .where(eq(lessonProgress.id, existing[0].id));
  } else {
    await db.insert(lessonProgress).values({
      studentId,
      lessonId,
      status,
      completedAt: status === "completed" ? new Date() : null,
    });
  }

  return db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.studentId, studentId),
        eq(lessonProgress.lessonId, lessonId)
      )
    )
    .limit(1)
    .then((r) => (r.length > 0 ? r[0] : null));
}

export async function getStudentLessonProgress(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.studentId, studentId));
}
