# IMLS: Intelligent Mobile Learning System - Technical Documentation

## Executive Summary

The Intelligent Mobile Learning System (IMLS) is an AI-powered multi-agent learning platform providing personalized, adaptive learning experiences. Four specialized intelligent agents collaborate to deliver comprehensive educational services.

## System Architecture

### Multi-Agent Components

- **Student Agent**: Manages student profiles, preferences, and activity tracking
- **Tutor Agent**: Provides AI-powered tutoring and personalized recommendations
- **Content Agent**: Manages course library and learning materials
- **Assessment Agent**: Handles quizzes, auto-grading, and performance feedback

### Technology Stack

- Frontend: React 19, Tailwind CSS 4, TypeScript
- Backend: Express 4, tRPC 11, Node.js
- Database: MySQL with Drizzle ORM
- AI: LLM API integration (Claude/GPT)
- Auth: Manus OAuth

## Database Schema

14 specialized tables:
- users, student_profiles, courses, lessons
- enrollments, learning_paths, lesson_progress
- quizzes, quiz_questions, quiz_attempts
- agents, agent_activity_logs
- chat_messages, system_analytics

## API Specification

Type-safe tRPC procedures:
- Student: Profile, enrollments, progress
- Courses: Browse, enroll, track
- Learning Paths: Generate personalized paths
- Quizzes: Questions, submissions, feedback
- Tutor: Chat, recommendations
- Agents: Status, logs
- Admin: Users, analytics

## Multi-Agent Implementation

**Tutor Agent**:
- Generates personalized learning paths using LLM
- Provides intelligent responses with context
- Maintains conversation history

**Assessment Agent**:
- Auto-grades quizzes
- Generates AI-powered feedback
- Tracks performance

**Content Agent**:
- Recommends relevant courses
- Filters by skill level
- Logs recommendations

**Student Agent**:
- Manages profiles
- Tracks activities
- Coordinates system

## Frontend Pages

- Home: Landing page
- Dashboard: Student hub with agents, courses, paths
- Tutor: AI chat interface
- Admin: User management, analytics

## Design System

- Premium typography (Sora, Inter)
- Elegant colors (purple, cyan, green)
- Smooth animations
- Mobile-first responsive
- Accessibility focused

## Authentication

- Manus OAuth
- HTTP-only cookies
- Role-based access (user, admin)

## Key Features

**Students**:
- Profile management
- Course enrollment
- Interactive quizzes
- AI learning paths
- AI tutor chat
- Progress analytics

**Admins**:
- User management
- System analytics
- Activity logs
- Agent monitoring

**Multi-Agent Dashboard**:
- Real-time agent status
- Agent roles
- Activity timeline
- System health

## Deployment

Build: pnpm build
Migrate: pnpm db:push
Start: pnpm start

Environment: DATABASE_URL, JWT_SECRET, OAuth, LLM keys

## Performance

- Database indexes
- tRPC serialization
- Optimistic updates
- Code splitting
- Image optimization

---
Version 1.0 | Production Ready | June 2026
