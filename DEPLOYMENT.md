# Deployment Guide: MongoDB Atlas & Render

This document provides a comprehensive, step-by-step walkthrough for manually configuring **MongoDB Atlas** and deploying your **Small Business CRM REST API** backend to **Render**.

---

## 📋 Overview of Deployment Flow

```
+------------------------+      +---------------------------+      +--------------------------+
|  1. MongoDB Atlas      |      |  2. GitHub Repository     |      |  3. Render Web Service   |
|  - Create M0 Cluster   | ---> |  - Push code to GitHub    | ---> |  - Connect Repo          |
|  - Create DB User      |      |  - Exclude .env via       |      |  - Set Environment Vars  |
|  - Whitelist 0.0.0.0/0 |      |    .gitignore             |      |  - Build: npm install    |
|  - Copy Connection URI |      |                           |      |  - Start: npm start      |
+------------------------+      +---------------------------+      +--------------------------+
                                                                                |
                                                                                v
                                                                   +--------------------------+
                                                                   |  4. Live REST API        |
                                                                   |  https://*.onrender.com  |
                                                                   +--------------------------+
```

---

## 🗄 PART 1: Set Up MongoDB Atlas (Cloud Database)

### Step 1: Create an Account / Log In
1. Navigate to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Sign in or create a free account.

### Step 2: Deploy a Free Shared Cluster
1. On the Atlas dashboard, click **"Create"** or **"Build a Database"**.
2. Select the **M0 (Free)** tier.
3. Choose a Cloud Provider & Region (e.g., **AWS / Mumbai (ap-south-1)** or **AWS / Singapore**).
4. Name your cluster (e.g., `CRM-Cluster`).
5. Click **"Create Deployment"**.

---

### Step 3: Create a Database User
1. In the left navigation menu under **Security**, click **"Database Access"**.
2. Click the green **"Add New Database User"** button.
3. Configure the user:
   - **Authentication Method:** Password
   - **Username:** `crm_admin` (or your choice)
   - **Password:** Click *Autogenerate Secure Password* or type a secure password (e.g., `CrmSecurePass2026!`).
     > ⚠️ **Important:** If your password contains special characters like `@`, `#`, `:`, or `/`, make sure to URL-encode them, or stick to alphanumeric characters + `!` or `_`.
   - **Database User Privileges:** Select **"Read and write to any database"** (or Atlas admin).
4. Click **"Add User"**.

---

### Step 4: Configure Network Access (IP Whitelist)
Because Render dynamically assigns outgoing IP addresses to container instances, you must allow cloud access:
1. In the left menu under **Security**, click **"Network Access"**.
2. Click **"Add IP Address"**.
3. Click the button **"Allow Access from Anywhere"** (this sets `0.0.0.0/0`).
4. Enter a comment like `Render Cloud Access`.
5. Click **"Confirm"**. Wait ~30 seconds for the status to show **Active**.

---

### Step 5: Get Your MongoDB Connection String
1. In the left menu, click **"Database"** (Clusters view).
2. Click the **"Connect"** button next to your cluster.
3. Choose **"Drivers"** (Node.js).
4. Under **"Install your driver"**, ensure `Node.js` and version `5.5 or later` is selected.
5. Copy the connection string displayed. It will look like this:
   ```text
   mongodb+srv://crm_admin:<password>@crm-cluster.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your database user password, and add your database name `crm_database` before the `?`:
   ```text
   mongodb+srv://crm_admin:CrmSecurePass2026!@crm-cluster.xxxx.mongodb.net/crm_database?retryWrites=true&w=majority
   ```
7. Keep this connection string safe — you will use it in Render and in your local `.env`.

---

## 💻 PART 2: Push Your Code to GitHub

Render deploys directly from your Git repository. Ensure your code is version-controlled and pushed to GitHub:

### Step 1: Initialize Git and Commit
Open PowerShell or your terminal in `Major_Project`:
```powershell
# Verify you are in the project folder
cd c:\Users\Somyajeet\Code\Backend\Major_Project

# Initialize git if not already initialized
git init

# Verify .env is ignored (crucial for security!)
git status

# Stage all files
git add .

# Create initial commit
git commit -m "feat: complete small business CRM backend with RBAC and sales aggregation"
```

### Step 2: Create a GitHub Repository & Push
1. Go to [github.com/new](https://github.com/new).
2. Repository Name: `small-business-crm-backend` (or `Major_Project`).
3. Set Visibility: **Public** or **Private**.
4. Do **not** check "Initialize with README" (we already have one).
5. Click **"Create repository"**.
6. Run the commands shown by GitHub to push:
```powershell
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## ☁️ PART 3: Deploy to Render (Manual Step-by-Step)

### Step 1: Create a Render Account
1. Go to [render.com](https://render.com).
2. Sign in using your **GitHub account**.

### Step 2: Create a New Web Service
1. In the Render Dashboard, click the **"New +"** button at the top right.
2. Select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and click **Next**.
4. Find your repository (`small-business-crm-backend` or `Major_Project`) and click **"Connect"**.

---

### Step 3: Configure Web Service Settings
Fill in the deployment configuration form:

| Field | Recommended Value | Explanation |
| :--- | :--- | :--- |
| **Name** | `crm-backend-api` | Will create URL: `https://crm-backend-api.onrender.com` |
| **Region** | `Singapore (Southeast Asia)` or `Frankfurt` | Select region closest to you or your users. |
| **Branch** | `main` | Production branch to deploy from. |
| **Root Directory** | *(Leave blank)* | Since `package.json` is at the root. |
| **Runtime** | `Node` | Runtime environment. |
| **Build Command** | `npm install` | Installs production dependencies. |
| **Start Command** | `npm start` | Runs `node src/server.js`. |
| **Instance Type** | **Free** | Generous free tier for major project evaluations. |

---

### Step 4: Add Environment Variables
Scroll down to the **"Environment Variables"** section and click **"Add Environment Variable"** for each:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production security and log format. |
| `PORT` | `10000` | Render default port (injected automatically, but good to define). |
| `MONGODB_URI` | `mongodb+srv://crm_admin:YourPass@.../crm_database?retryWrites=true&w=majority` | Your MongoDB Atlas connection URI from Part 1. |
| `JWT_SECRET` | `crm_super_secure_jwt_secret_key_prod_2026_xyz987` | A secure random 32+ character string. |
| `JWT_EXPIRES_IN` | `7d` | Token validity duration. |
| `CLIENT_URL` | `*` | Or specify frontend URLs (e.g. `https://my-crm.vercel.app`). |

---

### Step 5: Deploy the Service
1. Click the blue **"Create Web Service"** button.
2. Render will allocate a build container, clone your GitHub repo, run `npm install`, and start the server with `npm start`.
3. Watch the deploy logs in the Render terminal. You should see:
   ```text
   ==> Building service...
   ==> Running 'npm install'
   ==> Starting service with 'npm start'
   [Database] MongoDB Connected successfully: crm-cluster-xxx / crm_database
   ====================================================
   🚀 CRM Backend Server running in [production] mode
   📡 Listening on http://localhost:10000
   🔍 Health Check: http://localhost:10000/api/health
   ====================================================
   ==> Your service is live at https://crm-backend-api.onrender.com
   ```

---

## 🌱 PART 4: Seed Initial Data into MongoDB Atlas

To evaluate the API with pre-populated customers, interactions, and sales records:

### Method 1: Run Seed Script Locally (Recommended & Fast)
1. Open your local `.env` file in VS Code / IDE.
2. Temporarily set `MONGODB_URI` to your live **MongoDB Atlas connection string**:
   ```env
   MONGODB_URI=mongodb+srv://crm_admin:YourPassword@cluster0.xxx.mongodb.net/crm_database?retryWrites=true&w=majority
   ```
3. Run the seed script in your local terminal:
   ```bash
   npm run seed
   ```
4. You will see all 3 accounts, 10 customers, 11 interactions, and 11 purchase records populated in Atlas, followed by the sales aggregation table!
5. Revert your local `.env` if desired.

### Method 2: Run via Render Shell
1. Go to your Render Web Service dashboard.
2. In the left menu, click **"Shell"**.
3. In the web terminal, type:
   ```bash
   npm run seed
   ```
4. Press Enter. The script will execute directly within Render!

---

## 🧪 PART 5: Testing Your Live Render API with Postman

1. Open **Postman** (or Thunder Client).
2. Open the imported collection: **Small Business CRM REST API**.
3. Click on the collection name -> Go to the **Variables** tab.
4. Update the `baseUrl` variable:
   - **Initial Value:** `https://<your-service-name>.onrender.com/api`
   - **Current Value:** `https://<your-service-name>.onrender.com/api`
5. Test the endpoints in sequence:

### 1. Health Check
- Request: `GET {{baseUrl}}/health`
- Expected: `200 OK`
```json
{
  "status": "OK",
  "timestamp": "2026-10-06T...",
  "uptime": 45.2,
  "service": "Small Business CRM REST API",
  "version": "1.0.0"
}
```

### 2. Login as Owner
- Request: `POST {{baseUrl}}/auth/login`
- Body:
```json
{
  "email": "owner@crm.com",
  "password": "Owner@123"
}
```
- The test script will automatically capture the token into `{{owner_token}}`.

### 3. Verify Owner-Only Sales Summary Aggregation
- Request: `GET {{baseUrl}}/sales-summary`
- Header: `Authorization: Bearer {{owner_token}}`
- Expected: `200 OK` containing total gross revenue, top customers, payment method breakdowns, and per-customer sales.

### 4. Verify Role Authorization Rejection (RBAC)
- Login as staff (`sarah.staff@crm.com` / `Staff@123`).
- Attempt: `GET {{baseUrl}}/sales-summary` with `Authorization: Bearer {{staff_token}}`.
- Expected Response: `403 Forbidden`
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied. Role 'staff' is not authorized to access this resource. Allowed roles: [owner]"
}
```

---

## ❓ Troubleshooting Common Deployment Issues

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| `MongooseServerSelectionError: connect ECONNREFUSED` | Atlas Network Access not configured. | Go to Atlas -> **Network Access** -> Click **"Add IP Address"** -> select **"Allow Access from Anywhere"** (`0.0.0.0/0`). |
| `MongoServerError: bad auth : authentication failed` | Incorrect username or password in `MONGODB_URI`. | Verify user credentials under Atlas -> **Database Access**. Re-generate password without ambiguous symbols. |
| Render service shows `Deploy Failed` | Missing environment variable or build command error. | Go to Render -> **Logs** to inspect the error. Verify `MONGODB_URI` and `JWT_SECRET` are added. |
| First request after 15 minutes is slow (~50 seconds) | Render Free Tier spins down inactive instances. | This is normal behavior for free containers. Subsequent requests respond instantly (<100ms). |
