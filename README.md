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

## 🎯 Quick Overview (Project kya hai?)

- **Frontend**: HTML, CSS, JavaScript (`public/` folder)
- **Backend**: Node.js + Express (`server/` folder)
- **Database**: PostgreSQL (`database/schema.sql`)
- **Hosting**: Vercel (recommended) ya Heroku/VPS

---

## 📂 Project Structure & Deployment Map

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

## 🌍 Different Hosting Options

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

## 🐛 Troubleshooting

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

## 📞 Quick Reference

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
