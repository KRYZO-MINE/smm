# SMM Vault Panel

![SMM Vault social preview](public/images/og-image.svg)

The production preview route is `https://website.com/home`; Vercel rewrites it to the main frontend entry point while keeping `/index.html` available for local Express development.

Vanilla HTML/CSS/JavaScript frontend with an Express/PostgreSQL backend. The SMM Vault API key is server-only.

## Setup

1. Install Node.js 18+ and PostgreSQL.
2. Run `npm install`.
3. Create a database named `smm_panel` and run `psql "$env:DATABASE_URL" -f database/schema.sql` (or use your PostgreSQL client).
4. Copy `.env.example` to `.env`, set `DATABASE_URL` and a strong `JWT_SECRET`, then add `SMMVAULT_API_KEY` for live mode.
5. Run `npm run dev`.
6. Open `http://localhost:5000`.

Without an API key, `DEMO_MODE=true` supplies local sample services and accepts orders locally; no fake provider response is used when a real key is configured. Create the first admin by registering, then update that user's role to `admin` in PostgreSQL.

Razorpay endpoints are prepared but intentionally do not credit wallets from browser success. Add signature verification and order creation credentials before enabling live payments.


# 📦 Deployment Guide - SMM Vault Panel

Iss file mein samjhenge ke iss project ko **kaise deploy** karna hai aur **har file/folder kaha** jaata hai!

---

## 🚨 ABHI KE LIYE YE KARO (Next Steps - Immediately!)

**Status:** Frontend ✅ Done (GitHub + Vercel)

**Ab ye karo (Order mein):**

### **Day 1 - Database Setup (30 min)**

**DETAILED STEPS WITH NEON.TECH:**

```
Step 1: Account Create Karo
├─ https://neon.tech par jao
├─ "Sign Up" button click karo
├─ GitHub se login karo (or Email)
└─ Verify email

Step 2: First Project Create Karo
├─ "Create Project" button click karo (jaise screenshot mein dikh raha hai)
├─ Project name: smm_panel
├─ Region: AWS US East 2 (Ohio) - ya apka region
├─ Postgres database ON rakhna (checked)
└─ "Create project" button dabao

Step 3: Connection String Copy Karo
├─ Project dashboard khulo
├─ "Connection string" dekho
├─ "Connection URI" copy karo (milegga kuch is tarah:)
│  postgresql://user:password@host.neon.tech/smm_panel
├─ Ye string secure rakhna (IMPORTANT!)
└─ Neon dashboard mein save hai, baad mein bhi dekh sakte ho

Step 4: SQL Editor Open Karo (Neon mein)
├─ Neon Dashboard → SQL Editor (left sidebar)
├─ "New query" button click karo
└─ Ready for schema import

Step 5: Database Schema Import Karo
├─ Local mein database/schema.sql file kholo
├─ Sab code copy karo (Ctrl+A, Ctrl+C)
├─ Neon SQL Editor mein paste karo
├─ "Execute query" button dabao
└─ Schema automatically create ho jayega!

Step 6: Verify Karo
├─ Neon Dashboard → "Tables" section dekho
├─ Ye tables dikhne chahiye:
│  ├─ users
│  ├─ orders
│  ├─ transactions
│  └─ admin_logs
└─ Sab present hain? ✅ Database ready!
```

→ Database ready! ✅
```

### **Day 2 - Environment Variables (10 min)**
```
Step 1: JWT_SECRET Generate Karo
├─ Terminal/PowerShell open karo
├─ Ye command chalao:
│  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
├─ Output copy karo (long string)
└─ Ye hai aapka JWT_SECRET (keep it safe!)

Step 2: Vercel Dashboard Open Karo
├─ https://vercel.com par jao
├─ Apna project select karo (jismein frontend live hai)
├─ "Settings" tab click karo (top mein)
└─ Left sidebar mein "Environment Variables" click karo

Step 3: Add Variables (One by One)
│
├─ VARIABLE 1: DATABASE_URL
│  ├─ Name: DATABASE_URL
│  ├─ Value: (Neon se copy kiye hue connection string paste karo)
│  │        postgresql://user:password@host.neon.tech/smm_panel
│  ├─ Environments: Production, Preview, Development (sab select karo)
│  └─ "Save" button dabao
│
├─ VARIABLE 2: JWT_SECRET
│  ├─ Name: JWT_SECRET
│  ├─ Value: (Step 1 mein generate kiye hue string paste karo)
│  ├─ Environments: sab select karo
│  └─ "Save" button dabao
│
├─ VARIABLE 3: NODE_ENV
│  ├─ Name: NODE_ENV
│  ├─ Value: production
│  ├─ Environments: Production (important!)
│  └─ "Save" button dabao
│
└─ VARIABLE 4: DEMO_MODE (optional)
   ├─ Name: DEMO_MODE
   ├─ Value: false (agar SMMVAULT_API_KEY hai)
   │      OR true (agar demo mode chahiye)
   ├─ Environments: sab select karo
   └─ "Save" button dabao

Step 4: Redeploy Karo (IMPORTANT!)
├─ Vercel Dashboard → Deployments tab
├─ Recent deployment dekho
├─ "..." (three dots) click karo
├─ "Redeploy" option select karo
└─ Wait 2-3 minutes, deployment complete hone tak

Result:
├─ Environment variables set ho gaye ✅
├─ Backend ko database access mil gaya ✅
├─ Backend ready for API calls ✅
└─ Project live with new variables ✅
```

→ Backend ready! ✅
```

### **Day 3 - Backend Code Push (15 min)**
```
Step 1: .gitignore File Banao (agar nahi hai)
├─ Local project folder mein .gitignore file create karo
├─ Content:
│  .env
│  node_modules/
│  .DS_Store
│  *.log
├─ Save karo
└─ Ye file .env ko GitHub par push nahi hone dega

Step 2: Local mein Code Check Karo
├─ Verify: server/server.js exist karta hai?
├─ Verify: server/services/smmvault.js exist karta hai?
├─ Verify: server/jobs/ folder exist karta hai?
├─ Verify: database/schema.sql exist karta hai?
├─ Verify: package.json exist karta hai?
└─ Sab present hain? ✅ Continue!

Step 3: Git Status Check Karo
├─ Terminal/PowerShell open karo
├─ Project folder mein jao:
│  cd c:\Users\Admin\Documents\SMM
├─ Command chalao:
│  git status
├─ Output dekho:
│  ├─ "nothing to commit" = sab already pushed
│  ├─ "Changes not staged" = naye changes hain
│  └─ "Untracked files" = nyi files hain
└─ Next step ke liye continue

Step 4: Git Add - Sab Files Add Karo
├─ Terminal mein chalao:
│  git add .
├─ Ye kya karta hai:
│  ├─ Modified files add karta hai
│  ├─ New files add karta hai
│  ├─ .gitignore wali files exclude karta hai (.env, node_modules)
│  └─ Sab ready for commit
└─ Continue!

Step 5: Git Commit - Message Add Karo
├─ Terminal mein chalao:
│  git commit -m "Add backend server and database schema"
├─ Ye message kya convey karta hai:
│  ├─ Clear description of what's changing
│  └─ Future mein reference ke liye useful
└─ Output: "[main xxx] Add backend server..." milegga

Step 6: Git Push - GitHub par Upload Karo
├─ Terminal mein chalao:
│  git push origin main
├─ Ye kya karta hai:
│  ├─ Local commits GitHub par upload hota hai
│  ├─ Vercel automatically detect karta hai
│  ├─ Vercel automatically deployment start karta hai
│  └─ 2-3 minutes mein live ho jayega
├─ Output: "master -> master" ya "main -> main" milegga
└─ Success! ✅

Step 7: Vercel Deployment Check Karo
├─ https://vercel.com → Deployments tab
├─ Recent deployment dekho
├─ Status check karo:
│  ├─ "Ready" = ✅ Deployed successfully!
│  ├─ "Building" = ⏳ Wait 2-3 minutes
│  ├─ "Failed" = ❌ Check logs, debug
│  └─ "Error" = ❌ Contact support
├─ Green checkmark dekho? ✅ Backend live!
└─ Deployment URL copy karo (jaise https://your-project.vercel.app)
```

→ Full project live! ✅
```

### **Day 4 - Testing & Verification (20 min)**
```
Step 1: Website Open Karo
├─ Browser mein jao: https://your-project.vercel.app
├─ Page load hona chahiye in 2-3 seconds
├─ Logo aur homepage visible hona chahiye
└─ ✅ Frontend working!

Step 2: Register Karo (New Account)
├─ "Register" button click karo ya /register page par jao
├─ Form fill karo:
│  ├─ Name: Test User
│  ├─ Email: test@example.com
│  ├─ Password: TestPassword@123
│  └─ Submit button click karo
├─ Expected:
│  ├─ "Registration successful" message
│  ├─ Automatically login ho jana
│  └─ Dashboard page display hona
├─ Error? → Check:
│  ├─ DATABASE_URL set hai?
│  ├─ Database schema imported?
│  ├─ Neon connection working?
│  └─ Vercel logs check karo (Deployments → Functions)
└─ Success? ✅ Database connected!

Step 3: Login Karo (Test Account)
├─ /login page par jao ya logout karo pehle
├─ Credentials enter karo:
│  ├─ Email: test@example.com
│  ├─ Password: TestPassword@123
├─ Submit karo
├─ Expected:
│  ├─ Auth token generated hona
│  ├─ Dashboard page show hona
│  ├─ Sidebar mein user name dikhai dena
│  └─ Profile page accessible hona
├─ Error? → Check:
│  ├─ JWT_SECRET set hai Vercel mein?
│  ├─ Password correct hai?
│  ├─ User record DB mein hai?
│  └─ API logs check karo
└─ Success? ✅ Authentication working!

Step 4: Admin Access Check Karo
├─ /admin/index.html par jao
├─ Expected behavior:
│  ├─ Test user (non-admin): Redirected to dashboard
│  ├─ Admin user: Admin panel visible
├─ Admin nahi ho test user?
│  ├─ Neon SQL Editor open karo
│  ├─ Query run karo:
│     UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
│  ├─ Logout aur login karo dobara
│  └─ Ab admin panel visible hona chahiye
└─ Success? ✅ Admin access working!

Step 5: API Endpoints Test Karo
├─ Browser Console open karo (F12 → Console tab)
├─ Test registration API:
│  fetch('https://your-project.vercel.app/api/auth/register', {
│    method: 'POST',
│    headers: { 'Content-Type': 'application/json' },
│    body: JSON.stringify({
│      name: 'API Test User',
│      email: 'apitest@example.com',
│      password: 'TestPass@123'
│    })
│  }).then(r => r.json()).then(d => console.log(d))
├─ Expected response:
│  {
│    "id": 2,
│    "name": "API Test User",
│    "email": "apitest@example.com",
│    "role": "user",
│    "status": "active"
│  }
├─ Error response? → Check:
│  ├─ Database connection
│  ├─ API server running
│  ├─ Request body valid
│  └─ CORS headers set (helmet.js)
└─ Success? ✅ API working!

Step 6: Database Verify Karo (Neon Console)
├─ Neon Dashboard → SQL Editor
├─ Query run karo:
│  SELECT * FROM users;
├─ Expected:
│  ├─ Registered users dikhai deni chahiye
│  ├─ Email, name, role columns
│  ├─ Password hashed format mein (bcrypt)
│  └─ Multiple rows agar multiple users register kiye
├─ No users dikhai de rahe?
│  ├─ Database connection fail ho sakta hai
│  ├─ Schema import incomplete
│  └─ Vercel logs check karo
└─ Success? ✅ Database persistent!

Step 7: Performance Check Karo
├─ Page load time: 2-3 seconds (acceptable)
├─ API response time: < 1 second (good)
├─ Images loading: visible hona chahiye
├─ Styling applied: CSS working hona chahiye
├─ Console errors: nahi hone chahiye
└─ All good? ✅ Production ready!
```

→ Production ready! ✅

---

## ✅ FINAL CHECKLIST - All Systems Go!

```
FRONTEND ✅
├─ [ ] Homepage loads
├─ [ ] Navigation working
├─ [ ] Styling applied
├─ [ ] Images visible
└─ [ ] No console errors

BACKEND ✅
├─ [ ] API endpoints responding
├─ [ ] Register endpoint working
├─ [ ] Login endpoint working
├─ [ ] Error handling proper
└─ [ ] Logs clear (no errors)

DATABASE ✅
├─ [ ] Connection successful
├─ [ ] All tables created
├─ [ ] Data persisting
├─ [ ] Queries executing
└─ [ ] No corruption

AUTHENTICATION ✅
├─ [ ] Registration working
├─ [ ] Login working
├─ [ ] JWT tokens generated
├─ [ ] Admin role working
└─ [ ] Logout working

DEPLOYMENT ✅
├─ [ ] Environment variables set
├─ [ ] Vercel showing "Ready"
├─ [ ] GitHub synced
├─ [ ] Logs clean
└─ [ ] No warnings

SECURITY ✅
├─ [ ] .env not in GitHub
├─ [ ] JWT_SECRET strong
├─ [ ] DATABASE_URL hidden
├─ [ ] HTTPS enabled (Vercel default)
└─ [ ] Rate limiting active

🎉 ALL SYSTEMS GO! PRODUCTION LIVE! 🎉
```

---

---

## 🎯 Quick Overview (Project kya hai?)

- **Frontend**: HTML, CSS, JavaScript (`public/` folder)
- **Backend**: Node.js + Express (`server/` folder)
- **Database**: PostgreSQL (`database/schema.sql`)
- **Hosting**: Vercel (recommended) ya Heroku/VPS

---

## � DEPLOYMENT ORDER (Pehle Kya, Phir Kya?)

**Aapne jo kiya hai:**
- ✅ Frontend (HTML/CSS/JS) → GitHub + Vercel deployed

**Ab aapko ye karna hai (Step-by-Step):**

### **Priority Order:**

1. **🥇 STEP 1: Database Setup (PEHLE)**
   - **Location**: PostgreSQL hosted service (Neon.tech free)
   - **File**: `database/schema.sql`
   - **Action**: Database banao aur schema import karo
   - **Result**: Database ready with tables

2. **🥈 STEP 2: Environment Variables Set Karo (DOOSRE)**
   - **Location**: Vercel Dashboard → Settings → Environment Variables
   - **Files Needed**:
     - DATABASE_URL (from Step 1)
     - JWT_SECRET (generate new)
     - SMMVAULT_API_KEY (optional for demo)
   - **Action**: Vercel mein variables add karo
   - **Result**: Backend ko database access mil jata hai

3. **🥉 STEP 3: Backend Deploy Karo (TEESRE)**
   - **Location**: Vercel (same project as frontend)
   - **Files**:
     - `server/server.js`
     - `server/services/smmvault.js`
     - `server/jobs/orderSync.js`
     - `server/jobs/serviceSync.js`
     - `package.json`
     - `vercel.json`
   - **Action**: Push code to GitHub → Vercel auto-deploys
   - **Result**: Backend API running on Vercel

4. **✅ STEP 4: Testing Karo (LAST)**
   - **Action**: Register → Login → Order → Check admin panel
   - **Result**: Full application working

---

## 📊 WHO GOES WHERE (Sabke Liye Ghadi Assign)

| Component | Location | Files | Where Deploy | Status |
|-----------|----------|-------|--------------|--------|
| **Frontend** | `public/` | HTML, CSS, JS | Vercel static | ✅ DONE |
| **Backend** | `server/` | server.js, services, jobs | Vercel serverless | ⏳ TODO |
| **Database** | `database/` | schema.sql | PostgreSQL (Neon) | ⏳ TODO |
| **Config** | Root | package.json, vercel.json | Vercel (auto) | ⏳ TODO |
| **Environment** | `.env` | Variables | Vercel dashboard | ⏳ TODO |

---

## �📂 Project Structure & Deployment Map

### Local Development Folder → Deployment Location

```
📦 SMM Project (Local Folder)
├── public/                    → Frontend files (Static files hosted by Vercel)
│   ├── index.html            → Main homepage
│   ├── login.html            → Login page
│   ├── register.html         → Registration page
│   ├── profile.html          → User profile page
│   ├── orders.html           → Orders list page
│   ├── admin/
│   │   └── index.html        → Admin dashboard (only accessible by admin role)
│   ├── css/
│   │   └── style.css         → All styling
│   └── js/
│       ├── app.js            → Main frontend logic
│       ├── auth.js           → Authentication logic
│       └── seo.js            → SEO scripts
│
├── server/                    → Backend code (Node.js runtime)
│   ├── server.js             → Main Express server (entry point)
│   ├── services/
│   │   └── smmvault.js       → API integration with SMM Vault
│   └── jobs/
│       ├── orderSync.js      → Automatic order synchronization
│       └── serviceSync.js    → Service data synchronization
│
├── database/
│   └── schema.sql            → Database structure (PostgreSQL)
│
├── .env                       → Environment variables (⚠️ NEVER push to Git)
├── package.json              → Node.js dependencies
├── vercel.json               → Vercel deployment config
└── README.md                 → Project documentation
```

---

### **DETAILED: Neon.tech Setup (Visual Guide)**

Aapke screenshot ke according:

**Screen 1: Neon Welcome Page**
```
Website: https://neon.tech

Ye page dekhoge:
├─ "Welcome to Neon" heading
├─ "Now, let's create your first project" message
├─ Project name field (Default: "Arigato")
│  └─ Change karo to: "smm_panel"
├─ Region dropdown (Default: "AWS US East 2 (Ohio)")
│  └─ Apne region select karo (Ohio theek hai)
├─ Services section:
│  ├─ ✅ Postgres database (Enable rahega)
│  ├─ ◻ Object storage (Disable rakho)
│  ├─ ◻ Functions (Disable rakho)
│  ├─ ◻ AI gateway (Disable rakho)
│  └─ ◻ Neon Auth (Disable rakho)
└─ "Create project" button (blue button bottom-right)
```

**Screen 2: Project Created Successfully**
```
Ye page load hoga after "Create project" click:
├─ Dashboard loads
├─ Database "smm_panel" created
├─ Connection details milenge:
│  ├─ Host: xxxxxxxx.neon.tech
│  ├─ Port: 5432
│  ├─ Database: smm_panel
│  ├─ User: neondb_owner
│  └─ Password: xxxxxxxxxxxxxxxx
└─ Connection String:
   postgresql://neondb_owner:password@host.neon.tech/smm_panel
```

**Screen 3: Accessing SQL Editor**
```
Dashboard mein left sidebar:
├─ "SQL Editor" option click karo
├─ New tab khul jayega
├─ "New query" button click karo
├─ Blank SQL editor dikhai degga
└─ Yahan database/schema.sql ka code paste karo
```

**Screen 4: Running Schema**
```
SQL Editor mein:
├─ database/schema.sql file kholo (Local mein)
├─ Sab code select karo (Ctrl+A)
├─ Copy karo (Ctrl+C)
├─ Neon SQL Editor mein paste karo
├─ "Execute" or "Run query" button click karo
├─ Wait for execution...
└─ Success! ✅ Tables created
   ├─ users
   ├─ orders
   ├─ transactions
   └─ admin_logs
```

**Screen 5: Verify Tables**
```
Neon Dashboard:
├─ Left sidebar mein "Tables" or "Schema" section
├─ Ye tables visible hone chahiye:
│  ├─ public.users
│  ├─ public.orders
│  ├─ public.transactions
│  └─ public.admin_logs
├─ Click karo har table par to see columns
└─ Structure verify karo schema.sql se match
```

**Connection String Save Karo:**
```
Neon Dashboard → Connection string section
├─ "Connection URI" option select karo (not pool)
├─ String copy karo:
   postgresql://neondb_owner:xxxxx@xxxxx.neon.tech/smm_panel
├─ Safe place mein save karo (notepad mein)
├─ Vercel mein DATABASE_URL variable mein paste karogay
└─ Never share publicly! 🔐
```

---

```
YOUR COMPUTER (Local Development)
    ↓ npm run dev (testing)
    ↓
    ├─→ public/      (Frontend files)
    ├─→ server/      (Backend code)
    └─→ database/schema.sql

    ↓ git push (Upload to GitHub)
    ↓
GITHUB REPOSITORY
    ├─→ public/
    ├─→ server/
    ├─→ database/
    ├─→ package.json
    └─→ vercel.json

    ↓ Vercel auto-detects push
    ↓
PRODUCTION DEPLOYMENT
    ├─→ Vercel Hosting
    │   ├─ Frontend: https://your-project.vercel.app (public/)
    │   ├─ Backend API: /api/* (server/server.js)
    │   └─ Environment Vars: (from Vercel dashboard)
    │
    └─→ PostgreSQL Database
        ├─ Neon.tech (Cloud)
        ├─ Tables: (from database/schema.sql)
        └─ Connected via: DATABASE_URL env var
```

---

## 🎯 Kaha Dalna Hai Kya? (Complete Checklist)

### **Frontend (✅ ALREADY DONE)**
```
GitHub Repository:
├── public/             → GitHub par hai
├── package.json        → GitHub par hai
└── vercel.json         → GitHub par hai

Vercel (Live):
├── https://your-project.vercel.app/   → Frontend live hai
└── All HTML/CSS/JS served              → Working
```

---

### **Backend (⏳ NEXT: Backend deploy karo)**

**Step 1: GitHub mein Push Karo**
```
GitHub Repository (Same project):
├── server/
│   ├── server.js              ← IMPORTANT: Express server
│   ├── services/
│   │   └── smmvault.js        ← API integration
│   └── jobs/
│       ├── orderSync.js       ← Background sync
│       └── serviceSync.js     ← Service sync
├── database/
│   └── schema.sql             ← Database structure
├── .gitignore                 ← Add .env here
├── package.json               ← Already there
├── vercel.json                ← Already there
└── .env.example               ← For reference only
```

**Step 2: Vercel Redeploy Karo**
- GitHub push karte hi Vercel automatically redeploy ho jayega
- Backend API routes accessible ho jayenge: `https://your-project.vercel.app/api/*`

---

### **Database (⏳ PEHLE SE SETUP KARO - BACKEND SE PEHLE)**

**Step 1: PostgreSQL Database Banao**

**Option A: Neon.tech (Recommended - Free)**
1. https://neon.tech par signup karo (Free tier)
2. New project create karo
3. Database name set karo: `smm_panel`
4. Connection string copy karo (milegga "postgresql://...")

**Option B: Local PostgreSQL**
```bash
createdb smm_panel
psql smm_panel -f database/schema.sql
```

**Step 2: Schema Import Karo**
```bash
# Neon Console mein ya local psql mein:
psql "postgresql://user:pass@hostname/smm_panel" -f database/schema.sql

# Ya Neon dashboard se SQL editor khol kar copy-paste karo:
# database/schema.sql ki content waha paste karo
```

**Result**: Database mein ye tables ban jayenge:
- `users` (registration/login ke liye)
- `orders` (customer orders)
- `transactions` (payment history)
- `admin_logs` (admin activities)

---

### **Environment Variables (⏳ VERCEL DASHBOARD MEIN)**

**Vercel Dashboard → Settings → Environment Variables**

**Add karo ye variables:**

```
DATABASE_URL
┗ Value: postgresql://user:password@hostname:5432/smm_panel
┗ Source: Neon.tech dashboard

JWT_SECRET
┗ Value: (generate karo neeche command se)
┗ Command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

SMMVAULT_API_KEY
┗ Value: Your API key (optional for demo)
┗ If blank: DEMO_MODE=true automatically

NODE_ENV
┗ Value: production

DEMO_MODE
┗ Value: false (agar API key hai, false rakho)
┗ Value: true  (agar API key nahi hai, true rakho)
```

**How to Add in Vercel:**
1. Vercel Dashboard kholo
2. Project select karo
3. Settings tab
4. Environment Variables section
5. Add new variable (Name + Value)
6. Save karo
7. Redeploy button dabao (important!)

---

### **Files ka Distribution (After Deploy)**

```
📍 LOCAL MACHINE (Development)
├── .env                          ← Your local copy (NEVER push)
├── public/                       ← Frontend code
├── server/                       ← Backend code  
├── database/
│   └── schema.sql               ← Database structure
└── package.json

📍 GITHUB (Repository)
├── public/                       ← Frontend files
├── server/                       ← Backend files
├── database/
│   └── schema.sql               ← Uploaded
├── .gitignore                    ← Add .env
├── package.json
├── vercel.json
├── README.md
└── deployment.md                 ← This file!

📍 NEON.TECH (Database - Cloud)
├── Database: smm_panel
├── Tables: users, orders, transactions, admin_logs
└── Schema: (from database/schema.sql)

📍 VERCEL (Production)
├── Frontend API
│   ├── https://your-project.vercel.app/
│   ├── /home, /login, /register, /profile, etc.
│   └── Static files from public/
├── Backend API
│   ├── /api/auth/register
│   ├── /api/auth/login
│   ├── /api/orders/*
│   └── (All routes from server.js)
└── Environment Variables
    ├── DATABASE_URL → Connected to Neon
    ├── JWT_SECRET → Configured
    └── SMMVAULT_API_KEY → Optional
```

---

## 🚀 Deployment Process (Step-by-Step)

### **Step 1️⃣: Prepare Local Files**

Ye sab locally ready karo:

```bash
# 1. Node.js dependencies install karo
npm install

# 2. Files format check karo (optional but recommended)
npm run format:check

# 3. Local testing karo
npm run dev
# Open: http://localhost:5000
```

**Kaun-kaun si files push karni hain:**
- ✅ `public/` (sab files)
- ✅ `server/` (sab files)
- ✅ `database/schema.sql`
- ✅ `package.json`
- ✅ `vercel.json`
- ✅ `README.md`
- ❌ `.env` (NEVER! Environment variables separately set karna)
- ❌ `node_modules/` (automatically installed by Vercel)

---

### **Step 2️⃣: GitHub par Push Karo**

```bash
git init
git add .
git commit -m "Initial commit: SMM Vault Panel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smm-vault.git
git push -u origin main
```

⚠️ **Important**: `.env` file GitHub par mat push karo!

Ek `.gitignore` file banao agar nahi ho:
```
.env
node_modules/
.DS_Store
```

---

### **Step 3️⃣: Database Setup (PostgreSQL)**

**Option A: Local PostgreSQL (Development)**
```bash
# Database banao
createdb smm_panel

# Schema import karo
psql smm_panel -f database/schema.sql
```

**Option B: Hosted Database (Production - Recommended)**
- Vercel + Neon.tech use karo (free PostgreSQL)
- Ya AWS RDS, DigitalOcean Managed Database

**Database URL format:**
```
postgresql://username:password@hostname:5432/smm_panel
```

---

### **Step 4️⃣: Environment Variables Setup**

Vercel dashboard par ये variables set karo:

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `postgresql://...` | Database connection |
| `JWT_SECRET` | Strong random string (min 32 chars) | Token encryption |
| `SMMVAULT_API_KEY` | Your SMM Vault API key | SMM services integration |
| `DEMO_MODE` | `true` (dev) / `false` (prod) | Demo mode toggle |
| `NODE_ENV` | `production` | Environment type |

**JWT_SECRET generate karne ke liye:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### **Step 5️⃣: Deploy on Vercel (Easiest)**

**Method 1: Vercel CLI Se**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy karo
vercel

# Follow the prompts
```

**Method 2: Vercel Dashboard Se**
1. https://vercel.com par jao
2. "New Project" click karo
3. GitHub repository select karo
4. Environment Variables set karo (Step 4 wale)
5. "Deploy" button dabao
6. Deploy hone ka wait karo (2-5 minutes)

**After Deployment:**
```
Your project is live at: https://your-project.vercel.app
```

---

### **Step 6️⃣: Create Admin User (One Time)**

```bash
# Local development mein:
# 1. /register page par jao
# 2. Admin account create karo
# 3. PostgreSQL mein manually update karo:

psql smm_panel
UPDATE users SET role = 'admin' WHERE email = 'your_email@gmail.com';
```

**Production par (Vercel):**
```bash
# Vercel CLI se direct database access
vercel env pull
# Then run above SQL query on your Neon dashboard
```

---

## 📊 File Deployment Checklist

| File/Folder | Local Location | Deployed Location | Action |
|-------------|----------------|-------------------|--------|
| `public/` | `/public/` | Static files server | Auto-served by Vercel |
| `server.js` | `/server/server.js` | Vercel Serverless | Runs as API |
| `services/` | `/server/services/` | Vercel Serverless | Called by server.js |
| `jobs/` | `/server/jobs/` | Vercel Serverless | Background jobs |
| `schema.sql` | `/database/schema.sql` | PostgreSQL Database | Run once on DB |
| `package.json` | `/package.json` | Vercel | Dependencies install |
| `.env` | Local only | Vercel Env Vars | Environment variables |
| `vercel.json` | `/vercel.json` | Vercel Config | Deployment settings |

---

## 🔧 Deployment Configuration Breakdown

### **vercel.json (Already Configured)**

```json
{
  "rewrites": [
    { "source": "/home", "destination": "/index.html" },
    { "source": "/home/", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/images/og-image.svg",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Ye kya karta hai:**
- `/home` URL ko `/index.html` se serve karta hai
- Images ko cache karta hai (performance improve hoti hai)

---

## 🖥️ Git Commands Quick Copy-Paste

**Terminal mein ye commands chalao (Step-by-step):**

```bash
# Step 1: Project folder mein jao
cd c:\Users\Admin\Documents\SMM

# Step 2: Git status check karo
git status

# Step 3: Sab files add karo (except .env and node_modules - handled by .gitignore)
git add .

# Step 4: Commit message ke saath save karo
git commit -m "Deploy: Add backend server, database schema, and environment config"

# Step 5: GitHub par push karo
git push origin main

# Done! Vercel automatically deploy karega
```

**If error aaye:**
```bash
# Error: "fatal: not a git repository"
# Solution: GitHub repo initialize nahi hua
git init
git remote add origin https://github.com/YOUR_USERNAME/smm-vault.git
git branch -M main
git add .
git commit -m "Initial commit: Add SMM Vault backend"
git push -u origin main

# Error: "rejected... (fetch first)"
# Solution: Remote changes pull karo pehle
git pull origin main
git push origin main

# Error: ".env file being tracked"
# Solution: Remove karo git se (but not filesystem se)
git rm --cached .env
git commit -m "Remove .env from tracking"
git push origin main
```

---

## 💾 What to Save Where

| Thing | Where to Save | Format | Status |
|------|---------------|--------|--------|
| **Connection String** | Neon Dashboard + Notepad | `postgresql://...` | Secure ✅ |
| **JWT_SECRET** | Only Vercel (environment var) | 32-char hex | Secret ✅ |
| **SMMVAULT_API_KEY** | Only Vercel (environment var) | Your API key | Secret ✅ |
| **.env file** | Local only (NOT GitHub) | `.env` file | Local ✅ |
| **Database schema** | GitHub | `database/schema.sql` | Git ✅ |
| **Backend code** | GitHub | `server/` folder | Git ✅ |
| **Frontend code** | GitHub | `public/` folder | Git ✅ |

---

### **Option 1: Vercel (Recommended - Free tier available)**
- ✅ Free tier: 100GB bandwidth/month
- ✅ Auto-scaling
- ✅ GitHub integration
- ✅ Easy environment variables
- **Cost**: Free (Hobby) / $20/month (Pro)
- **Setup**: Above steps follow karo

### **Option 2: Heroku (No more free tier)**
- Database hosted: PostgreSQL add-on ($9+/month)
- **Cost**: $7/month minimum
- **Setup**: [Heroku Deployment Guide needed separately]

### **Option 3: AWS/Digital Ocean/VPS**
- Full control, more complex setup
- **Cost**: $5-50/month
- **Setup**: Docker + Nginx + PostgreSQL manually setup

---

## 📝 Folder Structure After Deployment

```
Vercel Serverless
├── Function 1: server.js (Express API)
│   ├── Serves: /api/* routes
│   ├── Connects to: PostgreSQL
│   └── Uses: services/smmvault.js, jobs/*
│
└── Function 2: Static Files (public/)
    ├── Serves: HTML, CSS, JS
    └── Path: / (root)

PostgreSQL Database (Hosted)
└── Contains: All users, orders, transactions (from schema.sql)
```

---

## ✅ Post-Deployment Checklist

Deployment ke baad ye cheque karo:

- [ ] Website open ho raha hai? (https://your-project.vercel.app)
- [ ] Registration page kaam kar raha hai?
- [ ] Login page kaam kar raha hai?
- [ ] Admin dashboard accessible hai? (only admin role se)
- [ ] Database connected hai? (check server logs in Vercel)
- [ ] Environment variables set hai? (check Vercel settings)
- [ ] Images load ho rahe hain?
- [ ] API endpoints respond kar rahe hain?

---

## � Neon + Vercel Integration Issues & Solutions

### **Problem 1: "Connection refused" Error**
```
Error Message:
  Error: connect ECONNREFUSED at TCPConnectWrap

Reason:
├─ DATABASE_URL missing in Vercel
├─ DATABASE_URL format wrong
├─ Neon database not ready
└─ Connection string expired

Solution:
1. Vercel Dashboard → Settings → Environment Variables
2. DATABASE_URL check karo:
   ├─ Format: postgresql://user:pass@host/dbname
   ├─ No typos?
   ├─ Special characters escaped? (@ ke liye use %40 if needed)
   └─ Correct Neon connection string?
3. If wrong: Neon dashboard se fresh string copy karo
4. Vercel mein update karo
5. Redeploy karo (Deployments → ... → Redeploy)
```

### **Problem 2: "permission denied for schema public" Error**
```
Error Message:
  permission denied for schema public

Reason:
├─ User permissions incorrect in Neon
├─ Schema not created
└─ SQL schema import failed

Solution:
1. Neon Dashboard → SQL Editor
2. Run query:
   SELECT current_user;
   SELECT table_name FROM information_schema.tables WHERE table_schema='public';
3. No tables? Schema import again:
   ├─ Neon SQL Editor open karo
   ├─ database/schema.sql copy-paste karo
   ├─ Execute button click karo
   └─ Wait for completion
4. Verify tables exist: 
   SELECT * FROM information_schema.tables WHERE table_schema='public';
5. If still error: Use neondb_owner role (default)
```

### **Problem 3: "Authentication failed" on Login**
```
Error Message:
  Authentication required / Invalid token

Reason:
├─ JWT_SECRET not set in Vercel
├─ JWT_SECRET wrong value
├─ Token expired
└─ Token not sent with request

Solution:
1. Vercel → Settings → Environment Variables
2. JWT_SECRET check karo:
   ├─ Present hai?
   ├─ Value 32+ characters?
   ├─ No spaces/special issues?
3. If missing: Generate new
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
4. Vercel mein set karo
5. Redeploy
6. Browser cache clear karo (Ctrl+Shift+Delete)
7. Try login again
```

### **Problem 4: "User registration fails but no error"**
```
Error Message:
  Registration doesn't work / Page hangs

Reason:
├─ API not responding
├─ Database not connected
├─ Server error silently failing
└─ CORS issues

Solution:
1. Vercel Deployments → Recent deploy click karo
2. "Functions" tab check karo for errors
3. Check error logs:
   ├─ Red errors = database connection issue
   ├─ Yellow warnings = minor issues
   └─ Green = all good
4. server.js logs check karo:
   console.error(e) should print errors
5. Neon connection test:
   ├─ Neon SQL Editor mein query run karo
   ├─ SELECT 1 query
   ├─ Result: 1 = connection OK
6. DATABASE_URL format verify karo (again)
```

### **Problem 5: "Table already exists" During Schema Import**
```
Error Message:
  relation "users" already exists

Reason:
├─ Schema already imported before
├─ Trying to import twice
└─ Database not fresh

Solution (Option A: Keep existing tables):
1. Skip schema import
2. Just set DATABASE_URL
3. Tables already available

Solution (Option B: Fresh start):
1. Neon Dashboard → Database settings
2. Delete all tables manually (if possible):
   DROP TABLE IF EXISTS admin_logs CASCADE;
   DROP TABLE IF EXISTS transactions CASCADE;
   DROP TABLE IF EXISTS orders CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
3. Then import schema.sql fresh
```

### **Problem 6: "Vercel Deployment Failed"**
```
Error Message:
  Build failed / Deployment error

Reason:
├─ package.json missing dependency
├─ Node version mismatch
├─ Environment variable issue
└─ Code syntax error

Solution:
1. Local mein test karo:
   npm install
   npm run dev
2. Check console for errors
3. Fix local errors first
4. Commit changes:
   git add .
   git commit -m "Fix deployment issues"
   git push origin main
5. Vercel automatically retry
6. If still fails: 
   ├─ Vercel Deployments → Failed deploy → Logs
   ├─ Read error message carefully
   ├─ Fix the specific issue
   ├─ Push again
```

---

## ✅ Testing Checklist by Component

### Frontend Testing
```
✓ Homepage loads
✓ All pages accessible (/home, /login, /register, /profile, /orders, /admin)
✓ CSS applied (no unstyled content)
✓ Images load
✓ Navigation works
✓ No 404 errors
✓ No console errors (F12)
```

### Backend Testing
```
✓ /api/auth/register endpoint responds
✓ /api/auth/login endpoint responds  
✓ /api/orders endpoint responds
✓ Database queries execute
✓ Error responses proper
✓ Rate limiting active
✓ CORS headers present
```

### Database Testing
```
✓ All tables exist (users, orders, transactions, admin_logs)
✓ Connection string works
✓ Data persists (register user, check DB)
✓ Queries execute without errors
✓ No NULL constraints violated
✓ Foreign keys working
```

### Security Testing
```
✓ .env file not in GitHub
✓ Passwords hashed (bcrypt)
✓ Tokens generated (JWT)
✓ Tokens expire (7 days)
✓ HTTPS enabled (Vercel default)
✓ No API keys in frontend code
✓ Rate limiting active
```

---

### **Error: Database Connection Failed**
```
Solution:
1. DATABASE_URL check karo Vercel dashboard mein
2. Connection string format: postgresql://user:pass@host:5432/db
3. Database credentials confirm karo
```

### **Error: 404 Not Found**
```
Solution:
1. public/ folder properly deployed hai?
2. vercel.json rewrites config check karo
3. File paths case-sensitive hain
```

### **Error: Authentication Failed**
```
Solution:
1. JWT_SECRET environment variable set hai?
2. Token expiry check karo (7 days)
3. Login time kaafi purana to logout-login karo
```

### **Error: API Request Failing**
```
Solution:
1. SMMVAULT_API_KEY set hai?
2. Server logs check karo (Vercel Dashboard → Functions)
3. DEMO_MODE=true set karo testing ke liye
```

---

## � Local vs Production - Side by Side

| Thing | Local (Development) | Production (Vercel) | Where/How |
|------|-----------------|-----------------|-----------|
| **Frontend Files** | `public/` folder | Vercel CDN | Automatic from GitHub |
| **Backend Server** | `localhost:5000` | `your-project.vercel.app/api` | Vercel Serverless |
| **Database** | `localhost:5432` (PostgreSQL local) | Neon.tech Cloud | Connection string in env |
| **Env Variables** | `.env` file (local) | Vercel Dashboard | Settings → Environment Variables |
| **Start Command** | `npm run dev` | Automatic | Vercel runs `npm start` |
| **API Call** | `http://localhost:5000/api/auth/login` | `https://your-project.vercel.app/api/auth/login` | Same endpoints, different host |
| **Database Query** | Direct to local DB | Through DATABASE_URL env var | Vercel connects via connection string |
| **Logs** | Terminal mein | Vercel Dashboard → Functions | check console.log() output |

---

## 📝 GitHub Push Checklist (What to upload)

**✅ INCLUDE (Push to GitHub):**
```
✅ public/                 → All frontend files
✅ server/                 → All backend files  
✅ database/schema.sql     → Database structure
✅ package.json            → Dependencies list
✅ vercel.json             → Deployment config
✅ README.md               → Documentation
✅ .gitignore              → (Add .env to ignore)
```

**❌ DO NOT INCLUDE (Never push):**
```
❌ .env                    → Your local secrets
❌ node_modules/           → Auto-installed by Vercel
❌ .DS_Store               → Mac OS files
❌ dist/                   → Build output (if any)
```

**Create .gitignore file:**
```bash
# agar nahi hai to ye banaao:
echo ".env
node_modules/
.DS_Store
*.log" > .gitignore

git add .gitignore
git commit -m "Add gitignore"
git push
```

---

## 🔐 Security Checklist

Before production deployment:

- [ ] **DATABASE_URL** set hai aur secret hai?
- [ ] **JWT_SECRET** strong hai (32+ characters)?
- [ ] **.env file** GitHub par push nahi hua?
- [ ] **SMMVAULT_API_KEY** production key set hai (ya DEMO_MODE=true)?
- [ ] **NODE_ENV** = production set hai?
- [ ] **Vercel deployment logs** mein koi error nahi?
- [ ] **Database connection** test kiya?
- [ ] **API endpoints** responsive hain?

---

## ⏱️ Timing Guide

| Task | Time | Difficulty |
|------|------|-----------|
| Database setup (Neon) | 10 min | Easy |
| Schema import | 5 min | Easy |
| Environment variables | 5 min | Easy |
| Backend code push | 10 min | Easy |
| Vercel deployment | 2-3 min | Automatic |
| Testing & verification | 15 min | Easy |
| **TOTAL** | **~40 min** | ⭐ Very Easy |

---

## �📞 Quick Reference

**Production URLs After Deployment:**
```
Website:      https://your-project.vercel.app
Admin Panel:  https://your-project.vercel.app/admin/index.html
API:          https://your-project.vercel.app/api/*
```

**Important Commands:**
```bash
npm install     # Dependencies install
npm run dev     # Local development
npm start       # Production start
vercel          # Deploy to Vercel
```

**Key Environment Variables:**
```
DATABASE_URL          (PostgreSQL connection)
JWT_SECRET            (Token security)
SMMVAULT_API_KEY      (API integration)
NODE_ENV=production   (Production mode)
```

---

**Happy Deployment! 🎉**

Kisi bhi confusion ke liye `.env.example` file check karo ya README.md padho!
