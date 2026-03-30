# Student Community Management System

A comprehensive, scalable, and modern full-stack application designed to streamline academic and community interactions within a student ecosystem. Built with a focus on role-based access, interactive scheduling, and community engagement.

## 🚀 Overview

The Student Community App provides a centralized platform for students, faculty, and administrators to manage academic schedules, track performance, handle leave requests, and engage in collaborative discussions.

## ✨ Key Features

- **🔐 Secure Authentication:** Role-based access control (RBAC) for Students, Faculty, and Admins using JWT and Bcrypt.
- **📊 Interactive Dashboard:** Personalized views with real-time stats including Attendance and CGPA tracking.
- **📅 Timetable Management:** Visual weekly schedules tailored to specific departments and batches.
- **📝 Leave Management System:** Students can submit leave requests with document attachments; Faculty can review and approve/reject them.
- **💬 Community Forum:** A space for academic discussions, event planning, and general queries with categories and upvoting.
- **📢 Targeted Announcements:** Admin/Faculty can post pinned announcements targeted at specific departments or batches.
- **👤 Profile Management:** Detailed user profiles with academic metadata.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Visualization:** [Recharts](https://recharts.org/)
- **State/Data Fetching:** Axios, JS-Cookie

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express](https://expressjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** JSON Web Tokens (JWT)
- **Language:** TypeScript

---

## 📂 Project Structure

```text
student-community/
├── client/          # Next.js Frontend
│   ├── src/app      # Next.js App Router Pages
│   ├── src/components # UI Components (Shadcn)
│   └── src/lib      # API and Utility functions
├── server/          # Express Backend
│   ├── src/routes   # API Route Handlers
│   ├── src/prisma   # Prisma Client setup
│   └── prisma/      # Database Schema & Migrations
└── UI Reference/    # Design assets
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) instance running
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Database Setup

Ensure you have a PostgreSQL database created. Note your connection string:
`postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

### 2. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` root:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   JWT_SECRET="your_random_secret_key"
   PORT=5000
   ```
4. Push the database schema:
   ```bash
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `client` root:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

The application should now be running at `http://localhost:3000`.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository.
2. **Create** a new feature branch (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. **Open** a Pull Request.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

Project Link: [https://github.com/yourusername/student-community](https://github.com/yourusername/student-community)
