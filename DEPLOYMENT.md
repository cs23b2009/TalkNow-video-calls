# Deployment Guide: TalkNow Video Calls

This guide covers the step-by-step process for deploying the TalkNow full-stack application to production.

## 🚀 1. Backend Deployment (Render.com)

1.  **Create a New Web Service**:
    *   Connect your GitHub repository.
    *   Select the `talknow-video-calls` repo.
2.  **Configure Build Settings**:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node src/server.js`
3.  **Set Environment Variables**:
    Go to the **Environment** tab and add the following keys from your `.env` file:
    *   `PORT`: `5001` (Render will override this, but good to have)
    *   `MONGO_URI`: `mongodb+srv://...` (Your MongoDB Atlas connection string)
    *   `JWT_SECRET_KEY`: `...` (Your secret key)
    *   `STEAM_API_KEY`: `...` (GetStream API Key)
    *   `STEAM_API_SECRET`: `...` (GetStream Secret)
    *   `MAILJET_API_KEY`: `...` (Mailjet API Key)
    *   `MAILJET_SECRET_KEY`: `...` (Mailjet Secret)
    *   `MAILJET_FROM_EMAIL`: `indrakumarai369@gmail.com`
    *   `NODE_ENV`: `production`
    *   `CLIENT_URL`: `https://talk-now-video-calls.vercel.app` (Your Vercel URL)

## 🎨 2. Frontend Deployment (Vercel)

1.  **Import Project**:
    *   Connect GitHub and select the `talknow-video-calls` repo.
2.  **Configure Project Settings**:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
3.  **Environment Variables**:
    Add these in the Vercel dashboard:
    *   `VITE_STREAM_API_KEY`: `...` (Same as backend)
    *   `VITE_BACKEND_URL`: `https://talknow-video-calls.onrender.com` (Your Render service URL)

---

## ⚙️ 3. Post-Deployment Steps

### Update CORS and URLs
Once you have both the Render URL and Vercel URL:
1.  **Backend**: Update the `CLIENT_URL` variable in Render settings to match your Vercel URL.
2.  **Stream API**: Ensure your GetStream dashboard allows the production domain for WebRTC and Chat.

## 🛠️ Local Setup (.env files)

To run the project locally, create two `.env` files:

### Backend (`/backend/.env`)
```env
JWT_SECRET_KEY="your_secret"
MONGO_URI="your_mongodb_uri"
PORT=5001
STEAM_API_KEY="your_stream_key"
STEAM_API_SECRET="your_stream_secret"
MAILJET_API_KEY="your_mailjet_key"
MAILJET_SECRET_KEY="your_mailjet_secret"
MAILJET_FROM_EMAIL="your_verified_email"
CLIENT_URL="http://localhost:5173"
```

### Frontend (`/frontend/.env`)
```env
VITE_STREAM_API_KEY="your_stream_key"
VITE_BACKEND_URL="http://localhost:5001"
```
