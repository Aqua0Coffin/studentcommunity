# Student Community App - Project Walkthrough

I have successfully designed and scaffolded the rigorous, scalable Student Community App architecture requested. 

## 1. High-Level Architecture
- **Frontend**: Next.js (App Router), TailwindCSS, Shadcn UI
- **Backend API**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Role-Based Access Control (RBAC).

## 2. Completed Backend Modules (`server/src/routes/`)
- `auth.ts`: Secure login and registration.
- `users.ts`: Profile retrieval.
- `timetable.ts`: Department and batch-specific scheduling.
- `leaves.ts`: Leave requests and faculty approvals.
- `forum.ts`: Student discussion forum.
- `announcements.ts`: Admin announcements.

## 3. Completed Frontend UI (`client/src/app/`)
- `/login`: Secure sign-in utilizing beautiful components.
- `/dashboard/`: Protected layout wrapping the entire app.
- `/dashboard/`: Announcements feed.
- `/dashboard/timetable`: Interactive visual timetable.
- `/dashboard/leaves`: Leave request form & historical status tracking.
- `/dashboard/forum`: Discussion boards with comments logic.

## 4. Next Steps for Developers
1. **Start Database**: Ensure a local PostgreSQL instance is running with the connection URL listed in `server/.env`.
2. **Setup Backend**: Navigate to `/server`, run `npx prisma db push` to construct tables, then `npm run dev` to start the backend on port 5000.
3. **Setup Frontend**: Navigate to `/client`, run `npm run dev` to start the Next.js frontend on port 3000.
