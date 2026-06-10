import {
  getAllAgents,
  getAgentByName,
  createOrUpdateAgent,
  logAgentActivity,
  getStudentLearningPaths,
  createLearningPath,
  getStudentChatHistory,
  saveChatMessage,
  recordQuizAttempt,
  getStudentEnrollments,
  getAllCourses,
  getLessonsByCourse,
} from "./db";
import { invokeLLM } from "./_core/llm";
import type { Agent, LearningPath, ChatMessage } from "../drizzle/schema";

/**
 * Multi-Agent System for IMLS
 * Manages four specialized agents:
 * 1. Student Agent - Manages student profiles and learning activities
 * 2. Tutor Agent - Provides AI-powered tutoring and personalized recommendations
 * 3. Content Agent - Manages course and lesson content
 * 4. Assessment Agent - Handles quizzes and performance evaluation
 */

const AGENT_NAMES = {
  STUDENT: "Student Agent",
  TUTOR: "Tutor Agent",
  CONTENT: "Content Agent",
  ASSESSMENT: "Assessment Agent",
};

const AGENT_DESCRIPTIONS = {
  STUDENT: "Manages student profiles, preferences, and learning activities",
  TUTOR: "Provides AI-powered tutoring, personalized learning recommendations, and intelligent responses to student questions",
  CONTENT: "Manages course library, lessons, and learning materials organization",
  ASSESSMENT: "Handles quiz creation, auto-grading, and performance feedback",
};

const AGENT_ROLES = {
  STUDENT: "Tracks student progress, manages profiles, and coordinates learning activities across the system",
  TUTOR: "Analyzes student learning patterns, generates personalized learning paths, and provides intelligent tutoring support",
  CONTENT: "Organizes and manages educational content, ensures content relevance to student needs",
  ASSESSMENT: "Evaluates student performance, provides detailed feedback, and adjusts difficulty based on performance",
};

/**
 * Initialize all agents in the system
 */
export async function initializeAgents() {
  const agents = [
    {
      name: AGENT_NAMES.STUDENT,
      type: "student" as const,
      description: AGENT_DESCRIPTIONS.STUDENT,
      role: AGENT_ROLES.STUDENT,
    },
    {
      name: AGENT_NAMES.TUTOR,
      type: "tutor" as const,
      description: AGENT_DESCRIPTIONS.TUTOR,
      role: AGENT_ROLES.TUTOR,
    },
    {
      name: AGENT_NAMES.CONTENT,
      type: "content" as const,
      description: AGENT_DESCRIPTIONS.CONTENT,
      role: AGENT_ROLES.CONTENT,
    },
    {
      name: AGENT_NAMES.ASSESSMENT,
      type: "assessment" as const,
      description: AGENT_DESCRIPTIONS.ASSESSMENT,
      role: AGENT_ROLES.ASSESSMENT,
    },
  ];

  for (const agent of agents) {
    await createOrUpdateAgent({
      name: agent.name,
      type: agent.type,
      description: agent.description,
      role: agent.role,
      status: "active",
    });
  }

  return agents;
}

/**
 * Get all agents with their current status
 */
export async function getAllAgentsStatus() {
  const agents = await getAllAgents();
  return agents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    type: agent.type,
    description: agent.description,
    role: agent.role,
    status: agent.status,
    lastActivityAt: agent.lastActivityAt,
    createdAt: agent.createdAt,
  }));
}

/**
 * Tutor Agent: Generate personalized learning path for a student
 */
export async function generatePersonalizedLearningPath(
  studentId: number,
  skillLevel: string,
  subjectInterests: string[]
) {
  const tutorAgent = await getAgentByName(AGENT_NAMES.TUTOR);
  if (!tutorAgent) throw new Error("Tutor Agent not found");

  try {
    // Get all available courses
    const allCourses = await getAllCourses();

    // Filter courses based on skill level and interests
    const relevantCourses = allCourses.filter(
      (course) =>
        course.skillLevel === skillLevel &&
        subjectInterests.some((interest) =>
          course.category.toLowerCase().includes(interest.toLowerCase())
        )
    );

    // Use LLM to generate personalized recommendations
    const prompt = `
You are an intelligent tutoring system. Based on the following student profile and available courses, 
generate a personalized learning path recommendation.

Student Profile:
- Skill Level: ${skillLevel}
- Subject Interests: ${subjectInterests.join(", ")}

Available Courses:
${relevantCourses
  .slice(0, 10)
  .map((c) => `- ${c.title} (Category: ${c.category}, Level: ${c.skillLevel})`)
  .join("\n")}

Provide a JSON response with:
{
  "title": "Learning Path Title",
  "description": "Brief description",
  "recommendedCourseIds": [array of course IDs],
  "reasoning": "Why this path is recommended"
}
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an educational AI assistant that creates personalized learning paths. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : "";

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const recommendation = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!recommendation) {
      throw new Error("Failed to parse learning path recommendation");
    }

    // Create learning path in database
    const learningPath = await createLearningPath({
      studentId,
      title: recommendation.title,
      description: recommendation.description,
      recommendedCourses: recommendation.recommendedCourseIds,
      generatedBy: "tutor-agent",
      status: "active",
    });

    // Log agent activity
    await logAgentActivity({
      agentId: tutorAgent.id,
      action: "generate_learning_path",
      details: {
        studentId,
        pathId: learningPath?.id,
        reasoning: recommendation.reasoning,
      },
      studentId,
      status: "success",
    });

    return learningPath || null;
  } catch (error) {
    const tutorAgent = await getAgentByName(AGENT_NAMES.TUTOR);
    if (tutorAgent) {
      await logAgentActivity({
        agentId: tutorAgent.id,
        action: "generate_learning_path",
        details: { studentId, error: String(error) },
        studentId,
        status: "failure",
      });
    }
    throw error;
  }
}

/**
 * Tutor Agent: Provide intelligent response to student questions
 */
export async function getTutorResponse(studentId: number, question: string) {
  const tutorAgent = await getAgentByName(AGENT_NAMES.TUTOR);
  if (!tutorAgent) throw new Error("Tutor Agent not found");

  try {
    // Get student's chat history for context
    const chatHistory = await getStudentChatHistory(studentId, 10);

    // Get student's learning paths for context
    const learningPaths = await getStudentLearningPaths(studentId);

    // Build context from chat history
    const conversationContext = chatHistory
      .reverse()
      .map((msg) => ({
        role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      }));

    // Get response from LLM
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an intelligent tutor in a mobile learning system. You help students learn by:
1. Answering their questions clearly and concisely
2. Providing examples and explanations
3. Encouraging deeper learning
4. Adapting to their skill level
5. Being supportive and encouraging

Keep responses focused, practical, and educational.`,
        },
        ...conversationContext,
        {
          role: "user",
          content: question,
        },
      ],
    });

    const tutorResponse =
      typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : "";

    // Save user message
    await saveChatMessage({
      studentId,
      role: "user",
      content: question,
      context: { learningPaths: learningPaths.map((p) => p.id) },
    });

    // Save tutor response
    await saveChatMessage({
      studentId,
      role: "assistant",
      content: tutorResponse,
      context: { agentId: tutorAgent.id },
    });

    // Log agent activity
    await logAgentActivity({
      agentId: tutorAgent.id,
      action: "provide_tutoring",
      details: {
        studentId,
        questionLength: question.length,
        responseLength: tutorResponse.length,
      },
      studentId,
      status: "success",
    });

    return tutorResponse;
  } catch (error) {
    const tutorAgent = await getAgentByName(AGENT_NAMES.TUTOR);
    if (tutorAgent) {
      await logAgentActivity({
        agentId: tutorAgent.id,
        action: "provide_tutoring",
        details: { studentId, error: String(error) },
        studentId,
        status: "failure",
      });
    }
    throw error;
  }
}

/**
 * Assessment Agent: Generate auto-grading feedback
 */
export async function generateQuizFeedback(
  studentId: number,
  quizId: number,
  score: number,
  totalPoints: number,
  answers: Record<string, string>
) {
  const assessmentAgent = await getAgentByName(AGENT_NAMES.ASSESSMENT);
  if (!assessmentAgent) throw new Error("Assessment Agent not found");

  try {
    const percentage = (score / totalPoints) * 100;

    // Use LLM to generate personalized feedback
    const prompt = `
You are an assessment AI that provides constructive feedback to students.

Quiz Performance:
- Score: ${score}/${totalPoints} (${percentage.toFixed(1)}%)
- Student Answers: ${JSON.stringify(answers)}

Generate a JSON response with:
{
  "overallFeedback": "Brief overall assessment",
  "strengths": ["Array of student strengths demonstrated"],
  "areasForImprovement": ["Array of areas to focus on"],
  "recommendations": ["Specific recommendations for improvement"],
  "encouragement": "Motivational message"
}

Keep feedback constructive, specific, and encouraging.
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an educational assessment AI. Always respond with valid JSON containing constructive feedback.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : "";

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!feedback) {
      throw new Error("Failed to parse feedback");
    }

    // Format feedback as a readable message
    const feedbackMessage = `
${feedback.overallFeedback}

Strengths:
${feedback.strengths.map((s: string) => `• ${s}`).join("\n")}

Areas for Improvement:
${feedback.areasForImprovement.map((a: string) => `• ${a}`).join("\n")}

Recommendations:
${feedback.recommendations.map((r: string) => `• ${r}`).join("\n")}

${feedback.encouragement}
`;

    // Log agent activity
    await logAgentActivity({
      agentId: assessmentAgent.id,
      action: "generate_feedback",
      details: {
        studentId,
        quizId,
        score,
        percentage: percentage.toFixed(1),
      },
      studentId,
      status: "success",
    });

    return {
      feedback: feedbackMessage,
      details: feedback,
    };
  } catch (error) {
    const assessmentAgent = await getAgentByName(AGENT_NAMES.ASSESSMENT);
    if (assessmentAgent) {
      await logAgentActivity({
        agentId: assessmentAgent.id,
        action: "generate_feedback",
        details: { studentId, quizId, error: String(error) },
        studentId,
        status: "failure",
      });
    }
    throw error;
  }
}

/**
 * Content Agent: Get content recommendations
 */
export async function getContentRecommendations(
  studentId: number,
  skillLevel: string
) {
  const contentAgent = await getAgentByName(AGENT_NAMES.CONTENT);
  if (!contentAgent) throw new Error("Content Agent not found");

  try {
    // Get student's enrollments
    const enrollments = await getStudentEnrollments(studentId);

    // Get all courses
    const allCourses = await getAllCourses();

    // Filter courses by skill level
    const relevantCourses = allCourses.filter(
      (c) => c.skillLevel === skillLevel
    );

    // Get courses student hasn't enrolled in
    const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
    const recommendedCourses = relevantCourses.filter(
      (c) => !enrolledCourseIds.has(c.id)
    );

    // Log agent activity
    await logAgentActivity({
      agentId: contentAgent.id,
      action: "provide_recommendations",
      details: {
        studentId,
        recommendedCount: recommendedCourses.length,
        skillLevel,
      },
      studentId,
      status: "success",
    });

    return recommendedCourses.slice(0, 5);
  } catch (error) {
    const contentAgent = await getAgentByName(AGENT_NAMES.CONTENT);
    if (contentAgent) {
      await logAgentActivity({
        agentId: contentAgent.id,
        action: "provide_recommendations",
        details: { studentId, error: String(error) },
        studentId,
        status: "failure",
      });
    }
    throw error;
  }
}
