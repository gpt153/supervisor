# Consilio - Product Requirements Document

**Version:** 1.0
**Date:** 2026-01-07
**Status:** In Development (65% Complete - Backend Foundation + Auth + Email)
**Repository:** https://github.com/gpt153/consilio

---

## 1. Executive Summary

Consilio is a modern case management platform designed specifically for private Swedish consulting firms that provide consultant-supported foster care (konsulentföretag som bedriver konsulentstödd familjehemsvård). The system serves as an operational hub that complements existing journal systems by streamlining communication, documentation, and case coordination between consultants, foster homes, social workers, and clients.

The MVP delivers a backend API with authentication, case management, and email-based communication, paired with a responsive web interface. The core value proposition is **time savings through automation** - reducing administrative burden by 60-70% through AI-assisted documentation, automated workflows, and centralized communication - while maintaining the highest standards of data privacy through PostgreSQL Row-Level Security and strict GDPR compliance.

**MVP Goal:** Deliver a beta-ready platform where consultants can manage cases, communicate via email notifications, and provide 24/7 support to foster homes, with plans to add AI features (anonymization, document generation, smart matching) in future phases based on beta tester feedback.

---

## 2. Mission

**Product Mission Statement:**
Empower consultants at private foster care consulting firms to spend more time supporting foster families and placed children, and less time on administration, by providing an operationally trustworthy platform where communication never gets lost, documentation is a byproduct of work, and privacy is built-in from the foundation.

**Core Principles:**

1. **Privacy by Design** - PostgreSQL Row-Level Security ensures data isolation at the database level. Future AI features will never see real identities - only anonymized data.

2. **Human-in-the-Loop** - AI assists but never decides. All AI-generated content requires human review before export to external systems.

3. **Complement, Don't Replace** - Consilio integrates with existing journal systems rather than replacing them. It handles operational communication and workflow, while formal records remain in official systems.

4. **Mobile-First for Families** - Foster homes need simple, accessible interfaces. The web UI is responsive and designed for mobile use, with future native apps planned.

5. **Stability Over Features** - Beta testers need a working system. MVP focuses on core functionality that works reliably rather than incomplete advanced features.

---

## 3. Target Users

### Primary User Personas

#### A) Consultant (Konsulent) - Primary User
- **Role:** Case manager employed by private foster care consulting firms (konsulentföretag som bedriver konsulentstödd familjehemsvård)
- **Technical Comfort:** Medium - comfortable with web applications, email, basic office tools
- **Key Needs:**
  - Manage 15-30 cases simultaneously
  - Quick access to case history and communication threads
  - Automated reminders for deadlines (reports, meetings)
  - Reduce time spent on documentation from 8 hours/week to 2 hours/week
  - Easy communication with foster homes, social workers, and clients
- **Pain Points:**
  - Forgetting important details from conversations
  - Missing deadlines for monthly reports
  - Spending evenings writing documentation instead of family time
  - Switching between multiple systems (journal, email, phone, notes)

#### B) Foster Home (Familjehem) - Primary User
- **Role:** Family contracted by consulting firms to provide care for placed children/youth
- **Technical Comfort:** Low to Medium - uses smartphones, social media, messaging apps
- **Key Needs:**
  - Quick answers to everyday questions (behavior issues, school, health)
  - Clear guidance on when to escalate to consultant
  - Easy communication channel with consultant
  - Understanding what's expected in reports/updates
- **Pain Points:**
  - Feeling alone when issues arise (especially evenings/weekends)
  - Uncertainty about what constitutes an "emergency"
  - Difficulty reaching consultant by phone
  - Unclear expectations for documentation

#### C) Social Worker (Socialsekreterare) - External Stakeholder
- **Role:** Municipal employee who orders placements from consulting firms and requires regular reporting. They are clients of the consulting firms, not primary system users.
- **Technical Comfort:** Medium - uses government systems, email
- **Key Needs:**
  - Timely, structured reports from consultants at the consulting firms
  - Clear case status visibility for placements they've ordered
  - Evidence of proper case management for municipal audits
- **Pain Points:**
  - Delayed or incomplete reports from consulting firms
  - Difficulty tracking progress of placements they've ordered
  - Limited visibility into day-to-day case management by consulting firms

#### D) Client (Klient) - Secondary User (Future)
- **Role:** Placed child/youth (age-appropriate access)
- **Technical Comfort:** High for teens (smartphones, apps), Low for children
- **Key Needs:**
  - Understanding their case status
  - Communication with consultant
  - Feeling included in decisions
- **Pain Points:**
  - Feeling powerless and uninformed
  - Difficulty communicating concerns
  - Lack of transparency

---

## 4. MVP Scope

### ✅ In Scope - Core Functionality

#### Backend Foundation
- ✅ Node.js 20 + TypeScript + Fastify web framework
- ✅ PostgreSQL 16 database with Row-Level Security (RLS)
- ✅ Prisma ORM with strict TypeScript types
- ✅ JWT-based authentication (access + refresh tokens)
- ✅ Email verification and password reset flows
- ✅ Role-based access control (ADMIN, CONSULTANT, SUPERVISOR, CASE_WORKER)
- ✅ User management (register, login, profile)
- ✅ Organization management (multi-tenant architecture)
- ✅ Case management CRUD operations
- ✅ Audit logging (immutable, RLS-protected)

#### Email Integration (Critical for Beta)
- ✅ SMTP integration via Nodemailer
- ✅ Transactional emails (account verification, password reset, welcome)
- ✅ Notification emails (case updates, task assignments)
- ✅ Email templates (HTML + plain text)
- ✅ Email-based communication between users

#### Web Frontend
- ✅ React 18 + Vite + TypeScript
- ✅ Authentication UI (login, register, email verification, password reset)
- ✅ Dashboard with case list and filters
- ✅ Case detail view (timeline, communication, documents, tasks)
- ✅ Responsive design (mobile-first for foster homes)
- ✅ Task management UI
- ✅ Form validation with React Hook Form + Zod

#### Security & Compliance
- ✅ PostgreSQL Row-Level Security policies (organization isolation)
- ✅ Encrypted data at rest and in transit
- ✅ Audit logging for all sensitive operations
- ✅ GDPR-compliant data handling
- ✅ Environment-based configuration
- ✅ Input validation and sanitization

#### DevOps
- ✅ Docker + Docker Compose setup
- ✅ Automated database migrations
- ✅ Health check endpoints
- ✅ Testing infrastructure (Jest for backend, Vitest for frontend)

#### AI Features (MVP CORE - Required for Beta Time-Savings Validation)
- ✅ Claude AI integration (infrastructure complete)
- 🔄 **Månadsrapporter (Monthly Reports)** - AI generation from case data
- 🔄 **Handledarrapporter (Supervisor Reports)** - AI generation for foster home supervision
- 🔄 **Journalanteckningar (Journal Entries)** - AI-assisted case notes from conversations
- 🔄 **Email Reply Suggestions** - AI suggests responses to incoming emails
- 🔄 **Calendar Event Extraction** - AI suggests calendar events from email content
- 🔄 **Meeting Notes Generation** - AI transcribes meetings into structured notes

**Critical:** Without AI document generation, beta testers cannot evaluate the "60-70% time savings" value proposition. These features are REQUIRED for MVP, not post-MVP.

### ❌ Out of Scope - Future Phases (Post-Beta)

#### Advanced AI Features (Post-Beta)
- ❌ Anonymization/de-anonymization engine for AI safety
- ❌ AI-assisted matching (placement requests → foster homes)
- ❌ 24/7 AI chatbot for foster homes (rådgivnings-AI)
- ❌ Transcript processing (video meetings → notes)
- ❌ Quality control AI (document review, completeness checks)

#### Real-Time Communication
- ❌ In-app real-time chat (WebSocket-based)
- ❌ Video meeting integration (Twilio/Daily)
- ❌ Push notifications (mobile)
- ❌ Read receipts and typing indicators

#### Mobile Applications
- ❌ Native iOS app
- ❌ Native Android app
- ❌ Offline-first architecture

#### Advanced Integrations
- ❌ Journal system API integration (bidirectional sync)
- ❌ SSIL (placement request system) integration
- ❌ BankID authentication
- ❌ Calendar integration (Outlook, Google Calendar)

#### Advanced Case Management
- ❌ Document version control
- ❌ Collaborative editing
- ❌ Template library for reports
- ❌ Advanced search (semantic, full-text)
- ❌ Analytics dashboard

---

## 5. User Stories

### Primary User Stories

**1. As a consultant, I want to register an account and verify my email, so that I can securely access the platform.**

*Example:* Emma, a new consultant at a social services firm, receives an invitation email. She clicks the link, sets her password, and verifies her email. The system automatically assigns her to her organization and grants CONSULTANT role permissions.

**2. As a consultant, I want to view all my assigned cases in a dashboard, so that I can prioritize my work and see what needs attention.**

*Example:* Johan logs in Monday morning and sees a dashboard with 22 active cases. Cases with upcoming report deadlines are highlighted. He can filter by priority (HIGH, MEDIUM, LOW) and status (ACTIVE, PENDING, CLOSED).

**3. As a consultant, I want to create a new case and assign it to a foster home, so that I can start managing a placement.**

*Example:* Maria receives a new placement request from the municipality. She creates a case in Consilio with client details (anonymized in future), assigns it to the "Andersson Family" foster home, sets priority to HIGH, and adds initial notes. The system automatically sends an email notification to the foster home.

**4. As a consultant, I want to receive email notifications when a foster home sends a message, so that I can respond promptly to urgent situations.**

*Example:* At 8 PM, consultant Lisa receives an email: "New message from Johansson Family regarding Case #CS-2024-0142." The email includes a preview of the message and a link to the case. Lisa can respond via the web interface or email.

**5. As a foster home, I want to submit updates about the child's wellbeing via a simple form, so that my consultant stays informed without requiring phone calls.**

*Example:* The Karlsson family uses their phone to access Consilio. They fill out a weekly check-in form: "School: Attending regularly. Behavior: Had one argument with sibling. Health: Slight cold, recovering." The system timestamps the entry and notifies the consultant.

**6. As a consultant, I want to see a timeline of all case events (messages, updates, meetings, documents), so that I can quickly understand case history before a meeting.**

*Example:* Before a quarterly review with social services, Anna opens the case timeline and sees: 3 months of weekly check-ins, 2 school meeting notes, 1 incident report, and 4 email exchanges. She exports this as a PDF for the meeting.

**7. As an administrator, I want to manage users and assign roles, so that I can control access to sensitive case information.**

*Example:* Admin Karin adds a new supervisor to the organization. She assigns SUPERVISOR role, which grants read access to all cases but limits write access. The supervisor can view cases for quality assurance but cannot modify client data.

**8. As a consultant, I want to reset my password securely if I forget it, so that I can regain access without IT support.**

*Example:* Peter forgets his password. He clicks "Forgot Password," enters his email, and receives a secure reset link valid for 1 hour. He sets a new password and the system invalidates his old refresh tokens for security.

### Technical User Stories

**9. As a system administrator, I want database-level data isolation via Row-Level Security, so that organizations cannot access each other's data even if application logic fails.**

*Example:* Organization A's consultant attempts to directly query the database (SQL injection or compromised credentials). RLS policies automatically filter results to only show Organization A's data, preventing data breaches.

**10. As a developer, I want comprehensive audit logs for all case access and modifications, so that we can demonstrate GDPR compliance during audits.**

*Example:* During a regulatory audit, the compliance officer exports audit logs showing: User ID, Action (VIEW_CASE, UPDATE_CASE), Timestamp, IP Address, and Resource ID. Logs prove that only authorized users accessed sensitive client data.

---

## 6. Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  React Web App (Vite + TypeScript)                          │
│  - Authentication UI                                         │
│  - Dashboard & Case Management                              │
│  - Responsive Design (Mobile-First)                         │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS (REST API)
┌─────────────────▼───────────────────────────────────────────┐
│                  Backend API Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Fastify Server (Node.js 20 + TypeScript)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware Stack                                    │   │
│  │  - JWT Authentication                                │   │
│  │  - RLS Context Injection                            │   │
│  │  - CORS + Helmet Security                           │   │
│  │  - Rate Limiting                                     │   │
│  │  - Input Validation (Zod)                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Feature Modules                                     │   │
│  │  - auth/     (JWT, password, email verification)    │   │
│  │  - users/    (user management)                       │   │
│  │  - organizations/ (multi-tenant)                     │   │
│  │  - cases/    (case CRUD, timeline)                   │   │
│  │  - email/    (transactional + notifications)         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │ Prisma ORM
┌─────────────────▼───────────────────────────────────────────┐
│              Database Layer (PostgreSQL 16)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Core Tables (RLS Enabled)                          │   │
│  │  - users                                             │   │
│  │  - organizations                                     │   │
│  │  - cases                                             │   │
│  │  - refresh_tokens                                    │   │
│  │  - password_resets                                   │   │
│  │  - audit_logs (immutable)                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Row-Level Security (RLS) Policies                   │   │
│  │  - Organization isolation (users see only their org) │   │
│  │  - Role-based filtering (consultants see assigned)   │   │
│  │  - Audit log protection (no updates/deletes)        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Future: Per-Case Schemas (case_{uuid})             │   │
│  │  - messages, documents, meetings                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
consilio/
├── backend/                         # Backend API
│   ├── src/
│   │   ├── config/                  # Configuration
│   │   │   ├── environment.ts       # Zod-based env validation
│   │   │   └── database.ts          # Prisma client + RLS helpers
│   │   ├── modules/                 # Feature modules
│   │   │   ├── auth/                # Authentication
│   │   │   │   ├── jwt.ts           # JWT utilities
│   │   │   │   ├── password.ts      # Password hashing
│   │   │   │   ├── auth.service.ts  # Auth business logic
│   │   │   │   ├── auth.controller.ts # Route handlers
│   │   │   │   ├── auth.routes.ts   # Route registration
│   │   │   │   └── auth.schemas.ts  # Zod validation
│   │   │   ├── users/               # User management
│   │   │   ├── organizations/       # Organization management
│   │   │   ├── cases/               # Case management
│   │   │   └── email/               # Email service
│   │   ├── middleware/              # Fastify middleware
│   │   │   ├── auth.ts              # JWT verification + RLS context
│   │   │   └── error-handler.ts     # Global error handling
│   │   ├── utils/                   # Shared utilities
│   │   ├── types/                   # TypeScript types
│   │   └── server.ts                # Fastify server entry point
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── migrations/              # SQL migrations
│   │   │   └── 001_rls_policies.sql # RLS setup
│   │   └── seed.ts                  # Test data seeding
│   ├── tests/
│   │   ├── unit/                    # Unit tests
│   │   └── integration/             # Integration tests
│   ├── docker-compose.yml           # Docker services
│   ├── Dockerfile                   # Production image
│   ├── Dockerfile.dev               # Development image (hot reload)
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/                        # React Web App (Future)
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API client
│   │   ├── utils/                   # Utilities
│   │   └── App.tsx                  # App entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── docs/                            # Documentation
├── .github/                         # GitHub Actions (future)
├── PROGRESS.md                      # Development progress tracking
├── PRD.md                           # This document
└── README.md                        # Project overview
```

### Key Design Patterns

#### 1. Module-Based Architecture
Each feature (auth, users, cases, email) is a self-contained module with:
- Service layer (business logic)
- Controller layer (HTTP handlers)
- Routes (Fastify route registration)
- Schemas (Zod validation)
- Tests (unit + integration)

#### 2. Row-Level Security (RLS) Pattern
```typescript
// Middleware sets RLS context before each request
async function authenticate(request: FastifyRequest) {
  const token = verifyAccessToken(request.headers.authorization);
  const user = await getUserById(token.userId);

  // Set PostgreSQL session variables for RLS
  await setRequestContext({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role
  });

  request.user = user; // Attach to request for controllers
}

// RLS policies automatically filter queries
// Example: SELECT * FROM cases;
// → Returns only cases where organization_id = current_setting('app.organization_id')
```

#### 3. Singleton Pattern for Prisma Client
```typescript
// Prevent multiple Prisma Client instances
let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
    });
  }
  return prisma;
}
```

#### 4. Service Layer Pattern
Separate business logic from HTTP concerns:
```typescript
// auth.service.ts - Pure business logic
export async function registerUser(data: RegisterInput) {
  const passwordHash = await hashPassword(data.password);
  const verificationToken = generateToken();

  const user = await prisma.user.create({
    data: { ...data, passwordHash, verificationToken }
  });

  await emailService.sendVerificationEmail(user.email, verificationToken);
  return user;
}

// auth.controller.ts - HTTP adapter
export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = RegisterSchema.parse(request.body);
  const user = await registerUser(data);
  return reply.status(201).send({ userId: user.id });
}
```

#### 5. Environment Validation Pattern
Fail-fast on startup if configuration is invalid:
```typescript
// config/environment.ts
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string(),
  // ... 40+ validated variables
});

export const env = EnvSchema.parse(process.env); // Throws on invalid config
```

---

## 7. Core Features

### Feature 1: Authentication & Authorization

**Purpose:** Secure user access with JWT-based authentication and role-based authorization.

**Operations:**
- User registration with email verification
- Login with email + password
- Access token + refresh token flow (15 min + 7 day expiry)
- Password reset via email
- Role-based access control (ADMIN, CONSULTANT, SUPERVISOR, CASE_WORKER)
- Session management (token revocation on logout)

**Key Features:**
- bcrypt password hashing (12 rounds)
- Email verification required before full access
- Secure password reset tokens (1-hour expiry, one-time use)
- Refresh token rotation (security best practice)
- JWT secret validation (minimum 32 characters)
- Rate limiting (prevent brute force attacks)

**API Endpoints:**
- `POST /api/v1/auth/register` - Create account
- `GET /api/v1/auth/verify/:token` - Verify email
- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Revoke tokens
- `POST /api/v1/auth/password-reset/request` - Request reset email
- `POST /api/v1/auth/password-reset/confirm` - Set new password

---

### Feature 2: Case Management

**Purpose:** Central hub for managing social care cases with timeline, communication, and task tracking.

**Operations:**
- Create case with client details, type, priority, status
- Assign case to consultant
- Update case information
- View case timeline (chronological event log)
- Filter cases by status, priority, assigned user
- Search cases by case number or title

**Key Features:**
- Automatic case number generation (e.g., CS-2024-0142)
- Case status workflow (PENDING → ACTIVE → CLOSED)
- Priority levels (LOW, MEDIUM, HIGH, URGENT)
- Case types (FOSTER_CARE, ADOPTION, SUPPORT_SERVICES, INVESTIGATION, CRISIS, OTHER)
- Assignment tracking (consultant + creator)
- Organization isolation via RLS
- Audit logging for all case modifications

**Data Model:**
```typescript
interface Case {
  id: string;              // UUID
  caseNumber: string;      // Auto-generated (CS-YYYY-NNNN)
  title: string;           // Brief description
  description: string;     // Detailed case information
  type: CaseType;          // FOSTER_CARE | ADOPTION | ...
  status: CaseStatus;      // PENDING | ACTIVE | CLOSED
  priority: CasePriority;  // LOW | MEDIUM | HIGH | URGENT
  organizationId: string;  // Multi-tenant isolation
  assignedToId: string;    // Consultant responsible
  createdById: string;     // Who created the case
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Feature 3: Email Service

**Purpose:** Reliable transactional and notification emails for user communication.

**Operations:**
- Send email verification emails
- Send password reset emails
- Send welcome emails (after verification)
- Send case notification emails (assignments, updates)
- Future: Weekly digest emails

**Key Features:**
- SMTP configuration (Gmail, SendGrid, Postmark, custom)
- HTML + plain text templates
- Template variables ({{userName}}, {{caseNumber}}, etc.)
- Singleton transporter pattern (connection pooling)
- Error handling and logging
- Development mode (log emails instead of sending)

**Email Templates:**

1. **Verification Email**
   - Subject: "Verify your Consilio account"
   - CTA: Verification link (1-hour expiry)
   - Styling: Professional, branded

2. **Password Reset Email**
   - Subject: "Reset your Consilio password"
   - CTA: Reset link (1-hour expiry, one-time use)
   - Security note: "If you didn't request this, ignore this email"

3. **Welcome Email**
   - Subject: "Welcome to Consilio!"
   - Content: Getting started guide, support links
   - Sent after email verification

4. **Case Notification Email**
   - Subject: "New case assigned: CS-2024-0142"
   - Content: Case summary, link to case detail
   - Future: Weekly digest option

---

### Feature 4: Multi-Tenant Organization Management

**Purpose:** Support multiple consulting firms and municipalities on a single platform.

**Operations:**
- Create organization
- Update organization details
- Assign users to organization
- View organization members
- Future: Organization-level settings and policies

**Key Features:**
- Organization types (MUNICIPALITY, REGION, PRIVATE, NON_PROFIT)
- Organization number (Swedish org. number format)
- Address and contact information
- Strict data isolation via RLS (users see only their org's data)
- Audit logging for organization changes

---

### Feature 5: User Management

**Purpose:** Manage users within an organization with role-based permissions.

**Operations:**
- View user profile
- Update user profile (name, email)
- Change password
- List organization members (admin only)
- Update user roles (admin only)
- Deactivate/suspend users (admin only)

**Key Features:**
- User roles: ADMIN, CONSULTANT, SUPERVISOR, CASE_WORKER
- User status: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
- Profile fields: full name, email, phone (optional)
- Role-based access control (admins can modify, others can view)
- Audit logging for user changes

---

### Feature 6: Audit Logging

**Purpose:** Immutable audit trail for compliance and security investigations.

**Operations:**
- Automatic logging of sensitive operations
- Query audit logs (admin only)
- Export audit logs for compliance audits
- Retention policies (future)

**Key Features:**
- Logged actions: LOGIN, LOGOUT, VIEW_CASE, UPDATE_CASE, DELETE_CASE, EXPORT_DOCUMENT, etc.
- Logged resources: USER, CASE, ORGANIZATION, DOCUMENT, etc.
- Metadata: IP address, user agent, request details (JSONB)
- Immutable records (RLS policy prevents updates/deletes)
- Organization isolation (users see only their org's logs)

---

## 8. Technology Stack

### Backend Technologies

**Runtime & Framework:**
- **Node.js:** 20 LTS (current stable)
- **TypeScript:** 5.5.4 (strict mode, no `any` types)
- **Fastify:** 4.26.0 (fast, TypeScript-first web framework)

**Database:**
- **PostgreSQL:** 16 Alpine (latest stable with RLS support)
- **Prisma ORM:** 5.9.0 (type-safe database access)
- **pg:** PostgreSQL client (via Prisma)

**Authentication & Security:**
- **JWT:** `@fastify/jwt@8.0.1` (access + refresh tokens)
- **bcrypt:** `5.1.1` (password hashing, 12 rounds)
- **Helmet:** `@fastify/helmet@11.1.1` (security headers)
- **CORS:** `@fastify/cors@9.0.1` (cross-origin resource sharing)
- **Rate Limit:** `@fastify/rate-limit@9.1.0` (100 req/15min default)

**Validation & Documentation:**
- **Zod:** `3.23.8` (runtime schema validation)
- **Swagger:** `@fastify/swagger@8.15.0` (OpenAPI 3.0 docs)
- **Swagger UI:** `@fastify/swagger-ui@4.1.0` (interactive API docs)

**Email:**
- **Nodemailer:** `6.9.14` (SMTP email sending)

**Logging:**
- **Pino:** `8.19.0` (structured JSON logging)
- **pino-pretty:** `11.2.2` (human-readable dev logs)

**Development & Testing:**
- **tsx:** `4.16.2` (hot reload TypeScript execution)
- **Jest:** `29.7.0` (testing framework)
- **ts-jest:** `29.2.4` (Jest TypeScript support)
- **ESLint:** `8.57.0` (linting with TypeScript rules)
- **Prettier:** `3.3.3` (code formatting)

---

### Frontend Technologies (Planned)

**Framework:**
- **React:** 18.2.0 (UI library)
- **Vite:** 5.0.0 (build tool, fast HMR)
- **TypeScript:** 5.5.4 (type safety)

**UI Components:**
- **Tailwind CSS:** 3.4.0 (utility-first styling)
- **Headless UI:** 1.7.0 (accessible components) OR **shadcn/ui** (component library)
- **Lucide React:** Icons

**State Management:**
- **React Query (TanStack Query):** 5.0.0 (server state, caching, optimistic updates)
- **Zustand:** 4.4.0 (client state, auth, UI state)

**Forms & Validation:**
- **React Hook Form:** 7.48.0 (form management)
- **Zod:** 3.23.8 (schema validation, shared with backend)

**Routing:**
- **React Router:** 6.20.0 (client-side routing)

**Development:**
- **Vitest:** 1.0.0 (unit testing)
- **Testing Library:** `@testing-library/react@14.0.0` (component testing)
- **ESLint:** 8.57.0 (linting)
- **Prettier:** 3.3.3 (formatting)

---

### DevOps & Infrastructure

**Containerization:**
- **Docker:** 24+ (containerization)
- **Docker Compose:** 2.0+ (multi-container orchestration)

**Database Migrations:**
- **Prisma Migrate:** Built-in migration tool
- **SQL:** Custom RLS policies (001_rls_policies.sql)

**CI/CD (Future):**
- **GitHub Actions:** Automated testing, linting, deployment

**Hosting (Future):**
- **Backend:** VPS (DigitalOcean, Hetzner) or managed platform (Render, Railway)
- **Database:** Managed PostgreSQL (Supabase, Neon, or self-hosted)
- **Frontend:** Vercel, Netlify, or Cloudflare Pages

---

### Optional Dependencies

**Email Services (Choose One):**
- **Gmail SMTP:** Free tier (500 emails/day)
- **SendGrid:** 100 emails/day free, transactional focus
- **Postmark:** $15/month for 10,000 emails, excellent deliverability
- **AWS SES:** Pay-as-you-go, $0.10 per 1,000 emails

**Future AI Integration:**
- **OpenAI API:** GPT-4 for document generation (anonymized input)
- **Local LLM:** Ollama (privacy-first, runs on-premise)

**Monitoring (Future):**
- **Sentry:** Error tracking
- **Prometheus + Grafana:** Metrics and dashboards

---

## 9. Security & Configuration

### Authentication & Authorization

**Authentication Strategy:**
- JWT-based (stateless, scalable)
- Access tokens: 15-minute expiry (short-lived)
- Refresh tokens: 7-day expiry (stored in database, revocable)
- Token rotation: New refresh token issued on each refresh

**Authorization Strategy:**
- Role-Based Access Control (RBAC)
- Roles: ADMIN, CONSULTANT, SUPERVISOR, CASE_WORKER
- Middleware checks role before sensitive operations
- Future: Fine-grained permissions (e.g., can_export_documents)

**RLS Context Injection:**
```typescript
// Middleware sets PostgreSQL session variables
await prisma.$executeRaw`
  SELECT set_request_context(
    ${user.id}::UUID,
    ${user.organizationId}::UUID,
    ${user.role}::TEXT
  );
`;

// All queries automatically filtered by RLS policies
const cases = await prisma.case.findMany(); // Returns only user's org cases
```

---

### Configuration Management

**Environment Variables (.env):**

```bash
# Database
DATABASE_URL=postgresql://consilio:password@localhost:5432/consilio_db

# JWT
JWT_SECRET=your-secret-key-min-32-chars-generated-with-openssl
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@consilio.se

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173  # Frontend URL
RATE_LIMIT_MAX=100                  # Requests per window
RATE_LIMIT_WINDOW=15m               # Window duration

# Application
NODE_ENV=development                # development | production
PORT=3000
LOG_LEVEL=info                      # error | warn | info | debug

# Swagger (disable in production)
SWAGGER_ENABLED=true                # Only in development
```

**Validation:**
- All variables validated with Zod on startup
- Application fails fast if config is invalid
- Secrets validated (JWT_SECRET minimum 32 chars)

---

### Security Scope

#### ✅ In-Scope Security Features

**Application Security:**
- ✅ Input validation (Zod schemas on all endpoints)
- ✅ Output sanitization (prevent XSS)
- ✅ Parameterized queries (Prisma ORM, no SQL injection)
- ✅ CORS whitelist (prevent unauthorized domains)
- ✅ Helmet security headers (CSP, X-Frame-Options, etc.)
- ✅ Rate limiting (prevent brute force, DDoS)

**Authentication Security:**
- ✅ Password hashing (bcrypt, 12 rounds, salted)
- ✅ JWT signature verification (HMAC SHA-256)
- ✅ Token expiry enforcement
- ✅ Refresh token revocation on logout
- ✅ Email verification required for activation
- ✅ Secure password reset (1-hour expiry, one-time tokens)

**Data Security:**
- ✅ PostgreSQL Row-Level Security (organization isolation)
- ✅ Encrypted connections (TLS for database, HTTPS for API)
- ✅ Audit logging (immutable, all sensitive operations)
- ✅ GDPR compliance (data minimization, user rights)

**Session Security:**
- ✅ HTTP-only cookies (future, if using cookie-based auth)
- ✅ CSRF protection (future, if needed)
- ✅ Session timeout (15-minute access token expiry)

#### ❌ Out-of-Scope (Future Enhancements)

- ❌ Multi-factor authentication (2FA via TOTP/SMS)
- ❌ BankID integration (Swedish national ID system)
- ❌ IP whitelisting
- ❌ Penetration testing (third-party security audit)
- ❌ DDoS protection (Cloudflare or similar)
- ❌ Database encryption at rest (beyond PostgreSQL defaults)
- ❌ Hardware security modules (HSM) for key storage

---

### Deployment Considerations

**Development Environment:**
```bash
docker-compose up -d          # PostgreSQL + Backend (hot reload)
npm run dev                   # Frontend dev server
```

**Production Environment (Future):**
```bash
docker-compose --profile production up -d
# OR deploy to managed platform (Render, Railway, etc.)
```

**Database Backups:**
- Daily automated backups (pg_dump)
- Point-in-time recovery (PITR) with WAL archiving
- Backup retention: 30 days

**Health Checks:**
- `GET /health` - Basic health (200 OK)
- `GET /health/db` - Database connectivity check
- Docker health checks configured

**Secrets Management:**
- Environment variables (never commit .env to git)
- Production: Use secret management service (AWS Secrets Manager, HashiCorp Vault)
- Rotate JWT_SECRET every 90 days

---

## 10. API Specification

### Base URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.consilio.se/api/v1` (future)

### Authentication

**All protected endpoints require JWT in Authorization header:**
```
Authorization: Bearer <access_token>
```

---

### Authentication Endpoints

#### `POST /api/v1/auth/register`
**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "emma.svensson@example.com",
  "password": "SecurePass123!",
  "fullName": "Emma Svensson",
  "organizationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):**
```json
{
  "userId": "7d8c6b4a-1234-5678-9abc-def012345678",
  "message": "Registration successful. Please check your email to verify your account."
}
```

**Validation:**
- Email: Valid format, unique
- Password: Min 8 chars, uppercase, lowercase, number, special char
- Full name: 2-100 chars
- Organization ID: Valid UUID, organization must exist

---

#### `POST /api/v1/auth/login`
**Description:** Authenticate user and receive tokens

**Request Body:**
```json
{
  "email": "emma.svensson@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "7d8c6b4a-1234-5678-9abc-def012345678",
    "email": "emma.svensson@example.com",
    "fullName": "Emma Svensson",
    "role": "CONSULTANT",
    "status": "ACTIVE",
    "organizationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Email not verified
- `403 Forbidden` - Account suspended

---

#### `POST /api/v1/auth/refresh`
**Description:** Refresh access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // New refresh token
}
```

---

#### `POST /api/v1/auth/logout`
**Description:** Revoke refresh token and end session

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

#### `GET /api/v1/auth/verify/:token`
**Description:** Verify email address using token from verification email

**Response (200 OK):**
```json
{
  "message": "Email verified successfully. You can now log in."
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or expired token
- `400 Bad Request` - Email already verified

---

#### `POST /api/v1/auth/password-reset/request`
**Description:** Request password reset email

**Request Body:**
```json
{
  "email": "emma.svensson@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Note:** Always returns success (prevent email enumeration)

---

#### `POST /api/v1/auth/password-reset/confirm`
**Description:** Reset password using token from email

**Request Body:**
```json
{
  "token": "abc123def456...",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successful. You can now log in with your new password."
}
```

---

### Case Management Endpoints (Future)

#### `GET /api/v1/cases`
**Description:** List cases (filtered by organization via RLS)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): PENDING | ACTIVE | CLOSED
- `priority` (optional): LOW | MEDIUM | HIGH | URGENT
- `assignedTo` (optional): User ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "cases": [
    {
      "id": "a1b2c3d4-...",
      "caseNumber": "CS-2024-0142",
      "title": "Foster care placement - Johansson family",
      "type": "FOSTER_CARE",
      "status": "ACTIVE",
      "priority": "HIGH",
      "assignedTo": {
        "id": "7d8c6b4a-...",
        "fullName": "Emma Svensson"
      },
      "createdAt": "2024-11-15T10:30:00Z",
      "updatedAt": "2024-12-01T14:22:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

#### `POST /api/v1/cases`
**Description:** Create a new case

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Foster care placement - Karlsson family",
  "description": "New placement request for 12-year-old, requires experienced foster home",
  "type": "FOSTER_CARE",
  "priority": "HIGH",
  "assignedToId": "7d8c6b4a-1234-5678-9abc-def012345678"
}
```

**Response (201 Created):**
```json
{
  "id": "b2c3d4e5-...",
  "caseNumber": "CS-2024-0143",
  "title": "Foster care placement - Karlsson family",
  "status": "PENDING",
  "createdAt": "2024-12-01T16:45:00Z"
}
```

---

#### `GET /api/v1/cases/:id`
**Description:** Get case details

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "a1b2c3d4-...",
  "caseNumber": "CS-2024-0142",
  "title": "Foster care placement - Johansson family",
  "description": "Long-term placement, child age 10, requires school support",
  "type": "FOSTER_CARE",
  "status": "ACTIVE",
  "priority": "HIGH",
  "assignedTo": {
    "id": "7d8c6b4a-...",
    "fullName": "Emma Svensson",
    "email": "emma.svensson@example.com"
  },
  "createdBy": {
    "id": "9e8d7c6b-...",
    "fullName": "Johan Andersson"
  },
  "organization": {
    "id": "550e8400-...",
    "name": "Stockholm Social Services"
  },
  "createdAt": "2024-11-15T10:30:00Z",
  "updatedAt": "2024-12-01T14:22:00Z"
}
```

---

### Error Response Format

**Standard Error Response:**
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "statusCode": 400
}
```

**HTTP Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., email already exists)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## 11. Success Criteria

### MVP Success Definition

**The MVP is successful when:**
1. Beta testers can complete core workflows without assistance
2. System is stable (99% uptime over 1 week of testing)
3. Email notifications are delivered reliably (<5% failure rate)
4. No critical security vulnerabilities (based on basic security audit)
5. Beta testers report >70% satisfaction with usability

---

### Functional Requirements

#### ✅ Authentication & User Management
- [ ] Users can register with email + password
- [ ] Users receive verification email within 1 minute
- [ ] Users can verify email and activate account
- [ ] Users can log in with verified credentials
- [ ] Users can reset forgotten password via email
- [ ] Access tokens expire after 15 minutes
- [ ] Refresh tokens work for 7 days
- [ ] Users can log out (tokens revoked)

#### ✅ Case Management
- [ ] Consultants can create cases
- [ ] Cases get unique case numbers (CS-YYYY-NNNN)
- [ ] Consultants can view list of assigned cases
- [ ] Consultants can view case details
- [ ] Consultants can update case status
- [ ] Consultants can filter cases by status, priority
- [ ] Case timeline shows chronological events
- [ ] RLS ensures users only see their organization's cases

#### ✅ Email Notifications
- [ ] Verification emails sent on registration
- [ ] Password reset emails sent on request
- [ ] Welcome emails sent after verification
- [ ] Case notification emails sent on assignment
- [ ] Emails include working links
- [ ] Emails render correctly (HTML + plain text)
- [ ] Email delivery rate >95%

#### ✅ Security & Compliance
- [ ] RLS policies prevent cross-organization data access
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] JWT tokens signed and verified correctly
- [ ] Rate limiting prevents brute force (100 req/15min)
- [ ] Audit logs capture all case access
- [ ] CORS restricts API access to frontend domain
- [ ] Helmet applies security headers

#### ✅ Web Frontend (Future)
- [ ] Users can log in via web UI
- [ ] Users can view dashboard with case list
- [ ] Users can click into case details
- [ ] UI is responsive (mobile, tablet, desktop)
- [ ] Forms have validation and error messages
- [ ] Loading states during API calls

---

### Quality Indicators

**Performance:**
- API response time <200ms (95th percentile)
- Database queries optimized (indexes on foreign keys, search fields)
- Frontend loads in <2 seconds (initial load)

**Reliability:**
- 99% uptime (excluding planned maintenance)
- Graceful error handling (no crashes)
- Database backups daily

**Maintainability:**
- TypeScript strict mode (no `any` types)
- Test coverage >50% (unit + integration)
- ESLint + Prettier passing
- API documentation via Swagger

**Usability:**
- Clear error messages (no technical jargon)
- Intuitive navigation
- Mobile-friendly design
- Accessible (WCAG 2.1 AA - future)

---

## 12. Implementation Phases

### Phase 1: Backend Foundation ✅ COMPLETED (2026-01-07)

**Goal:** Production-ready backend infrastructure

**Deliverables:**
- ✅ Node.js 20 + TypeScript + Fastify setup
- ✅ PostgreSQL 16 database with Prisma ORM
- ✅ Docker + Docker Compose configuration
- ✅ Environment validation (Zod schemas)
- ✅ Database schema (6 core models)
- ✅ RLS policies (organization isolation)
- ✅ ESLint + Prettier + Jest setup
- ✅ Health check endpoints
- ✅ Swagger documentation
- ✅ Comprehensive README

**Validation:**
- ✅ `docker-compose up` starts PostgreSQL + Backend
- ✅ `npm run dev` runs with hot reload
- ✅ `/health` endpoint returns 200 OK
- ✅ `/docs` shows Swagger UI
- ✅ TypeScript compiles with zero errors
- ✅ ESLint passes with zero warnings

**Duration:** 1 day (completed)

---

### Phase 2: Authentication System ✅ COMPLETED (2026-01-07)

**Goal:** Secure user authentication and session management

**Deliverables:**
- ✅ JWT utilities (generate, verify, refresh)
- ✅ Password utilities (hash, verify, strength validation)
- ✅ Auth service (register, login, logout, password reset)
- ✅ Auth controller and routes
- ✅ Auth middleware (JWT verification + RLS context injection)
- ✅ Zod validation schemas
- ✅ Unit tests (>50% coverage)
- ✅ API endpoints: /register, /login, /refresh, /logout, /verify/:token, /password-reset

**Validation:**
- ✅ User can register with valid email + password
- ✅ Registration fails with invalid data (Zod validation)
- ✅ User receives verification email (logged in dev mode)
- ✅ User can verify email with token
- ✅ User can log in with verified account
- ✅ User receives access + refresh tokens
- ✅ Access token expires after 15 minutes
- ✅ User can refresh access token
- ✅ User can log out (refresh token revoked)
- ✅ User can request password reset
- ✅ User can reset password with valid token
- ✅ Unit tests pass (8/8 for JWT, 8/8 for password, 8/8 for auth service)

**Duration:** 1 day (completed)

---

### Phase 3: Email Service Integration ✅ COMPLETED (2026-01-07)

**Goal:** Reliable email sending for transactional and notification emails

**Deliverables:**
- ✅ Nodemailer SMTP configuration
- ✅ Email service module (singleton transporter)
- ✅ Email templates (HTML + text):
  - ✅ Verification email
  - ✅ Password reset email
  - ✅ Welcome email
  - ✅ Case notification email
- ✅ Auth service integration (send emails on register, password reset, verify)
- ✅ Email service tests (8/8 passing)
- ✅ Development mode (log emails instead of sending)

**Validation:**
- ✅ Emails are sent on user registration
- ✅ Emails are sent on password reset request
- ✅ Emails are sent after email verification (welcome)
- ✅ Emails include correct links (verification, reset)
- ✅ Emails render correctly in HTML and plain text
- ✅ Email service handles SMTP errors gracefully
- ✅ Tests validate email content and recipients

**Duration:** 0.5 days (completed)

---

### Phase 4: Case Management Backend (In Progress)

**Goal:** Full CRUD operations for cases with timeline and filtering

**Deliverables:**
- [ ] Case service (create, read, update, delete, list)
- [ ] Case controller and routes
- [ ] Case validation schemas (Zod)
- [ ] Automatic case number generation (CS-YYYY-NNNN)
- [ ] Case filtering (status, priority, assigned user)
- [ ] Case timeline (audit log integration)
- [ ] Unit tests (>50% coverage)
- [ ] Integration tests (API endpoints)
- [ ] API endpoints: GET /cases, POST /cases, GET /cases/:id, PATCH /cases/:id

**Validation:**
- [ ] Consultant can create case with valid data
- [ ] Case gets unique case number
- [ ] Consultant can view list of cases (filtered by RLS)
- [ ] Consultant can filter by status, priority
- [ ] Consultant can view case details
- [ ] Consultant can update case status, priority
- [ ] Case timeline shows creation, updates, assignments
- [ ] RLS prevents viewing other organizations' cases
- [ ] Tests cover all CRUD operations

**Duration:** 1-2 days (estimated)

---

### Phase 5: Frontend Scaffolding & Authentication UI (Not Started)

**Goal:** React web app with login/register flows

**Deliverables:**
- [ ] Vite + React + TypeScript project setup
- [ ] Tailwind CSS + UI component library (shadcn/ui or Headless UI)
- [ ] API client service (axios/fetch wrapper)
- [ ] Authentication pages:
  - [ ] Login page
  - [ ] Register page
  - [ ] Email verification page
  - [ ] Password reset request page
  - [ ] Password reset confirmation page
- [ ] Auth state management (Zustand)
- [ ] Protected route wrapper
- [ ] Token storage (localStorage or sessionStorage)
- [ ] Automatic token refresh (React Query)

**Validation:**
- [ ] User can register via web form
- [ ] Form validation matches backend Zod schemas
- [ ] User receives feedback (success/error messages)
- [ ] User can log in via web form
- [ ] User is redirected to dashboard after login
- [ ] User can log out (tokens cleared)
- [ ] User can reset password via web UI
- [ ] Protected routes redirect to login if not authenticated
- [ ] Tokens automatically refresh before expiry

**Duration:** 2-3 days (estimated)

---

### Phase 6: Dashboard & Case Management UI (Not Started)

**Goal:** Web interface for case management

**Deliverables:**
- [ ] Dashboard page (case list, filters, summary stats)
- [ ] Case list component (table/grid with sorting)
- [ ] Case detail page (overview, timeline, communication, documents)
- [ ] Case creation form
- [ ] Case update form
- [ ] Filter UI (status, priority, assigned user)
- [ ] Loading states and error handling
- [ ] Responsive design (mobile, tablet, desktop)

**Validation:**
- [ ] Consultant can view dashboard with case list
- [ ] Consultant can filter cases by status, priority
- [ ] Consultant can click into case details
- [ ] Case detail shows timeline, communication, documents
- [ ] Consultant can create new case via form
- [ ] Consultant can update case status, priority
- [ ] UI is responsive (tested on mobile, tablet, desktop)
- [ ] Loading spinners during API calls
- [ ] Error messages on API failures

**Duration:** 3-4 days (estimated)

---

### Phase 7: Deployment & Beta Testing (Not Started)

**Goal:** Production deployment and beta tester onboarding

**Deliverables:**
- [ ] Production environment setup (VPS or managed platform)
- [ ] Environment variables configured (production .env)
- [ ] Database backups configured (daily)
- [ ] HTTPS/SSL certificate (Let's Encrypt)
- [ ] Domain name configured (e.g., app.consilio.se)
- [ ] Monitoring setup (error tracking, uptime)
- [ ] Beta tester accounts created
- [ ] User onboarding guide
- [ ] Feedback collection system (email or in-app)

**Validation:**
- [ ] Application accessible at production URL
- [ ] HTTPS working (SSL certificate valid)
- [ ] Database backups running daily
- [ ] Health checks responding (uptime monitoring)
- [ ] Beta testers can register and log in
- [ ] Beta testers can create and view cases
- [ ] Email notifications delivered to beta testers
- [ ] No critical errors in production logs (first week)
- [ ] Beta tester feedback collected

**Duration:** 2-3 days (estimated)

---

## 13. Future Considerations

### Post-MVP Enhancements

#### AI-Powered Features (Phase 8)

**1. Anonymization Engine**
- Local LLM (Ollama) identifies PII in text (names, places, dates)
- Generates stable codes (e.g., [klient-123456])
- Stores encrypted mappings in isolated database
- De-anonymization for human review

**2. Document Generation**
- Meeting notes from transcripts (video meeting → summary)
- Monthly reports from case timeline (aggregated updates)
- Quality checks (missing fields, inconsistencies)

**3. AI Chatbot for Foster Homes**
- 24/7 availability for common questions
- Risk assessment (escalate high-risk situations to consultant)
- Conversation logging for consultant review

**4. Smart Matching**
- Placement request analysis (client needs, risk factors)
- Foster home profile matching (competencies, availability)
- Top candidate recommendations with reasoning

---

#### Real-Time Communication (Phase 9)

**1. In-App Chat**
- WebSocket-based messaging
- One-on-one (consultant ↔ foster home)
- Group chats (consultant ↔ foster home ↔ social worker)
- File attachments, read receipts

**2. Video Meetings**
- Twilio Video or Daily.co integration
- In-app video calls
- Recording and transcription
- Meeting notes generation (AI)

**3. Push Notifications**
- Mobile push (future native apps)
- Desktop notifications (web)
- Notification preferences (email, push, in-app)

---

#### Mobile Applications (Phase 10)

**1. React Native App**
- Shared codebase (iOS + Android)
- Offline-first architecture
- Push notifications
- Simplified UI for foster homes

**2. Features:**
- Chat, video calls
- Case updates
- Task management
- Document viewing

---

#### Advanced Integrations (Phase 11)

**1. Journal System Integration**
- API integration with existing journal systems (e.g., Treserva, Lifecare)
- Bidirectional sync (import cases, export reports)
- Fallback: PDF export if API unavailable

**2. SSIL Integration**
- Placement request import from SSIL
- Automatic case creation
- Status updates back to SSIL

**3. BankID Authentication**
- Swedish national ID system
- Higher security for sensitive operations
- Replace email verification for Swedish users

**4. Calendar Integration**
- Sync meetings to Outlook, Google Calendar
- Meeting reminders

---

#### Analytics & Reporting (Phase 12)

**1. Dashboard Analytics**
- Case load per consultant
- Average case duration
- Response time metrics
- Overdue tasks

**2. Custom Reports**
- Export case summaries (PDF, Excel)
- Generate compliance reports (GDPR, audit logs)
- Trend analysis (case types, resolution times)

---

### Integration Opportunities

**Government Systems:**
- BankID (authentication)
- SSIL (placement requests)
- Skatteverket (organization number validation)

**Communication:**
- Twilio (SMS notifications)
- Daily.co / Twilio Video (video meetings)
- Microsoft Teams / Slack (consultant notifications)

**Document Management:**
- Google Drive / OneDrive (document storage)
- DocuSign (digital signatures for contracts)

**Analytics:**
- Google Analytics (usage tracking)
- Sentry (error tracking)
- Prometheus + Grafana (performance monitoring)

---

## 14. Risks & Mitigations

### Risk 1: Email Deliverability Issues

**Description:** Transactional emails (verification, password reset) end up in spam folders or fail to send.

**Impact:** HIGH - Users cannot verify accounts or reset passwords, blocking MVP functionality.

**Mitigation:**
1. Use reputable SMTP provider (SendGrid, Postmark) with good sender reputation
2. Implement SPF, DKIM, DMARC DNS records for domain
3. Use dedicated sending domain (e.g., mail.consilio.se)
4. Monitor bounce rates and spam complaints
5. Fallback: Display verification link in UI if email fails

**Status:** In Progress (SMTP configured, DNS records pending)

---

### Risk 2: Database Performance with RLS

**Description:** PostgreSQL Row-Level Security policies add overhead to queries, causing slow API responses.

**Impact:** MEDIUM - Poor user experience if case list loads slowly (>2 seconds).

**Mitigation:**
1. Add indexes on RLS-filtered columns (organization_id, user_id)
2. Use Prisma's query optimization (select only needed fields)
3. Implement caching for frequently accessed data (React Query)
4. Benchmark queries during development (target <100ms)
5. Fallback: Disable RLS in dev environment for performance testing

**Status:** Monitoring (indexes added, performance TBD)

---

### Risk 3: Beta Tester Feedback Requires Major Rework

**Description:** Beta testers find MVP unusable due to missing features or poor UX.

**Impact:** HIGH - Delays launch, requires significant development time.

**Mitigation:**
1. Conduct user interviews before development (validate assumptions)
2. Build minimal but complete workflows (authentication → cases → email)
3. Release early prototype for feedback (after Phase 5)
4. Iterative development (weekly check-ins with beta testers)
5. Prioritize critical feedback (differentiate "nice-to-have" vs "blocker")

**Status:** Planned (user interviews pending)

---

### Risk 4: GDPR Compliance Gaps

**Description:** Data handling violates GDPR (e.g., insufficient data isolation, missing user rights).

**Impact:** CRITICAL - Legal liability, fines, project shutdown.

**Mitigation:**
1. Implement RLS for database-level isolation (DONE)
2. Audit logging for all data access (DONE)
3. Data retention policies (auto-delete after X years)
4. User rights endpoints (export data, delete account)
5. Legal review by GDPR expert before production launch
6. Privacy policy and terms of service (drafted by lawyer)

**Status:** In Progress (technical measures done, legal review pending)

---

### Risk 5: Single Developer Dependency

**Description:** Project relies on single developer (AI-assisted). If development halts, project stalls.

**Impact:** HIGH - No continuity if AI development stops or context is lost.

**Mitigation:**
1. Comprehensive documentation (PROGRESS.md, PRD.md, README.md)
2. Git commits with detailed messages
3. Modular architecture (easy to onboard new developer)
4. TypeScript strict mode (self-documenting code)
5. Automated tests (regression prevention)
6. Continuity tracking (PROGRESS.md updated after every session)

**Status:** In Progress (documentation ongoing)

---

## 15. Appendix

### Related Documents

- **PROGRESS.md** - Development progress log (updated daily)
- **SESSION_1_LOG.md** - Detailed session notes (2026-01-07)
- **PHASE_1_2_COMPLETION_REPORT.md** - Backend foundation completion report
- **.agents/plans/backend-foundation-plan.md** - Detailed implementation plan (Phases 1-6)
- **backend/README.md** - Backend setup and usage guide
- **backend/IMPLEMENTATION_SUMMARY.md** - Backend implementation summary
- **consilio_komplett_projektoversikt.md** - Swedish master specification (full product vision)

---

### Key Dependencies

**Backend:**
- [Fastify](https://www.fastify.io/) - Web framework documentation
- [Prisma](https://www.prisma.io/docs) - ORM documentation
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) - Row-Level Security guide
- [Zod](https://zod.dev/) - Schema validation documentation
- [Nodemailer](https://nodemailer.com/) - Email sending guide

**Frontend (Future):**
- [React](https://react.dev/) - Official React documentation
- [Vite](https://vitejs.dev/) - Build tool documentation
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Query](https://tanstack.com/query/latest) - Server state management
- [shadcn/ui](https://ui.shadcn.com/) - Component library

**DevOps:**
- [Docker](https://docs.docker.com/) - Container documentation
- [Docker Compose](https://docs.docker.com/compose/) - Multi-container orchestration

---

### Repository Structure

```
consilio/
├── .github/                         # GitHub Actions (future)
│   └── workflows/
│       └── ci.yml                   # CI pipeline
├── .agents/                         # AI-generated plans
│   ├── plans/
│   │   └── backend-foundation-plan.md
│   └── reference/
├── backend/                         # Backend API (COMPLETED: Phases 1-3)
│   ├── src/                         # Source code
│   ├── prisma/                      # Database schema + migrations
│   ├── tests/                       # Unit + integration tests
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── README.md
├── frontend/                        # React web app (FUTURE: Phases 5-6)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docs/                            # Documentation
│   ├── api/                         # API documentation
│   ├── architecture/                # Architecture diagrams
│   └── user-guide/                  # User guides
├── PROGRESS.md                      # Development progress tracking
├── PRD.md                           # This document
├── README.md                        # Project overview
├── SESSION_1_LOG.md                 # Session notes
├── PHASE_1_2_COMPLETION_REPORT.md  # Phase completion report
└── consilio_komplett_projektoversikt.md  # Swedish master spec
```

---

### GitHub Repository

**URL:** https://github.com/gpt153/consilio

**Issues:**
- #1 - [ARCHITECTURE] Consilio Development Roadmap (Master issue)
- #2 - [EPIC] Backend API - Core Services
- #3 - [EPIC] Web Application - React UI
- #4 - [EPIC] Email Integration & Notifications

---

### Development Workspace

**Path:** `/home/samuel/.archon/workspaces/consilio`

**Status:** 65% Complete (Backend foundation + auth + email done)

---

## Next Steps

### Immediate (This Week)

1. **Fix Failing Tests** - 2 pre-existing backend test failures (priority: HIGH)
2. **Complete Phase 4** - Case management backend (CRUD + timeline)
3. **Start Phase 5** - Frontend scaffolding (Vite + React + TypeScript)

### Short-Term (Next 2 Weeks)

4. **Complete Phase 6** - Dashboard & case management UI
5. **User Testing** - Internal testing with project owner
6. **Bug Fixes** - Address critical bugs from testing

### Medium-Term (Next Month)

7. **Complete Phase 7** - Production deployment
8. **Beta Tester Onboarding** - Create accounts, send invites
9. **Collect Feedback** - Weekly check-ins with beta testers
10. **Iterate** - Address feedback, refine UX

### Long-Term (Next Quarter)

11. **AI Features** - Anonymization engine, document generation
12. **Mobile Apps** - React Native for iOS/Android
13. **Advanced Integrations** - Journal systems, BankID, SSIL

---

**PRD Version:** 1.0
**Last Updated:** 2026-01-07
**Author:** AI-generated based on project documentation
**Status:** Living document (updated as project evolves)

---

**End of PRD**
