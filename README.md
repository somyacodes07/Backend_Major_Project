# Small Business Customer Management (CRM) — Backend REST API

> **Case Study 150 — Major Project**  
> A lightweight, production-ready CRM backend designed for small businesses to manage customer contacts, interaction histories, and purchase transactions. Features granular search and filtering, role-based authorization (Owner vs. Staff), and high-performance MongoDB aggregation pipelines for owner-only sales intelligence.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Objectives & Outcomes](#-key-objectives--outcomes)
3. [System Architecture & Tech Stack](#-system-architecture--tech-stack)
4. [Database Schemas & Data Modeling](#-database-schemas--data-modeling)
5. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
6. [Sales Summary Aggregation Pipeline](#-sales-summary-aggregation-pipeline)
7. [API Endpoints Reference](#-api-endpoints-reference)
8. [Search, Filtering & Pagination Guide](#-search-filtering--pagination-guide)
9. [Local Setup & Running](#-local-setup--running)
10. [Database Seeding](#-database-seeding)
11. [Postman / Thunder Client Collection](#-postman--thunder-client-collection)
12. [Deployment Guide](#-deployment-guide)

---

## 🌟 Project Overview

Small businesses often struggle with fragmented customer data split across spreadsheets, email threads, and note apps. This project delivers a unified backend engine that enables:
- **Staff Members** to create, search, and update customer profiles, log contact touchpoints (calls, meetings, emails), and record purchase invoices.
- **Business Owners** to access sensitive, company-wide financial performance metrics, calculate total spend per customer, and track monthly sales trends via dedicated MongoDB aggregation pipelines.

---

## 🎯 Key Objectives & Outcomes

| Objective | Implementation Details | Outcome |
| :--- | :--- | :--- |
| **Mongoose Schemas** | Designed referenced `User`, `Customer`, `Interaction`, and `Purchase` schemas. | Structured, validated relational data model with referential integrity. |
| **Customer CRUD** | Complete REST endpoints with duplicate email prevention and sanitization. | Staff can seamlessly manage customer accounts. |
| **Search & Filtering** | Regex search across name/email/company, tag filters, status filters, and last-contact date range. | Fast, indexed customer lookup and segmentation. |
| **Role-Based Auth** | JWT middleware paired with `authorize('owner')` and `authorize('staff')`. | Owner-exclusive financial routes; staff restricted to customer management. |
| **Sales Aggregation** | Multi-stage pipeline (`$match`, `$group`, `$lookup`, `$unwind`, `$project`, `$facet`). | Accurate calculation of total sales per customer and company KPIs. |

---

## 🛠 System Architecture & Tech Stack

```
                                  +-----------------------+
                                  |   Client / Postman    |
                                  +-----------+-----------+
                                              |
                                     (HTTP / JSON REST)
                                              |
                                              v
+-----------------------------------------------------------------------------------+
| Express.js Server (Port 5000)                                                     |
|                                                                                   |
|  [Security & Middleware]                                                          |
|  - Helmet (HTTP Header hardening)                                                 |
|  - CORS (Cross-Origin Resource Sharing)                                           |
|  - Morgan (HTTP request logging)                                                  |
|  - JWT Authentication Guard (`protect`)                                           |
|  - RBAC Guard (`authorize('owner')`)                                              |
|                                                                                   |
|  [Controllers & Logic]                                                            |
|  +--------------------+  +--------------------+  +------------------------------+ |
|  |   Auth Controller  |  | Customer Controller|  |    Sales Summary Controller  | |
|  | (Register / Login) |  |   (CRUD / Search)  |  |  (MongoDB Aggregation Engine)| |
|  +--------------------+  +--------------------+  +------------------------------+ |
+---------------------------------------------+-------------------------------------+
                                              |
                                     (Mongoose ODM v7)
                                              |
                                              v
+-----------------------------------------------------------------------------------+
| MongoDB Database (Atlas Cloud / Local)                                            |
|                                                                                   |
|  [users]                   [customers]                   [purchases]              |
|  - name, email, role       - name, email, tags           - customer (ObjectId)    |
|  - password (bcrypt hash)  - status, lastContactDate     - amount, invoiceNumber  |
|                            - totalSpent, totalPurchases  - items, paymentMethod   |
|                                     ^                              ^              |
|                                     |                              |              |
|                             [interactions]                         |              |
|                             - customer (ObjectId)                  |              |
|                             - staff (ObjectId), date               |              |
+--------------------------------------------------------------------+--------------+
```

### Core Technologies
- **Runtime Environment:** Node.js (v16+)
- **Framework:** Express.js 4.18
- **Database & ODM:** MongoDB & Mongoose 7.6
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation:** `express-validator` 7.0
- **Security:** `helmet` & `cors`
- **Logging:** `morgan`

---

## 🗄 Database Schemas & Data Modeling

### 1. User Schema (`src/models/User.js`)
Represents staff members and the business owner.
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, select: false }, // Hashed with bcrypt
  role: { type: String, enum: ['owner', 'staff'], default: 'staff', index: true },
  phone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  timestamps: true
}
```

### 2. Customer Schema (`src/models/Customer.js`)
Stores customer contacts, segmentation tags, and aggregate sales totals.
```javascript
{
  name: { type: String, required: true, trim: true, index: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  tags: [{ type: String, index: true }], // e.g. ['VIP', 'Wholesale', 'Lead']
  status: { type: String, enum: ['lead', 'prospect', 'active', 'inactive'], default: 'lead', index: true },
  lastContactDate: { type: Date, default: null, index: true },
  notes: { type: String, default: '' },
  totalPurchases: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamps: true
}
```
*Indexes:* Single field indexes on `tags`, `status`, `lastContactDate`, plus a compound text index `{ name: 'text', email: 'text', company: 'text' }`.

### 3. Interaction Schema (`src/models/Interaction.js`)
Tracks customer touchpoints logged by staff.
```javascript
{
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['call', 'email', 'meeting', 'message', 'note'], required: true },
  summary: { type: String, required: true, trim: true },
  details: { type: String, default: '' },
  date: { type: Date, default: Date.now, index: true },
  outcome: { type: String, enum: ['successful', 'follow_up_needed', 'no_answer', 'cancelled', 'completed'] },
  timestamps: true
}
```
> **Smart Trigger:** Every time an interaction is logged, a Mongoose hook automatically updates the corresponding customer's `lastContactDate`!

### 4. Purchase Schema (`src/models/Purchase.js`)
Tracks financial transactions and orders.
```javascript
{
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  items: [{ name: String, quantity: Number, unitPrice: Number }],
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  paymentMethod: { type: String, enum: ['credit_card', 'bank_transfer', 'cash', 'upi', 'stripe', 'paypal'] },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'paid' },
  date: { type: Date, default: Date.now, index: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' },
  timestamps: true
}
```

---

## 🔒 Role-Based Access Control (RBAC)

The system enforces strict permission boundaries using two reusable middlewares:
- `protect`: Verifies the Bearer JWT token, ensures the user still exists in the database, and confirms the account is active.
- `authorize(...roles)`: Restricts route execution to designated roles.

### Access Matrix

| Endpoint | Method | Staff Access | Owner Access | Note |
| :--- | :---: | :---: | :---: | :--- |
| `/api/auth/login` | POST | Public | Public | Returns signed JWT |
| `/api/customers` | GET | Allowed | Allowed | Search, filter, sort, paginate |
| `/api/customers` | POST | Allowed | Allowed | Create customer |
| `/api/customers/:id` | GET/PUT/DEL | Allowed | Allowed | Manage specific customer |
| `/api/customers/:id/interactions` | POST/GET | Allowed | Allowed | Log and view interactions |
| `/api/customers/:id/purchases` | POST/GET | Allowed | Allowed | Record and view transactions |
| `/api/sales-summary` | GET | **Forbidden (403)** | **Allowed (200)** | **Owner-Only Aggregation** |

---

## 📊 Sales Summary Aggregation Pipeline

Located in [`src/controllers/salesController.js`](file:///c:/Users/Somyajeet/Code/Backend/Major_Project/src/controllers/salesController.js), this pipeline fulfills the core objective: **$group by customer, $sum purchases (owner only)**.

### Pipeline Stages Breakdown:
```javascript
[
  // Stage 1: Filter to only completed/paid transactions
  { $match: { paymentStatus: 'paid' } },

  // Stage 2: Group by customer ObjectId and calculate financial aggregates
  {
    $group: {
      _id: '$customer',
      totalSpent: { $sum: '$amount' },
      purchaseCount: { $sum: 1 },
      averageOrderValue: { $avg: '$amount' },
      firstPurchaseDate: { $min: '$date' },
      lastPurchaseDate: { $max: '$date' }
    }
  },

  // Stage 3: Lookup customer metadata from 'customers' collection
  {
    $lookup: {
      from: 'customers',
      localField: '_id',
      foreignField: '_id',
      as: 'customerDetails'
    }
  },

  // Stage 4: Unwind customer details array to flat object
  { $unwind: '$customerDetails' },

  // Stage 5: Project clean output shape with rounded figures
  {
    $project: {
      _id: 0,
      customerId: '$_id',
      customerName: '$customerDetails.name',
      customerEmail: '$customerDetails.email',
      customerCompany: '$customerDetails.company',
      customerTags: '$customerDetails.tags',
      customerStatus: '$customerDetails.status',
      totalSpent: { $round: ['$totalSpent', 2] },
      purchaseCount: 1,
      averageOrderValue: { $round: ['$averageOrderValue', 2] },
      firstPurchaseDate: 1,
      lastPurchaseDate: 1
    }
  },

  // Stage 6: Sort by highest-spending customers
  { $sort: { totalSpent: -1 } }
]
```

### High-Level Company Overview (`$facet`):
Concurrently computes:
1. `overview`: Total Gross Revenue, Total Transactions, Average Transaction Value, Unique Paying Customers.
2. `paymentMethodsBreakdown`: Revenue grouped by payment method (Credit Card, Bank Transfer, Stripe, UPI).
3. `monthlyTrends`: Month-by-month revenue trajectory.

---

## 🚀 API Endpoints Reference

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new staff or owner user.
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/profile` — Get current logged-in profile.
- `PUT /api/auth/profile` — Update current user profile.

### 2. Customers (`/api/customers`)
- `GET /api/customers` — Query, search, filter, and paginate customer list.
- `POST /api/customers` — Create a new customer profile.
- `GET /api/customers/stats/summary` — Quick customer counts by status and top tags.
- `GET /api/customers/:id` — Retrieve single customer with recent interactions and purchases.
- `PUT /api/customers/:id` — Update customer details.
- `DELETE /api/customers/:id` — Delete customer (cascades interactions & purchases).

### 3. Interactions (`/api/customers/:id/interactions` & `/api/interactions`)
- `POST /api/customers/:id/interactions` — Log interaction (auto-updates customer's `lastContactDate`).
- `GET /api/customers/:id/interactions` — List interaction history for customer.
- `DELETE /api/interactions/:id` — Delete interaction record.

### 4. Purchases (`/api/customers/:id/purchases` & `/api/purchases`)
- `POST /api/customers/:id/purchases` — Record an order / invoice.
- `GET /api/customers/:id/purchases` — View customer purchase history.
- `GET /api/purchases` — View company-wide purchases (paginated).

### 5. Sales Summary (`/api/sales-summary`)
- `GET /api/sales-summary` — **Owner Only** analytics and aggregation summary.
  - Supports `startDate` and `endDate` query parameters.

---

## 🔍 Search, Filtering & Pagination Guide

The `GET /api/customers` endpoint accepts dynamic query strings:

| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `search` | String | `?search=logistics` | Case-insensitive search across name, email, company, or phone. |
| `tag` | String | `?tag=VIP` or `?tag=VIP,Retail` | Filter by one or multiple customer tags. |
| `status` | String | `?status=active` | Filter by status (`lead`, `prospect`, `active`, `inactive`). |
| `minLastContactDate` | ISO Date | `?minLastContactDate=2026-01-01` | Filter customers contacted on or after date. |
| `maxLastContactDate` | ISO Date | `?maxLastContactDate=2026-03-31` | Filter customers contacted on or before date. |
| `sort` | String | `?sort=totalSpent:desc` | Sort field and direction (`name:asc`, `lastContactDate:desc`, `-createdAt`). |
| `page` | Integer | `?page=1` | Current page number (default: 1). |
| `limit` | Integer | `?limit=10` | Records per page (default: 10, max: 100). |

---

## 💻 Local Setup & Running

### Prerequisites
- Node.js (v16.0.0 or higher)
- MongoDB running locally or a MongoDB Atlas connection URI

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/crm_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000,http://localhost:5173
```

### 3. Run Automated Integration Tests
Verify all 18 test criteria (Health check, Auth, Owner vs Staff RBAC on sales summary, root aliases, Customer CRUD, Interactions logging, Purchase aggregation):
```bash
npm test
```

### 4. Run the Backend API Server
```bash
npm run dev
# Or for standard production start:
npm start
```
The server will boot on `http://localhost:5000`. You can visit `http://localhost:5000/api/health` in your browser to verify it is online.

### 5. Run the React Frontend (Optional / Suggested Deliverable)
A responsive React client (Vite + React) is included in the `client/` folder:
```bash
npm run client
```
The web dashboard will open on `http://localhost:5173`. It features one-click demo login buttons for Owner and Staff, customer management, interaction logging, and the Owner sales analytics dashboard.

---

## 🌱 Database Seeding

Populate the database with realistic test accounts, 10 diverse customers, 11 detailed interactions, and 11 purchase transactions:
```bash
npm run seed
```

### Seeded Credentials for Testing:

| Role | Name | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- | :--- |
| **Owner** | Eleanor Vance | `owner@crm.com` | `Owner@123` | **Full Access** (including `/api/sales-summary`) |
| **Staff** | Sarah Jenkins | `sarah.staff@crm.com` | `Staff@123` | Customer & Interaction Management |
| **Staff** | Michael Chang | `michael.staff@crm.com` | `Staff@123` | Customer & Interaction Management |

---

## 📬 Postman / Thunder Client Collection

A complete, pre-configured collection is included at:
[`postman/CRM_Backend_API.postman_collection.json`](file:///c:/Users/Somyajeet/Code/Backend/Major_Project/postman/CRM_Backend_API.postman_collection.json)

### How to Import:
1. Open **Postman** (or Thunder Client in VS Code).
2. Click **Import** -> Select file -> Choose `CRM_Backend_API.postman_collection.json`.
3. Run **01 - Authentication -> Login as Owner**. The test script will **automatically save** the JWT token into your collection variables!
4. Test **05 - Sales Summary (As Owner)** -> Returns `200 OK` with full company financials.
5. Test **05 - Sales Summary (As Staff)** -> Returns `403 Forbidden`, proving your RBAC works as required!

---

## 🌐 Deployment Guide

For full step-by-step instructions on setting up **MongoDB Atlas** and deploying manually to **Render**, please see the dedicated [DEPLOYMENT.md](file:///c:/Users/Somyajeet/Code/Backend/Major_Project/DEPLOYMENT.md) guide.
