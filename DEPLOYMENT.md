# Deployment Guide: Small Business CRM (Full-Stack)

> **Case Study 150 — Major Project**  
> Complete deployment walkthrough for hosting the **Express.js & MongoDB** backend on **Render / Railway** with **MongoDB Atlas**, and deploying the **React (Vite)** frontend on **Vercel / Netlify**.

---

## 📋 Full-Stack Deployment Architecture

```
+-----------------------------------------------------------------------------------------+
|                                    CLOUD ARCHITECTURE                                    |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   1. DATABASE (MongoDB Atlas)                                                           |
|      - Free M0 Shared Cluster                                                           |
|      - Network Whitelist (0.0.0.0/0 for dynamic cloud IPs)                              |
|      - Dedicated DB User (`crm_admin`)                                                  |
|                                                                                         |
|   2. BACKEND API (Render / Railway)                                                     |
|      - Node.js runtime (Express REST API)                                               |
|      - Port auto-configured (Render: 10000, Railway: auto)                              |
|      - Env Vars: MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL                    |
|      - Live URL: https://crm-backend-api.onrender.com                                   |
|                                                                                         |
|   3. FRONTEND CLIENT (Vercel / Netlify)                                                 |
|      - Vite + React monochrome SPA (directory: `client`)                                |
|      - Env Var: VITE_API_URL=https://crm-backend-api.onrender.com/api                   |
|      - Live URL: https://crm-client.vercel.app                                          |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

## 🗄 PART 1: Set Up MongoDB Atlas (Cloud Database)

### Step 1: Create an Account / Log In
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Sign in or create a free account.

### Step 2: Deploy a Free Shared Cluster
1. On the Atlas dashboard, click **"Create"** or **"Build a Database"**.
2. Choose the **M0 (Free)** tier.
3. Select Cloud Provider & Region (e.g., **AWS / Mumbai (ap-south-1)** or **AWS / Singapore**).
4. Cluster Name: `CRM-Cluster`.
5. Click **"Create Deployment"**.

---

### Step 3: Create Database User
1. Under **Security** in the left menu, click **"Database Access"**.
2. Click **"Add New Database User"**.
3. Configure:
   - **Authentication Method:** Password
   - **Username:** `crm_admin`
   - **Password:** Autogenerate or type a strong password.
     > ⚠️ *Avoid reserved characters (`@`, `:`, `/`) in passwords to prevent URL-encoding connection errors.*
   - **User Privileges:** Select **"Read and write to any database"** (or Atlas admin).
4. Click **"Add User"**.

---

### Step 4: Configure Network Access (IP Whitelist)
Cloud hosts like Render and Railway assign dynamic IP addresses. You must allow cloud access:
1. Under **Security**, click **"Network Access"**.
2. Click **"Add IP Address"**.
3. Click **"Allow Access from Anywhere"** (sets CIDR `0.0.0.0/0`).
4. Comment: `Cloud Deployment Access`.
5. Click **"Confirm"**. Wait ~30 seconds until status shows **Active**.

---

### Step 5: Copy MongoDB Connection String
1. Under **Deployments**, click **"Database"**.
2. Click **"Connect"** next to your cluster.
3. Select **"Drivers"** (Node.js).
4. Under "Install your driver", ensure `Node.js` is selected.
5. Copy the connection string:
   ```text
   mongodb+srv://crm_admin:<password>@crm-cluster.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your database password, and specify the database name `crm_database` before the query parameters:
   ```text
   mongodb+srv://crm_admin:<your_password>@crm-cluster.xxxx.mongodb.net/crm_database?retryWrites=true&w=majority
   ```

---

## 💻 PART 2: Push Code to GitHub

Render, Railway, and Vercel all build and deploy directly from your GitHub repository.

### Step 1: Verify Pre-Flight Tests Locally
Run the automated test suite to ensure all 18 criteria pass:
```bash
npm test
```

### Step 2: Push to GitHub
```bash
# Navigate to the project root directory
cd "/Users/somyajeet/Git/college projects/Backend_Major_Project"

# Initialize git if needed and verify .env is ignored
git status

# Stage and commit all changes
git add .
git commit -m "feat: complete small business CRM full-stack system"

# Push to your repository
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## ☁️ PART 3: Deploy Backend on Render

### Step 1: Create Web Service
1. Log in to [render.com](https://render.com) using your GitHub account.
2. In the dashboard, click **"New +"** -> **"Web Service"**.
3. Select **"Build and deploy from a Git repository"** and click **Next**.
4. Choose your repository and click **"Connect"**.

### Step 2: Configure Web Service
| Field | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `crm-backend-api` | Yields `https://crm-backend-api.onrender.com` |
| **Region** | `Singapore` or `Frankfurt` | Select closest to you |
| **Branch** | `main` | Production branch |
| **Root Directory** | *(Leave blank)* | Root `package.json` |
| **Runtime** | `Node` | Node.js environment |
| **Build Command** | `npm install` | Installs dependencies |
| **Start Command** | `npm start` | Runs `node src/server.js` |
| **Instance Type** | **Free** | Generous free tier |

### Step 3: Add Environment Variables
Scroll to **"Environment Variables"** and add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@...` | Atlas connection string from Part 1 |
| `JWT_SECRET` | `<your_jwt_secret_key_here>` | Generate a secure random 32+ character string |
| `JWT_EXPIRES_IN` | `7d` | Token validity |
| `CLIENT_URL` | `*` | Or specify frontend domain once deployed |

### Step 4: Deploy and Verify
Click **"Create Web Service"**. Once the deployment log displays:
```text
==> Your service is live at https://crm-backend-api.onrender.com
```
Test the health endpoint in your browser:
```text
https://crm-backend-api.onrender.com/api/health
```
Expected output:
```json
{
  "status": "OK",
  "service": "Small Business CRM REST API",
  "version": "1.0.0"
}
```

---

## 🚂 ALTERNATIVE: Deploy Backend on Railway

If you prefer using **Railway** instead of Render:
1. Log in to [railway.app](https://railway.app) with GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"** -> Select your repo.
3. In service settings, add the variables under **"Variables"**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `NODE_ENV=production`
   - `CLIENT_URL=*`
4. Under **"Settings"** -> **"Networking"**, click **"Generate Domain"** to obtain your public URL.

---

## 🌱 PART 4: Seed Initial Data into MongoDB Atlas

Populate Atlas with realistic customers, interactions, and purchase transactions:

### Method 1: Local Terminal (Fastest)
1. Open your local `.env` file and set `MONGODB_URI` to your Atlas string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/crm_database?retryWrites=true&w=majority
   ```
2. Run the seed script:
   ```bash
   npm run seed
   ```
3. All 3 accounts, 10 customers, 11 interactions, and 11 purchases will be seeded directly to MongoDB Atlas.

### Method 2: Render Shell
1. Go to your Render Web Service dashboard -> click **"Shell"** in the left menu.
2. Type `npm run seed` and press Enter.

---

## 🚀 PART 5: Deploy Frontend on Vercel / Netlify

### Option A: Deploy on Vercel (Recommended)
1. Log in to [vercel.com](https://vercel.com) using your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Select your GitHub repository.
4. In the configuration screen:
   - **Framework Preset:** Vite
   - **Root Directory:** Click **Edit** and select **`client`**
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
5. **Environment Variables**:
   Add the following environment variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://crm-backend-api.onrender.com/api` *(Your live Render backend URL with `/api` suffix)*
6. Click **"Deploy"**.
7. Vercel will build and assign a URL (e.g., `https://crm-client.vercel.app`).

### Option B: Deploy on Netlify
1. Log in to [netlify.com](https://netlify.com).
2. Click **"Add new site"** -> **"Import an existing project"** -> GitHub.
3. Select the repository:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/dist`
4. Under **"Environment variables"**, add:
   - `VITE_API_URL` = `https://crm-backend-api.onrender.com/api`
5. Click **"Deploy site"**.

---

## 🧪 PART 6: Live API Verification with Postman

1. Open **Postman** (or Thunder Client).
2. Open collection: **Small Business CRM REST API** ([`postman/CRM_Backend_API.postman_collection.json`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/postman/CRM_Backend_API.postman_collection.json)).
3. Under the **Variables** tab, set:
   - `baseUrl` = `https://<your-service>.onrender.com/api`
4. Test:
   - **Health:** `GET {{baseUrl}}/health` &rarr; `200 OK`
   - **Owner Login:** `POST {{baseUrl}}/auth/login` (`owner@crm.com` / `Owner@123`) &rarr; Auto-captures `{{owner_token}}`
   - **Sales Summary (Owner):** `GET {{baseUrl}}/sales-summary` &rarr; `200 OK` with full aggregations
   - **Sales Summary (Staff):** `GET {{baseUrl}}/sales-summary` with `{{staff_token}}` &rarr; `403 Forbidden` (RBAC validated)

---

## ❓ Troubleshooting Common Deployment Issues

| Problem | Root Cause | Solution |
| :--- | :--- | :--- |
| `MongooseServerSelectionError: connect ECONNREFUSED` | Atlas Network Access not configured. | In Atlas, go to **Network Access** &rarr; **Add IP Address** &rarr; select **Allow Access from Anywhere** (`0.0.0.0/0`). |
| `MongoServerError: bad auth : authentication failed` | Incorrect password in `MONGODB_URI`. | Verify credentials in Atlas **Database Access**. Avoid symbols like `@` or `:` in passwords without URL encoding. |
| CORS error in browser on frontend | `CLIENT_URL` doesn't match frontend domain. | In Render, set `CLIENT_URL=*` or specify your Vercel URL `https://crm-client.vercel.app`. |
| Render instance takes 50s on first load | Render free tier spins down inactive web services after 15 min. | Expected behavior on free tier. Subsequent calls respond in <100ms. |
| Vite frontend shows network errors | `VITE_API_URL` missing or incorrect. | Ensure `VITE_API_URL` in Vercel points to `https://<backend>.onrender.com/api` (with `/api` suffix). |
