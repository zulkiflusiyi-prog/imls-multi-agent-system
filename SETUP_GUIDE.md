# IMLS Multi-Agent Learning System - Setup Guide

## Quick Start (Live Demo)

The fastest way to see the project in action is to visit the live deployment:

**Live URL:** https://imls-learn-jha5ptns.manus.space

No setup required! You can immediately explore all features, test the multi-agent dashboard, and interact with the AI tutor.

---

## Local Development Setup

If you want to run the project locally for development or testing, follow these steps.

### Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **pnpm** v10+ ([Install](https://pnpm.io/installation))
- **MySQL** v8+ or compatible database ([Download](https://www.mysql.com/downloads/))

Verify installations:
```bash
node --version
pnpm --version
mysql --version
```

### Step 1: Extract and Navigate

```bash
unzip imls-multi-agent-system.zip
cd imls-multi-agent-system
```

### Step 2: Install Dependencies

```bash
pnpm install
```

This installs all required packages including React, Express, tRPC, Drizzle ORM, and LLM integration libraries.

### Step 3: Set Up Database

**Create a MySQL database:**

```bash
mysql -u root -p
```

Then in the MySQL prompt:
```sql
CREATE DATABASE imls_db;
CREATE USER 'imls_user'@'localhost' IDENTIFIED BY 'imls_password_123';
GRANT ALL PRIVILEGES ON imls_db.* TO 'imls_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Run migrations:**

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

This creates all 14 database tables with proper relationships.

### Step 4: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=mysql://imls_user:imls_password_123@localhost:3306/imls_db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# OAuth (optional - for Manus integration)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# LLM Integration (optional - for AI features)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key

# Owner Info (optional)
OWNER_NAME=Supervisor
OWNER_OPEN_ID=supervisor-id
```

**Note:** If you don't have Manus credentials, the core features will still work with local authentication.

### Step 5: Start Development Server

```bash
pnpm dev
```

You should see output like:
```
[OAuth] Initialized with baseURL: https://api.manus.im
Server running on http://localhost:3000/
```

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Project Structure

```
imls-multi-agent-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and hooks
│   │   └── index.css      # Global styles
│   └── index.html
├── server/                # Express backend
│   ├── agents.ts          # Multi-agent system
│   ├── db.ts              # Database queries
│   ├── routers.ts         # tRPC API routes
│   └── _core/             # Framework utilities
├── drizzle/               # Database schema
│   ├── schema.ts          # Table definitions
│   └── migrations/        # SQL migrations
├── shared/                # Shared types and constants
├── package.json
├── tailwind.config.js     # Tailwind CSS config
├── vite.config.ts         # Vite build config
└── tsconfig.json          # TypeScript config
```

---

## Key Features to Test

### 1. Multi-Agent Dashboard
Navigate to `/dashboard` to see the four agents in action:
- **Student Agent** - Manages student profiles and learning preferences
- **Tutor Agent** - Provides AI-powered tutoring and feedback
- **Content Agent** - Manages course library and learning materials
- **Assessment Agent** - Handles quizzes and performance evaluation

### 2. Student Learning Experience
- Create a student profile with learning preferences
- View AI-generated personalized learning paths
- Browse course library
- Take interactive quizzes with auto-grading
- Chat with the AI tutor
- Track progress with visual analytics

### 3. Admin Panel
Navigate to `/admin` (if authenticated as admin) to:
- View all registered students
- Monitor system-wide analytics
- Check agent activity logs
- Review system performance metrics

---

## Available Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Building
pnpm build            # Build for production
pnpm start            # Run production build

# Database
pnpm drizzle-kit generate   # Generate migrations
pnpm drizzle-kit migrate    # Apply migrations

# Code Quality
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier
pnpm test             # Run unit tests with Vitest

# Utilities
pnpm db:push          # Generate and apply migrations
```

---

## Troubleshooting

### Issue: Database Connection Failed
**Solution:** Verify MySQL is running and credentials in `.env.local` are correct.
```bash
mysql -u imls_user -p imls_password_123 -h localhost
```

### Issue: Port 3000 Already in Use
**Solution:** Change the port or kill the process using it.
```bash
# On macOS/Linux
lsof -i :3000
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Dependencies Installation Fails
**Solution:** Clear cache and reinstall.
```bash
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: TypeScript Errors
**Solution:** Ensure all dependencies are installed and types are correct.
```bash
pnpm check
```

---

## API Documentation

The project uses **tRPC** for type-safe API calls. All procedures are defined in `server/routers.ts`.

### Example API Calls

**Get Current User:**
```typescript
const user = await trpc.auth.me.useQuery();
```

**Create Student Profile:**
```typescript
const profile = await trpc.student.createProfile.useMutation({
  skillLevel: 'intermediate',
  learningStyle: 'visual',
  interests: ['AI', 'Web Development']
});
```

**Get Learning Path:**
```typescript
const path = await trpc.tutor.generateLearningPath.useQuery({
  studentId: 1
});
```

**Submit Quiz:**
```typescript
const result = await trpc.assessment.submitQuiz.useMutation({
  quizId: 1,
  answers: { q1: 'A', q2: 'B' }
});
```

---

## Performance Optimization

The project includes several optimizations:

- **Code Splitting:** Lazy-loaded routes reduce initial bundle size
- **Database Indexing:** Optimized queries on frequently accessed tables
- **Caching:** tRPC query caching reduces redundant API calls
- **CSS Optimization:** Tailwind CSS purges unused styles in production
- **Image Optimization:** Responsive images with proper sizing

---

## Deployment

### Deploy to Production (Manus)

The project is configured for deployment on Manus:

```bash
# Build for production
pnpm build

# Deploy (if using Manus CLI)
manus deploy
```

### Deploy to Other Platforms

The project can also be deployed to:
- **Vercel** - Recommended for Next.js-like projects
- **Railway** - Full-stack deployment
- **Render** - Simple deployment with PostgreSQL support
- **AWS** - EC2, Lambda, or Amplify
- **Docker** - Containerized deployment

---

## Support and Questions

For issues or questions:

1. Check the **TECHNICAL_DOCUMENTATION.md** for detailed architecture
2. Review **README.md** for project overview
3. Examine the code comments in `server/agents.ts` for multi-agent logic
4. Check `drizzle/schema.ts` for database structure

---

## Next Steps

After setup, consider:

1. **Customize the UI** - Modify colors and branding in `client/src/index.css`
2. **Add More Agents** - Extend the multi-agent system in `server/agents.ts`
3. **Integrate External APIs** - Connect to video platforms, payment systems, etc.
4. **Add Authentication** - Implement user login with email/password or OAuth
5. **Deploy** - Push to production using the deployment guide above

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | 18.x | 20.x LTS |
| pnpm | 8.x | 10.x |
| MySQL | 5.7 | 8.0+ |
| RAM | 2GB | 4GB+ |
| Disk Space | 500MB | 2GB |

---

## License

This project is provided as-is for educational and development purposes.

---

**Last Updated:** June 2026
**Version:** 1.0.0
