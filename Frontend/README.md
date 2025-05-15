# 🏗️ LandsDevelop

A smart real estate assistant platform to explore development plots and projects.  
Includes a custom-built chatbot and Supabase-based user authentication system.

---

## 🚀 Features

### 🔍 Chatbot Assistant
- Built in React with fully **rule-based logic** (no GPT/LLM)
- Handles queries like:
  - “Show villa projects in Kompally”
  - “Find plots over 5 acres with RERA approval”
  - “Projects with 60:40 developer ratio”
  - “What is RERA?”
- Suggests nearby projects dynamically
- Integrates with local `projects` data

### 🔐 Authentication (WIP)
- Built using **Supabase Auth**
- Signup with email, mobile number, full name
- Verification code (OTP) system stores user + code in Supabase DB
- Currently working on OTP validation bug

---

## 🧱 Tech Stack

- Frontend: **React + TypeScript**
- Styling: **Tailwind CSS**
- Auth & DB: **Supabase**
- Icons: **Lucide**
- State Handling: React Hooks

---

## 🛠️ Setup Instructions

1. Clone the repo:
   git clone https://github.com/NandiniBommireddy/LandsDevelop.git
   cd LandsDevelop
2.Install dependencies:
  npm install

3.Set up environment variables in .env or .env.local:
  VITE_SUPABASE_URL=your-supabase-url
  VITE_SUPABASE_ANON_KEY=your-anon-key

4.Run the app locally:
  npm run dev

