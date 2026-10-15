# End-to-End Free Deployment Guide: AI Academic Study Assistant

This guide covers deploying the **AI-Powered Academic Study Assistant** to free cloud hosting platforms.

---

## 🚀 Option 1: Vercel (100% Free Tier — Recommended)

Vercel provides native Next.js hosting with unlimited deployments, automated HTTPS, and global edge caching on their free Hobby tier.

### Step-by-Step Instructions:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete AI Academic Study Assistant with RAG and OBE"
   git branch -M main
   # Create a repository on GitHub (or use gh cli):
   gh repo create ai-academic-study-assistant --public --source=. --push
   ```
2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account (`zamadshakil`).
   - Click **Add New...** → **Project**.
   - Select `ai-academic-study-assistant` and click **Import**.
3. **Configure Settings**:
   - **Framework Preset**: Next.js (automatically detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `pnpm run build` (or leave default `next build`)
   - **Output Directory**: `.next` (leave default)
4. **Deploy**:
   - Click **Deploy**.
   - Within ~60-90 seconds, Vercel will complete the build and assign a free public domain (e.g. `https://ai-academic-study-assistant.vercel.app`).
   - The app runs immediately in **Zero-Config Demo Mode** (with instant role switching between Student Alice, Dr. Iqra Tariq, and QEC Admin)!

---

## 🐳 Option 2: Render (100% Free Web Service)

Render offers free web services that run directly from your GitHub repository using Docker or Node.js.

### Step-by-Step Instructions:
1. Push this repository to GitHub.
2. Sign in to [dashboard.render.com](https://dashboard.render.com).
3. Click **New +** → **Web Service**.
4. Connect your `ai-academic-study-assistant` GitHub repository.
5. In the configuration:
   - **Environment**: Node
   - **Plan Type**: Free
   - **Build Command**: `corepack enable && pnpm install && pnpm run build`
   - **Start Command**: `node .next/standalone/server.js`
6. Click **Create Web Service**. Render will provision your URL (e.g. `https://ai-academic-study-assistant.onrender.com`).

---

## 🚂 Option 3: Railway (Nixpacks / Docker)

Railway allows deploying full-stack Node.js and Docker applications.

### Step-by-Step Instructions:
1. Go to [railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select `ai-academic-study-assistant`.
4. Railway will automatically detect `railway.json` and `Dockerfile`.
5. Under Settings → Networking, click **Generate Domain** to get your live `.up.railway.app` URL.

---

## 💻 Option 4: Local or Cloud VPS via Docker Compose

Run the entire application in a production-ready container on any server with a single command:

```bash
docker compose up --build -d
```
Access the application at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Optional: Connecting External AI & Database Providers

While the application works 100% out of the box with embedded zero-config fallbacks, you can connect external cloud providers at any time by configuring these environment variables in your hosting provider's dashboard:

| Variable | Description | Example / Source |
|---|---|---|
| `OPENROUTER_API_KEY` | Real-time LLM inference for RAG & Quiz generation | `sk-or-v1-...` from [openrouter.ai](https://openrouter.ai) |
| `NEXT_PUBLIC_SUPABASE_URL` | Cloud Supabase API Gateway | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged Supabase service key | `eyJhbGci...` |
