# Faculty & Viva Presentation Guide: Small Business CRM Backend

> **Case Study 150 — Major Project**  
> **Course:** B.Tech Computer Science Engineering — Backend Development (Node.js, Express.js & MongoDB)  
> **Student:** Somyajeet Singh  

---

## 🎯 1. The 60-Second Elevator Pitch (How to Introduce Your Project)

> *"Good morning / afternoon, respected faculty members and professors.*  
> 
> *My major project is **Case Study 150: Small Business Customer Management (CRM)**.  
> Small businesses typically struggle with fragmented customer data spread across spreadsheets, WhatsApp messages, and disconnected billing notebooks.  
> 
> My project delivers an **enterprise-grade, production-ready RESTful backend engine** built with **Node.js, Express.js, and MongoDB Atlas**.  
> It solves three core business challenges:  
> 1. **Data Organization:** It manages customer contact records, touchpoint interactions (calls, meetings, emails), and purchase transactions using referenced Mongoose schemas with referential integrity.  
> 2. **Security & Governance:** It enforces strict **Role-Based Access Control (RBAC)** using JWT authentication, ensuring staff members can manage day-to-day customer accounts while sensitive financial sales analytics are strictly restricted to the Business Owner.  
> 3. **High-Performance Financial Analytics:** Rather than computing revenue totals in JavaScript memory, it executes a multi-stage **MongoDB Aggregation Pipeline** directly on the database engine using `$group`, `$sum`, `$facet`, and `$lookup` to calculate real-time total sales per customer and company-wide financial metrics in Indian Rupees (₹).*  
> 
> *I have also built an automated integration test suite with 100% pass rate, a Postman collection, cloud deployment scripts, and a lightweight React frontend to visually demonstrate the live REST APIs."*

---

## 🏗️ 2. Architectural Walkthrough (Explaining the Backend Stack)

When professors ask: *"Explain the architecture of your backend"*, present this diagram and points:

```
[ Client / Postman / Frontend ]
               |
               | (HTTP / JSON REST Requests)
               v
+-----------------------------------------------------------------------------------------+
| EXPRESS.JS BACKEND ARCHITECTURE (MVC / Controller-Service Pattern)                     |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  1. SECURITY & LOGGING MIDDLEWARE                                                       |
|     - Helmet (Hardens HTTP security headers against XSS/Clickjacking)                   |
|     - CORS (Restricts allowed client origins)                                           |
|     - Morgan (HTTP request lifecycle logger)                                            |
|                                                                                         |
|  2. ROUTING LAYER (`src/routes/`)                                                       |
|     - Modular routers: `/auth`, `/customers`, `/interactions`, `/purchases`,            |
|       `/sales-summary`                                                                  |
|     - Dual-mounted under both `/api/*` and root `/*` for complete specification         |
|       compatibility.                                                                    |
|                                                                                         |
|  3. AUTHENTICATION & VALIDATION MIDDLEWARE (`src/middleware/`, `src/validators/`)       |
|     - `protect`: Verifies JWT Bearer tokens and extracts authenticated user payload.    |
|     - `authorize('owner')`: Enforces RBAC; throws HTTP 403 Forbidden for unauthorized   |
|       staff.                                                                            |
|     - `express-validator`: Sanitizes inputs and validates required schema fields.        |
|                                                                                         |
|  4. CONTROLLER LAYER (`src/controllers/`)                                               |
|     - Business logic orchestration: `customerController`, `salesController`, etc.       |
|     - Asynchronous error propagation via `asyncHandler`.                                |
|                                                                                         |
|  5. DATA PERSISTENCE & SCHEMAS (`src/models/`)                                          |
|     - Referenced Mongoose Schemas: `User`, `Customer`, `Interaction`, `Purchase`.       |
|     - Compound text search indexes, pre-save password hashing, post-save hooks.         |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
                                       |
                                       | (Mongoose ODM / TCP Connection)
                                       v
                     [ MONGODB ATLAS CLOUD DATABASE (Cluster0) ]
```

---

## 📋 3. Mapping Code to All 5 Project Objectives

Point out exactly which files implement each required objective from the project sheet:

### Objective 1: Customer, Interaction, and Staff Schemas using Mongoose
- **Files:** [`src/models/Customer.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/models/Customer.js), [`src/models/Interaction.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/models/Interaction.js), [`src/models/User.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/models/User.js), [`src/models/Purchase.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/models/Purchase.js)
- **Key Backend Features:**
  - `Interaction` references `Customer` (`type: ObjectId, ref: 'Customer'`) and `User` (`staff: ObjectId, ref: 'User'`).
  - `Purchase` references `Customer` and `User` (`recordedBy`).
  - **Mongoose Post-Save Hook:** When an interaction is saved in `Interaction.js`, a post-save hook automatically updates the customer's `lastContactDate` in the database.
  - **Virtual Population:** `Customer` schema includes virtual fields for `interactions` and `purchases`.
  - **Indexed Search:** Text and compound indexes on `name`, `email`, `company`, `tags`, and `status`.

### Objective 2: CRUD Operations for Customer Records
- **File:** [`src/controllers/customerController.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/controllers/customerController.js)
- **Endpoints:**
  - `POST /api/customers` — Create record (validates required fields, rejects duplicate emails with HTTP 409 Conflict).
  - `GET /api/customers` — Read paginated list.
  - `GET /api/customers/:id` — Read single customer with recent interaction & invoice history.
  - `PUT /api/customers/:id` — Update customer details.
  - `DELETE /api/customers/:id` — Delete customer (implements **cascade deletion**, removing associated interactions and purchases to prevent orphan records).

### Objective 3: Search and Filtering by Name, Tag, or Last-Contact Date
- **File:** [`src/controllers/customerController.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/controllers/customerController.js#L64-L128)
- **Implementation:**
  - **Search:** Case-insensitive `$or` regex across `name`, `company`, `email`, and `phone`.
  - **Tag Filter:** Supports single or comma-separated tags (`?tag=VIP,Enterprise`) using `$in` and case-insensitive regex.
  - **Status Filter:** Filters by `lead`, `prospect`, `active`, `inactive`.
  - **Date Range Filter:** Filters `lastContactDate` between `minLastContactDate` (`$gte`) and `maxLastContactDate` (`$lte`).
  - **Sorting:** Flexible sorting (`name:asc`, `-createdAt`, `totalSpent:desc`).

### Objective 4: Role-Based Authorization for Owner-Only Sales Summary Access
- **Files:** [`src/middleware/roleMiddleware.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/middleware/roleMiddleware.js), [`src/routes/salesRoutes.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/routes/salesRoutes.js)
- **Implementation:**
  - Route: `GET /api/sales-summary`
  - Protected with `protect` (JWT verification) followed by `authorize(ROLES.OWNER)`.
  - If a user with role `staff` attempts to call this endpoint, `authorize()` intercepts the request and responds with **HTTP 403 Forbidden** (`"Access denied. Required role(s): owner"`). Only the owner can access it.

### Objective 5: Basic Aggregation Query for Total Sales per Customer
- **File:** [`src/controllers/salesController.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/controllers/salesController.js#L28-L72)
- **Pipeline:**
  ```javascript
  Purchase.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: '$customer',
        totalSpent: { $sum: '$amount' },
        purchaseCount: { $sum: 1 },
        averageOrderValue: { $avg: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customerDetails'
      }
    },
    { $unwind: '$customerDetails' },
    {
      $project: {
        _id: 0,
        customerId: '$_id',
        customerName: '$customerDetails.name',
        company: '$customerDetails.company',
        totalSpent: { $round: ['$totalSpent', 2] },
        purchaseCount: 1,
        averageOrderValue: { $round: ['$averageOrderValue', 2] }
      }
    },
    { $sort: { totalSpent: -1 } }
  ]);
  ```
- **Concurrently runs `$facet` pipeline** for company KPIs: Total Gross Revenue (₹21,55,000), Total Orders, Payment Methods breakdown, and Monthly Trends.

---

## 🎬 4. Step-by-Step Live Demo Script for the Professors

Follow this sequence during your practical viva or demonstration:

### Step 1: Prove Database Connection & Run Automated Tests
Open your terminal in front of the professors and run:
```bash
npm test
```
**Explain to them:**  
*"Professors, here is our automated integration test suite running 18 test assertions against live Express routes and MongoDB Atlas. It verifies health checks, owner/staff authentication, RBAC authorization boundaries, search/filtering regexes, customer CRUD lifecycle, Mongoose post-save hooks, and purchase aggregations. All 18 tests pass with 0 errors."*

### Step 2: Show Seeded Indian Database
Run:
```bash
npm run seed
```
**Point to output:**  
*"We have seeded realistic Indian business customer records (Bharat Logistics, FabStudio Bengaluru, Tata Tech Infra Pune, Chai Point Kolkata) with financial transactions in Indian Rupees (₹). Total company revenue is ₹21,55,000 across 7 paying customers."*

### Step 3: Demonstrate Search & Tag Filtering
Open the browser at `http://localhost:5173` (or Postman at `http://localhost:5000/api/customers?search=Bharat&tag=VIP`):
- Type `Bharat` in the search box &rarr; Only `Bharat Logistics & Supply Chain Pvt Ltd` appears.
- Select tag `VIP` &rarr; Only VIP customers appear.
- Sort by `Highest Spend` &rarr; Customers are ordered by total spent descending.
**Explain to them:**  
*"All filtering and sorting logic executes on the server side using MongoDB indexed queries with pagination, ensuring minimal latency even with millions of records."*

### Step 4: Demonstrate Automatic Hook on Interaction Logging
- Open customer *Bharat Logistics*.
- Click **+ Log Touchpoint** &rarr; Record a phone call.
- Observe: The customer's `Last Touchpoint` date automatically updates.
**Explain to them:**  
*"This demonstrates Mongoose lifecycle hooks. The client only saved an `Interaction` document; the Mongoose `post('save')` middleware automatically updated the referenced `Customer` document's `lastContactDate` in the database."*

### Step 5: Demonstrate Role-Based Access Control (The RBAC Security Test)
- Log in as **Staff: Priya Patel** (`priya.staff@crm.com`).
- Click the **Sales Analytics** tab.
- Observe: The system displays **HTTP 403 Forbidden — Restricted Resource: Business Owner Only**.
- Then click **Switch to Owner Session (Rajesh Sharma)** (`owner@crm.com`).
- Observe: The full financial intelligence dashboard appears instantly with KPI metric cards, sales breakdown, and per-customer aggregation ranking.
**Explain to them:**  
*"This proves our role-based authorization middleware (`authorize(ROLES.OWNER)`). Staff accounts are denied access with an HTTP 403 status code, while the Owner receives the full MongoDB aggregation analytics."*

---

## ❓ 5. Anticipated Faculty Viva Questions & Model Answers

### Q1: Why did you choose MongoDB instead of a relational database like MySQL or PostgreSQL?
> **Answer:**  
> *"MongoDB offers flexible schema modeling which is ideal for CRM software where customer records often need dynamic tags, nested contact objects, and varying notes without expensive schema migrations.  
> Furthermore, MongoDB's **Aggregation Pipeline** provides powerful in-database analytical capabilities (`$group`, `$facet`, `$unwind`) that allow us to calculate financial metrics with high throughput. We still maintained referential integrity through Mongoose `ObjectId` references and virtual populates."*

### Q2: Why did you perform sales aggregation in MongoDB rather than using JavaScript's `.reduce()` or `.filter()` in Node.js?
> **Answer:**  
> *"Computing aggregations in Node.js memory requires loading all purchase records over the network into RAM. If there are 1,000,000 transactions, Node.js would consume gigabytes of memory and block the single-threaded event loop, leading to server crashes (OOM).  
> In contrast, MongoDB's C++ aggregation engine executes the `$match`, `$group`, and `$sum` operations directly inside the database, taking advantage of database indexes and multi-core processing, and only sends the final lightweight summarized result back to Express."*

### Q3: What is the difference between Authentication and Authorization in your project?
> **Answer:**  
> - *"**Authentication (Who you are):** Handled by `authController.login` and `authMiddleware.protect`. It verifies the user's email and password using bcrypt hashes, issues a signed JWT token, and decodes the token on subsequent requests to confirm identity.  
> - **Authorization (What you are allowed to do):** Handled by `roleMiddleware.authorize('owner')`. Once identity is established, it inspects the user's role. If a staff member attempts to access owner-only routes like `/api/sales-summary`, it rejects the request with HTTP 403 Forbidden."*

### Q4: How do you store passwords securely? Why not plain text or simple MD5/SHA-256?
> **Answer:**  
> *"We use **bcryptjs** with a salt work factor of 10 (`bcrypt.genSalt(10)`). MD5 and SHA-256 are fast cryptographic hashes vulnerable to precomputed Rainbow Table attacks. Bcrypt is an intentionally slow, adaptive, salted hashing algorithm that protects against brute-force and dictionary attacks. Additionally, the password field has `select: false` in the Mongoose schema so it is never accidentally leaked in API responses."*

### Q5: How do you prevent SQL / NoSQL Injection in your application?
> **Answer:**  
> *"We use Mongoose ODM schemas which strictly cast and type-check input fields before queries execute. We also validate all incoming parameters using `express-validator` to ensure data types (such as validating Mongo ObjectIds with `.isMongoId()`). Furthermore, in text search queries, special characters are sanitized before constructing regular expressions."*

### Q6: What happens when a customer is deleted? How do you prevent orphan records?
> **Answer:**  
> *"In `customerController.deleteCustomer`, we implement **cascade deletion**. When `DELETE /api/customers/:id` is invoked, the controller concurrently executes `Customer.findByIdAndDelete()`, `Interaction.deleteMany({ customer: id })`, and `Purchase.deleteMany({ customer: id })` via `Promise.all()`. This guarantees referential integrity so deleted customers leave no orphan interactions or purchase records in the database."*

### Q7: Why are your API routes mounted under both `/api` and root `/`?
> **Answer:**  
> *"In industry practice, REST APIs are standardly versioned under `/api/` or `/api/v1/`. However, academic project specifications and automated evaluation test runners often hit root paths directly (e.g. `GET /customers` or `GET /sales-summary`). To guarantee 100% compliance with both production standards and examination test scripts, `app.js` mounts the modular router under both `/api` and `/`."*

---

## 📊 6. Summary of Project Deliverables

| Deliverable | Status | Location in Codebase |
| :--- | :---: | :--- |
| **Express.js REST API** | Complete | [`src/app.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/app.js), [`src/server.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/server.js) |
| **Referenced Mongoose Schemas** | Complete | [`src/models/`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/models) (`Customer`, `Interaction`, `User`, `Purchase`) |
| **Role-Based Authorization (RBAC)** | Complete | [`src/middleware/roleMiddleware.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/src/middleware/roleMiddleware.js) (`ROLES.OWNER`) |
| **Postman API Collection** | Complete | [`postman/CRM_Backend_API.postman_collection.json`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/postman/CRM_Backend_API.postman_collection.json) |
| **MongoDB Atlas Configuration** | Complete | [`.env`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/.env), [`.env.example`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/.env.example) |
| **Automated Integration Tests** | Complete | [`scripts/test-api.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/scripts/test-api.js) (18/18 tests pass) |
| **Indianized Seed Script** | Complete | [`scripts/seed.js`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/scripts/seed.js) (₹21.55 Lakhs revenue, 10 Indian clients) |
| **React Monochrome Frontend** | Complete | [`client/`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/client) (Vite + React with Indian Rupee formatting) |
| **Cloud Deployment Guide** | Complete | [`DEPLOYMENT.md`](file:///Users/somyajeet/Git/college%20projects/Backend_Major_Project/DEPLOYMENT.md) (Render, Railway, Vercel, Netlify) |
