<h1 align="center">✨ TalkNow - Real-time Video &amp; Chat App ✨</h1>

<p align="center">
  <img src="https://socialify.git.ci/cs23b2009/TalkNow-video-calls/image?custom_description=A+full-stack+video+calling+and+messaging+application+built+with+React%2C+Node.js%2C+Stream+SDK%2C+and+Tailwind+CSS.&description=1&language=1&name=1&owner=1&theme=Light" alt="project-image">
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/cs23b2009/TalkNow-video-calls" alt="License Badge">
</p>
<p align="center">
  🌐 <strong>Website:</strong> <a href="https://talk-now-video-calls.vercel.app" target="_blank">https://talk-now-video-calls.vercel.app</a>
</p>

---

<h2>📸 Project Screenshot</h2>

<p align="center">
  <img src="frontend/public/All Devices Black Mockup.png" alt="TalkNow App Mockup"  />
</p>

---

<h2>✨ Features</h2>

- **Real-time Video Calling**: High-quality peer-to-peer and group calls powered by Stream SDK.
- **Instant Messaging**: Real-time chat with online status tracking.
- **Email Verification**: Secure signup flow with Mailjet verification codes.
- **User Profiles**: Onboarding flow and customizable profiles.
- **Friend System**: Connect with other students globally.
- **Dark Mode & Themes**: Multiple UI themes for a personalized experience.

---

<h2>🚀 Deployment</h2>

For full production deployment steps (Vercel & Render), please refer to the:
👉 **[Deployment Guide (DEPLOYMENT.md)](./DEPLOYMENT.md)**

---

<h2>🛠 Local Installation</h2>

<h3>1️⃣ Clone the Repository</h3>

<pre><code>git clone https://github.com/cs23b2009/TalkNow-video-calls.git
cd TalkNow-video-calls
</code></pre>

<h3>2️⃣ Install Dependencies</h3>

<h4>Backend</h4>
<pre><code>cd backend
npm install
</code></pre>

<h4>Frontend</h4>
<pre><code>cd ../frontend
npm install
</code></pre>

---

<h2>🧪 Environment Variables (.env)</h2>

<h3>📂 Backend (<code>/backend/.env</code>)</h3>

<pre><code>PORT=5001
MONGO_URI=your_mongo_uri
JWT_SECRET_KEY=your_jwt_secret
STEAM_API_KEY=your_stream_api_key
STEAM_API_SECRET=your_stream_api_secret
MAILJET_API_KEY=your_mailjet_key
MAILJET_SECRET_KEY=your_mailjet_secret
MAILJET_FROM_EMAIL=your_verified_email
CLIENT_URL=http://localhost:5173
</code></pre>

<h3>🌐 Frontend (<code>/frontend/.env</code>)</h3>

<pre><code>VITE_STREAM_API_KEY=your_stream_api_key
VITE_BACKEND_URL=http://localhost:5001
</code></pre>

---

<h2>💻 Running Locally</h2>

1. **Start Backend**:
   <pre><code>cd backend && npm run dev</code></pre>
2. **Start Frontend**:
   <pre><code>cd frontend && npm run dev</code></pre>

---

<h2>🧠 System Architecture</h2>

![System Architecture](https://github.com/cs23b2009/blahblah/blob/main/TalkNow_Arcitecture.jpeg)

---

<h2>🧪 Technologies Used</h2>

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-563D7C?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Mailjet-FF9900?style=for-the-badge&logo=mailjet&logoColor=white" />
</p>
