<div align="center">
  <img src="frontend/public/favicon.svg" alt="DevTrackr Logo" width="100" height="100">
  <h1>📊 DevTrackr</h1>
  <p><strong>AI-Powered Developer Productivity & Analytics Dashboard</strong></p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Gemini">
</div>

---

DevTrackr is a modern, full-stack application that connects to your GitHub account to analyze repository activity, track sprint velocity, and provide actionable **AI-driven insights** for your development team. It replaces manual sprint tracking with automated metric collection and intelligent bottleneck detection.

## ✨ Features

- 🔐 **GitHub Integration:** Seamlessly connect via GitHub OAuth or add public repositories for tracking.
- 🧠 **AI-Powered Insights:** Uses Google's Gemini API to generate intelligent sprint summaries, team health analysis, and actionable recommendations.
- 📈 **Deep Analytics:** Track commit activity, pull request open/close rates, and active contributor breakdown using interactive charts.
- ❤️ **Sprint Health Scoring:** Automated health score out of 100 based on velocity trends, bottlenecks, and repository risks.
- 📄 **Exportable Reports:** Generate clean, print-ready PDF reports containing sprint summaries and AI recommendations.
- 🎨 **Modern UX/UI:** Fully responsive design with Framer Motion animations, Recharts data visualization, and a built-in Dark/Light mode toggle.
- 👤 **Profile Management:** Update user details and upload custom base64 avatars.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Vanilla CSS (CSS Variables for Theming)
- **State/Data:** React Query (TanStack), Context API
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Environment:** Node.js + Express
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT (JSON Web Tokens) + GitHub OAuth
- **AI Integration:** Google GenAI SDK (Gemini Models)
- **Security:** Helmet, CORS, Express Rate Limit

---

## 🚀 Getting Started

Follow these steps to set up DevTrackr locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas cluster)
- A GitHub OAuth Application (for Client ID & Secret)
- A Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/AnveshaSharma17/DevTrackr.git
cd DevTrackr
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/github/callback
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
GEMINI_MODEL_FALLBACK=gemini-1.5-flash
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```
Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🌍 Deployment

The application is built to be deployed easily on modern cloud platforms.

- **Backend:** Configured for [Render](https://render.com/) via the included `render.yaml` infrastructure-as-code file.
- **Frontend:** Configured for [Vercel](https://vercel.com/) via the included `vercel.json` for SPA routing rules.

*For detailed deployment instructions, refer to the [Deployment Guide](./deployment_guide.md).*

---

## 📝 License

This project is licensed under the MIT License.
