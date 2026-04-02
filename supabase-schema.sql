-- Enum definitions
CREATE TYPE "Role" AS ENUM ('STUDENT', 'FACULTY', 'ADMIN');
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "PostCategory" AS ENUM ('ACADEMIC', 'EVENTS', 'GENERAL');
CREATE TYPE "TargetAudience" AS ENUM ('ALL', 'SPECIFIC_DEPT', 'SPECIFIC_BATCH');

-- Users table
-- Links to Supabase Auth table (auth.users)
CREATE TABLE public."User" (
  "id" UUID PRIMARY KEY, -- We will set this to match auth.users.id during sign up
  "email" TEXT UNIQUE NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "role" "Role" DEFAULT 'STUDENT',
  "departmentId" TEXT,
  "batchYear" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: In Supabase, passwordHash is handled by Supabase Auth natively, so we don't store it here anymore.

CREATE TABLE public."Profile" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID UNIQUE NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "attendancePercentage" FLOAT DEFAULT 0.0,
  "currentCgpa" FLOAT DEFAULT 0.0,
  "enrollmentNumber" TEXT UNIQUE NOT NULL
);

CREATE TABLE public."Timetable" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "departmentId" TEXT NOT NULL,
  "batchYear" INTEGER NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "periodNumber" INTEGER NOT NULL,
  "subjectName" TEXT NOT NULL,
  "facultyId" UUID NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "roomNumber" TEXT NOT NULL
);

CREATE TABLE public."LeaveRequest" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentId" UUID NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "reason" TEXT NOT NULL,
  "documentUrl" TEXT,
  "status" "LeaveStatus" DEFAULT 'PENDING',
  "reviewedById" UUID REFERENCES public."User"("id"),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public."ForumPost" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "authorId" UUID NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "contentMd" TEXT NOT NULL,
  "category" "PostCategory" NOT NULL,
  "upvotes" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public."ForumComment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "postId" UUID NOT NULL REFERENCES public."ForumPost"("id") ON DELETE CASCADE,
  "authorId" UUID NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public."Announcement" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "authorId" UUID NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "targetAudience" "TargetAudience" NOT NULL,
  "isPinned" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
