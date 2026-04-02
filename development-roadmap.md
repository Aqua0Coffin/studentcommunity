# Development Roadmap: Granular Attendance & Admin Portal

This document outlines the bulletproof master plan for continuing the implementation in the next session. Based on our brainstorm, we are proceeding with **Option 2 (Fully Normalized Schema)** for attendance, and adding a dedicated **Admin Portal** to manage the ecosystem.

---

## Phase 1: Database Architecture (Supabase)

We need to update our Supabase SQL schema to support granular attendance and a scalable subject ecosystem. We'll execute the following DDL commands:

1. **`Subject` Table**
   - `id` (UUID, Primary Key)
   - `courseCode` (String, Unique)
   - `name` (String)
   - `departmentId` (String, Optional)
   - `createdAt`

2. **`Enrollment` Table**
   - Enables many-to-many relationship between Students and Subjects.
   - `student_id` (UUID, Foreign Key to `User`)
   - `subject_id` (UUID, Foreign Key to `Subject`)
   - Composite Primary Key (`student_id`, `subject_id`)

3. **`AttendanceSession` Table**
   - Daily logs for each student per subject.
   - `id` (UUID, Primary Key)
   - `student_id` (UUID)
   - `subject_id` (UUID)
   - `date` (Timestamp)
   - `status` (Enum: `'PRESENT'`, `'ABSENT'`, `'EXCUSED'`)
   - `marked_by` (UUID, Foreign Key to Admin/Faculty)

---

## Phase 2: Security & Row Level Security (RLS) policies

To ensure data integrity, we will apply Supabase RLS policies:
- **Students** can only `SELECT` their own records from `Enrollment` and `AttendanceSession`.
- **Admins / Faculty** can `INSERT` and `UPDATE` records in `AttendanceSession` and `Subject`.

---

## Phase 3: The Admin Dashboard

Since we are using **Option 3** for registration, the admin dashboard `/admin` must be highly secure and fully functional. It will inherit the dark, glassmorphism aesthetics of the main student portal but use a distinct color scheme (e.g., deeper slate tones mixed with amber/emerald accents) to visually distinguish it as a privileged environment. 

The Admin Dashboard will consist of a Sidebar layout with the following core pages:

1. **Admin Home / Overview (`/admin`)**
   - **Metrics:** Total active students, total subjects, system-wide average attendance.
   - **Recent Activity Feed:** Shows which faculty last logged attendance and when.

2. **Role & User Manager (`/admin/users`)**
   - **Data Table:** A searchable list of all registered users (pulled from `public."User"`).
   - **Promote to Admin:** A "Grant Admin Access" button allowing you to promote standard students to faculty/admin instantly, executing our Option 3 strategy securely from within the UI!
   - **Deactivate Accounts:** Ability to lock out rogue accounts.

3. **Subject Management UI (`/admin/subjects`)**
   - A grid of glassmorphic cards representing active subjects (DSA, OS, DBMS).
   - Forms to "Create New Subject" (requires Subject Name, Course Code).

4. **Faculty Attendance Logger (`/admin/attendance`)**
   - **The Workflow:** Faculty select a `Subject` and a `Date` (e.g., today).
   - **The Roster:** A fast, bulk-editable table automatically populates with all students enrolled in that subject.
   - **Marking:** Green toggles for `PRESENT`, red for `ABSENT`. One click to "Save Session", which securely mass-inserts records into the `AttendanceSession` database table.

5. **Security Gate (`middleware.ts`)**
   - A strictly enforced Next.js middleware that checks the role of anyone trying to access `/admin/*`. If a `STUDENT` tries to type `/admin` into the URL bar, they are instantly redirected back to their student dashboard with an "Unauthorized" toast.

---

## Phase 4: Student Dashboard Updates

Once the backend and admin routes are generating real data, we will convert the mocked student dashboard to live data.

1. **Removing Mocks**: Remove the `setTimeout` proxy in `client/src/lib/api.ts` for attendance.
2. **Aggregating Data in Realtime**:
   - Create a Supabase query or DB View that safely counts `PRESENT` sessions vs Total sessions per subject for the designated `user.id`.
3. **UI Integration**: 
   - Feed the aggregated data directly into `AttendanceChart.tsx` and the master attendance percentage ring on `/dashboard`.

---

### Hand-off Note for Next Session
When starting the next session, point the AI directly to this `development-roadmap.md` file. The recommended first step next session will be to **execute the Supabase SQL schema updates** (Phase 1) and then proceed to **construct the Admin UI** (Phase 3).
