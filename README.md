# MS Tutorials Platform

> **Building a Foundation in Maths and Science**  
> *"Build Strong Foundations. Learn With Clarity. Grow With Confidence."*

---

## 1. Overview
The **MS Tutorials** platform is built step-by-step from a public institutional website into a comprehensive Learning Management System (LMS) serving Students, Parents, Teachers, and Administrators.

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Production Host**: Hostinger Business Web Hosting
- **Live Domain**: `mstutorials.com`

---

## 2. Directory Structure

```text
MS-TUTORIALS/
├── public/                 # Static assets (images, logo, icons, documents)
│   ├── images/
│   ├── logo/
│   ├── icons/
│   └── documents/
├── src/                    # Frontend application (React + Vite)
│   ├── components/         # Reusable UI components
│   ├── layouts/            # Page layouts (Public, Student, Admin, etc.)
│   ├── pages/              # Public website pages
│   ├── student/            # Student portal
│   ├── parent/             # Parent portal
│   ├── teacher/            # Teacher portal
│   ├── admin/              # Admin panel
│   ├── services/           # Frontend API clients
│   ├── data/               # Static and mock data
│   ├── hooks/              # Reusable React hooks
│   ├── utils/              # Helper utilities
│   └── styles/             # Design tokens and global CSS
├── server/                 # Backend application (Node.js + Express)
│   ├── routes/             # Express API routes
│   ├── controllers/        # Request controllers
│   ├── models/             # Data models
│   ├── middleware/         # Auth, validation, and error middlewares
│   ├── services/           # Business logic services
│   └── config/             # DB, environment, and storage configuration
├── database/               # Database assets
│   ├── schema/             # Table schema definitions
│   ├── migrations/         # Migration scripts
│   └── seeds/              # Sample and baseline seeds
├── docs/                   # Project documentation & guidelines
├── tests/                  # Automated test suites
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite build and proxy configuration
└── README.md               # Project guide
```

---

## 3. Development Workflow

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
npm install
```

### Running Locally
```bash
# Start Vite Frontend dev server (http://localhost:5173)
npm run dev

# Start Node.js Express backend server (http://localhost:5000)
npm run server
```

### Building for Production
```bash
npm run build
```

---

## 4. Golden Rules for Development
1. **Inspect before modifying.**
2. **Build one feature/module at a time.**
3. **Reuse existing components.**
4. **Do not rewrite unrelated files.**
5. **Separate frontend, backend, database, and storage responsibilities.**
6. **Never expose passwords, API keys, or database credentials.**
7. **Never commit `.env`.**
8. **Test locally before committing.**
