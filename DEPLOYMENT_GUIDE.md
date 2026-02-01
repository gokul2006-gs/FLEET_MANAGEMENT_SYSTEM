# 🚀 Fleet IQ Deployment Guide

Congratulations! Your application is feature-complete. Now it's time to put it on the internet.

We will use:
1.  **GitHub**: To host your code.
2.  **Render**: To host your Backend (Node.js API).
3.  **Vercel**: To host your Frontend (React App).

---

## Phase 1: Push Code to GitHub

1.  Initialize Git in your root folder (if not done):
    ```bash
    git init
    git add .
    git commit -m "Initial Fleet IQ Release"
    ```
2.  Create a **New Repository** on GitHub.
3.  Link and Push:
    ```bash
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git push -u origin master
    ```

---

## Phase 2: Deploy Backend (Render)

1.  Go to [Render.com](https://render.com) and Sign Up/Log In.
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Root Directory**: `backend` (Important!)
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables** (Add these):
    *   `MONGO_URI`: (Your actual MongoDB Connection String)
    *   `JWT_SECRET`: (Any secret random string)
    *   `GOOGLE_CLIENT_ID`: (Your Google Client ID)
6.  Click **"Create Web Service"**.
7.  **Wait** for it to go live. Copy the **Service URL** (e.g., `https://fleet-iq-api.onrender.com`).

---

## Phase 3: Deploy Frontend (Vercel)

1.  Go to [Vercel.com](https://vercel.com) and Sign Up/Log In.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Settings**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `frontend` (Important!)
5.  **Environment Variables**:
    *   `VITE_API_URL`: Paste your **Render Backend URL** here (No trailing slash). 
        *   Example: `https://fleet-iq-api.onrender.com`
    *   `VITE_GOOGLE_CLIENT_ID`: (Your Google Client ID)
6.  Click **"Deploy"**.

---

## Phase 4: Final Google Auth Fix

1.  Go to **Google Cloud Console**.
2.  Edit your OAuth Client.
3.  **Authorized JavaScript Origins**: Add your new **Vercel URL** (e.g., `https://fleet-iq.vercel.app`).
4.  **Save**.

---

🎉 **Done! Your Fleet Management System is now live!**
