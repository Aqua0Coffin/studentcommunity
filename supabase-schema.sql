-- Enum for Attendance Status
DO $$ BEGIN
    CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'EXCUSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Subject Table
CREATE TABLE IF NOT EXISTS public."Subject" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseCode" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "departmentId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enrollment Table (Many-to-Many between User and Subject)
CREATE TABLE IF NOT EXISTS public."Enrollment" (
  "studentId" UUID NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "subjectId" UUID NOT NULL REFERENCES public."Subject"("id") ON DELETE CASCADE,
  PRIMARY KEY ("studentId", "subjectId")
);

-- 3. AttendanceSession Table
CREATE TABLE IF NOT EXISTS public."AttendanceSession" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentId" UUID NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "subjectId" UUID NOT NULL REFERENCES public."Subject"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "status" "AttendanceStatus" DEFAULT 'PRESENT',
  "markedById" UUID NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("studentId", "subjectId", "date")
);

-- Security: Row Level Security (RLS) Policies
ALTER TABLE public."Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AttendanceSession" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely so re-running the script doesn't throw errors
DROP POLICY IF EXISTS "Anyone can view subjects" ON public."Subject";
DROP POLICY IF EXISTS "Faculty and Admins can insert/update subjects" ON public."Subject";
DROP POLICY IF EXISTS "Faculty and Admins can insert subjects" ON public."Subject";
DROP POLICY IF EXISTS "Faculty and Admins can update subjects" ON public."Subject";

DROP POLICY IF EXISTS "Students can view their own enrollments" ON public."Enrollment";
DROP POLICY IF EXISTS "Faculty and Admins can manage enrollments" ON public."Enrollment";

DROP POLICY IF EXISTS "Students can view their own attendance" ON public."AttendanceSession";
DROP POLICY IF EXISTS "Faculty and Admins can log attendance" ON public."AttendanceSession";

-- Subject Policies
CREATE POLICY "Anyone can view subjects" ON public."Subject" FOR SELECT USING (true);
CREATE POLICY "Faculty and Admins can insert subjects" ON public."Subject" 
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public."User" WHERE "role" IN ('ADMIN', 'FACULTY'))
  );
CREATE POLICY "Faculty and Admins can update subjects" ON public."Subject" 
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public."User" WHERE "role" IN ('ADMIN', 'FACULTY'))
  );

-- Enrollment Policies
CREATE POLICY "Students can view their own enrollments" ON public."Enrollment"
  FOR SELECT USING (
    "studentId" = auth.uid() OR 
    (auth.uid() IN (SELECT id FROM public."User" WHERE "role" IN ('ADMIN', 'FACULTY')))
  );
CREATE POLICY "Faculty and Admins can manage enrollments" ON public."Enrollment"
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public."User" WHERE "role" IN ('ADMIN', 'FACULTY'))
  );

-- AttendanceSession Policies
CREATE POLICY "Students can view their own attendance" ON public."AttendanceSession"
  FOR SELECT USING (
    "studentId" = auth.uid() OR 
    (auth.uid() IN (SELECT id FROM public."User" WHERE "role" IN ('ADMIN', 'FACULTY')))
  );
CREATE POLICY "Faculty and Admins can log attendance" ON public."AttendanceSession"
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public."User" WHERE "role" IN ('ADMIN', 'FACULTY'))
  );
