# 🌐 LandsDevelop - Full Stack Property Listing Platform

This is a full-stack web application that allows users to post, browse, and express interest in real estate development properties.

---

## 📁 Project Structure

```
FINDINGLAND/
├── backend/             # Node.js + Express + MongoDB backend
├── Frontend/            # React + Tailwind + Vite frontend
├── .gitignore
├── README.md
```

---

## ⚙️ Prerequisites

- Node.js (v18 or later recommended)
- MongoDB (Atlas or local instance)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/FINDINGLAND.git
cd FINDINGLAND
```

---

### 2. Setup Backend
```bash
cd backend
npm install
```

#### Create `.env` file in `backend/`:
```env
PORT=5174
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

#### Start Backend:
```bash
npm start
```
The backend will run at: `http://localhost:5174`

---

### 3. Setup Frontend
```bash
cd ../Frontend
npm install
```

#### Start Frontend:
```bash
npm run dev
```
The frontend will run at: `http://localhost:5173`

---

## 📸 Features
- Signup / Login with JWT auth
- Post and edit properties (images stored in `/backend/uploads`)
- View development plots
- Show interest in properties
- View users who showed interest in your listings
- Fully responsive design using Tailwind CSS

---

## 📁 Uploads Folder
Make sure the backend has a writable `uploads/` directory (auto-created).

---

## ⚠️ Notes
- Ensure MongoDB is running locally or Atlas connection string is correct.
- CORS is enabled for frontend <-> backend communication.

---

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Express.js, MongoDB, JWT

---

## 🤝 Contributing
Feel free to fork this repo, submit issues or PRs.

---

## 📄 License
MIT

---

Enjoy the project! If you have any trouble running it, please open an issue.

